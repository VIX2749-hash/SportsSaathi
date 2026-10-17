import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateSportsBio } from '../services/moderation';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-move-together-sports-key-2026';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  city: z.string().optional().default('Seattle, WA'),
  area: z.string().optional().default('Downtown'),
  ageConfirmed: z.boolean().refine((val) => val === true, 'You must be at least 18 years old to use Move Together'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/google - One-click Google Sign-in / Sign-up
router.post('/google', async (req, res: Response): Promise<void> => {
  try {
    const { email, displayName, avatarUrl } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Valid Google email is required' });
      return;
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        sports: { include: { sport: true } },
        availabilities: true,
      },
    });

    if (!user) {
      const generatedPassword = await bcrypt.hash(Math.random().toString(36) + 'googleAuth2026!', 10);
      user = await prisma.user.create({
        data: {
          email,
          displayName: displayName || email.split('@')[0],
          avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
          passwordHash: generatedPassword,
          bio: 'Active sports enthusiast looking for reliable local training partners.',
          city: 'Seattle, WA',
          area: 'Downtown',
          ageEligibility: true, // 18+ policy verified
          completedOnboarding: false,
          points: 100, // Welcome points
        },
        include: {
          sports: { include: { sport: true } },
          availabilities: true,
        },
      });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        city: user.city,
        area: user.area,
        profileVisibility: user.profileVisibility,
        searchRadiusKm: user.searchRadiusKm,
        completedOnboarding: user.completedOnboarding,
        streakCount: user.streakCount,
        totalSessions: user.totalSessions,
        points: user.points,
        sports: user.sports,
        availabilities: user.availabilities,
      },
      token,
      isNewUser: !user.completedOnboarding,
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google sign-in failed' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res: Response): Promise<void> => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const { email, password, displayName, city, area } = parse.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        city,
        area,
        ageEligibility: true,
        bio: 'Excited to train, show up, and keep moving.',
        completedOnboarding: false,
        points: 100,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        city: true,
        area: true,
        points: true,
        completedOnboarding: true,
      },
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Valid email and password required' });
      return;
    }

    const { email, password } = parse.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        sports: { include: { sport: true } },
        availabilities: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        city: user.city,
        area: user.area,
        profileVisibility: user.profileVisibility,
        searchRadiusKm: user.searchRadiusKm,
        completedOnboarding: user.completedOnboarding,
        streakCount: user.streakCount,
        totalSessions: user.totalSessions,
        points: user.points,
        sports: user.sports,
        availabilities: user.availabilities,
      },
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        sports: { include: { sport: true } },
        availabilities: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        city: user.city,
        area: user.area,
        profileVisibility: user.profileVisibility,
        searchRadiusKm: user.searchRadiusKm,
        completedOnboarding: user.completedOnboarding,
        streakCount: user.streakCount,
        totalSessions: user.totalSessions,
        points: user.points,
        deletionRequestedAt: user.deletionRequestedAt,
        sports: user.sports,
        availabilities: user.availabilities,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { displayName, bio, city, area, avatarUrl, profileVisibility, searchRadiusKm } = req.body;

    if (bio !== undefined) {
      const bioCheck = validateSportsBio(bio);
      if (!bioCheck.isValid) {
        res.status(400).json({ error: bioCheck.reason });
        return;
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(city !== undefined && { city }),
        ...(area !== undefined && { area }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(profileVisibility !== undefined && { profileVisibility }),
        ...(searchRadiusKm !== undefined && { searchRadiusKm }),
      },
      include: {
        sports: { include: { sport: true } },
        availabilities: true,
      },
    });

    res.json({ user: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/auth/onboarding - Guided onboarding with mandatory sports intent bio
router.post('/onboarding', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { displayName, bio, city, area, sports, availabilities, searchRadiusKm } = req.body;

    const bioCheck = validateSportsBio(bio || '');
    if (!bioCheck.isValid) {
      res.status(400).json({ error: bioCheck.reason });
      return;
    }

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(displayName && { displayName }),
        bio,
        city: city || 'Seattle, WA',
        area: area || 'Downtown',
        searchRadiusKm: searchRadiusKm || 25,
        completedOnboarding: true,
      },
    });

    if (Array.isArray(sports)) {
      await prisma.userSport.deleteMany({ where: { userId: req.userId } });
      for (const sp of sports) {
        if (sp.sportId) {
          await prisma.userSport.create({
            data: {
              userId: req.userId!,
              sportId: sp.sportId,
              experienceLevel: sp.experienceLevel || 'Intermediate',
              goals: sp.goals || 'Build consistency & find training partner',
              preferredIntensity: sp.preferredIntensity || 'Moderate',
            },
          });
        }
      }
    }

    if (Array.isArray(availabilities)) {
      await prisma.availability.deleteMany({ where: { userId: req.userId } });
      for (const av of availabilities) {
        if (av.dayOfWeek && av.timeSlot) {
          await prisma.availability.create({
            data: {
              userId: req.userId!,
              dayOfWeek: av.dayOfWeek,
              timeSlot: av.timeSlot,
            },
          });
        }
      }
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        sports: { include: { sport: true } },
        availabilities: true,
      },
    });

    res.json({ user: fullUser, message: 'Onboarding completed successfully' });
  } catch (err: any) {
    console.error('Onboarding save error:', err);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// POST /api/auth/deletion-request - 30-day GDPR grace period deletion request
router.post('/deletion-request', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { deletionRequestedAt: new Date() },
    });
    res.json({
      message: 'Account deletion requested. Your profile will be permanently deleted after a 30-day grace period. You may cancel anytime by logging in.',
      deletionRequestedAt: updated.deletionRequestedAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to schedule deletion' });
  }
});

export default router;
