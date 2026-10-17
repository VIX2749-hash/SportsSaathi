import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, AuthenticatedRequest, optionalAuth } from '../middleware/auth';
import { calculateCompatibility } from '../services/matching';
import { bucketDistance } from '../services/moderation';

const router = Router();

// GET /api/partners - Discover sports partners (With bucketed distance and mandatory sports bio)
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sport, level, intensity, day, city } = req.query as Record<string, string | undefined>;

    let currentUser = null;
    if (req.userId) {
      currentUser = await prisma.user.findUnique({
        where: { id: req.userId },
        include: {
          sports: true,
          availabilities: true,
          blockedUsers: true,
          blockedBy: true,
        },
      });
    }

    const excludedIds = new Set<string>();
    if (currentUser) {
      excludedIds.add(currentUser.id);
      currentUser.blockedUsers.forEach((b) => excludedIds.add(b.blockedId));
      currentUser.blockedBy.forEach((b) => excludedIds.add(b.userId));
    }

    const allPartners = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedIds) },
        profileVisibility: { not: 'PRIVATE' },
        deletionRequestedAt: null,
        ...(city ? { city: { contains: city } } : {}),
      },
      include: {
        sports: { include: { sport: true } },
        availabilities: true,
      },
    });

    let results = allPartners.map((candidate) => {
      let compatibility = null;
      if (currentUser) {
        compatibility = calculateCompatibility(
          {
            city: currentUser.city,
            sports: currentUser.sports,
            availabilities: currentUser.availabilities,
          },
          {
            city: candidate.city,
            sports: candidate.sports,
            availabilities: candidate.availabilities,
          }
        );
      } else {
        compatibility = {
          overallPercentage: 80,
          factors: [
            { label: 'Sports Overlap', weight: 0.4, score: 0.8, detail: `${candidate.sports.length} sport(s) listed` },
            { label: 'Schedule', weight: 0.3, score: 0.75, detail: `${candidate.availabilities.length} availability slot(s)` },
          ],
          matchSummary: 'Log in to calculate your personalized training alignment.',
        };
      }

      const sameCity = currentUser ? (currentUser.city || '').toLowerCase() === (candidate.city || '').toLowerCase() : true;
      const sameArea = currentUser && currentUser.area && candidate.area ? currentUser.area.toLowerCase() === candidate.area.toLowerCase() : false;
      const distanceBucket = bucketDistance(sameCity, sameArea);

      return {
        id: candidate.id,
        displayName: candidate.displayName,
        avatarUrl: candidate.avatarUrl,
        bio: candidate.bio,
        city: candidate.city,
        area: candidate.area,
        distanceBucket, // Privacy Tier: Bucketed distance, never precise coordinates
        streakCount: candidate.streakCount,
        totalSessions: candidate.totalSessions,
        points: candidate.points,
        sports: candidate.sports,
        availabilities: candidate.availabilities,
        compatibility,
      };
    });

    if (sport && sport !== 'All') {
      results = results.filter((p) => p.sports.some((s) => s.sport.name.toLowerCase() === sport.toLowerCase()));
    }
    if (level && level !== 'All') {
      results = results.filter((p) => p.sports.some((s) => s.experienceLevel.toLowerCase() === level.toLowerCase()));
    }
    if (intensity && intensity !== 'All') {
      results = results.filter((p) => p.sports.some((s) => s.preferredIntensity.toLowerCase() === intensity.toLowerCase()));
    }
    if (day && day !== 'All') {
      results = results.filter((p) => p.availabilities.some((a) => a.dayOfWeek.toLowerCase() === day.toLowerCase()));
    }

    results.sort((a, b) => (b.compatibility?.overallPercentage || 0) - (a.compatibility?.overallPercentage || 0));

    res.json({ partners: results, total: results.length });
  } catch (err: any) {
    console.error('Error fetching partners:', err);
    res.status(500).json({ error: 'Failed to retrieve sports partners' });
  }
});

// GET /api/partners/leaderboard - Local Leaderboard for competitive participation & rewards
router.get('/leaderboard', async (req, res: Response): Promise<void> => {
  try {
    const { city } = req.query as { city?: string };

    const topAthletes = await prisma.user.findMany({
      where: {
        profileVisibility: 'PUBLIC',
        deletionRequestedAt: null,
        ...(city ? { city: { contains: city } } : {}),
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        city: true,
        area: true,
        points: true,
        streakCount: true,
        totalSessions: true,
        sports: { include: { sport: true } },
      },
      orderBy: { points: 'desc' },
      take: 20,
    });

    res.json({ leaderboard: topAthletes });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
