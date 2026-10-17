import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticateToken, AuthenticatedRequest, optionalAuth } from '../middleware/auth';

const router = Router();

// GET /api/activities - Search & Filter activities & tournaments
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sport, level, intensity, search, sort, type } = req.query as Record<string, string | undefined>;

    // Fetch blocked users if authenticated
    const blockedUserIds = new Set<string>();
    if (req.userId) {
      const blocks = await prisma.block.findMany({
        where: {
          OR: [{ userId: req.userId }, { blockedId: req.userId }],
        },
      });
      blocks.forEach((b) => {
        if (b.userId === req.userId) blockedUserIds.add(b.blockedId);
        if (b.blockedId === req.userId) blockedUserIds.add(b.userId);
      });
    }

    const whereClause: any = {
      status: { not: 'CANCELLED' },
      deletedAt: null,
      organizerId: { notIn: Array.from(blockedUserIds) },
    };

    if (type && type !== 'All') {
      whereClause.activityType = type.toUpperCase();
    }
    if (sport && sport !== 'All') {
      whereClause.sport = { name: { equals: sport } };
    }
    if (level && level !== 'All') {
      whereClause.experienceLevel = { in: [level, 'All Levels'] };
    }
    if (intensity && intensity !== 'All') {
      whereClause.intensity = { equals: intensity };
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { generalLocation: { contains: search } },
      ];
    }

    let orderBy: any = { startsAt: 'asc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        sport: true,
        organizer: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            city: true,
            points: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                points: true,
              },
            },
          },
        },
      },
      orderBy,
    });

    // Sanitized: omit meetingPointDetails and checkInCode unless user is confirmed participant or host
    const sanitized = activities.map((act) => {
      const isParticipantOrHost = req.userId && (
        act.organizerId === req.userId ||
        act.participants.some((p) => p.userId === req.userId && p.status === 'CONFIRMED')
      );

      const confirmedCount = act.participants.filter((p) => p.status === 'CONFIRMED').length;

      return {
        ...act,
        confirmedCount,
        spotsRemaining: Math.max(0, act.maxParticipants - confirmedCount),
        isUserJoined: req.userId ? act.participants.some((p) => p.userId === req.userId && p.status === 'CONFIRMED') : false,
        meetingPointDetails: isParticipantOrHost ? act.meetingPointDetails : undefined,
        checkInCode: isParticipantOrHost ? act.checkInCode : undefined,
      };
    });

    res.json({ activities: sanitized, total: sanitized.length });
  } catch (err: any) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// GET /api/activities/:id - Single activity details
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const act = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: {
        sport: true,
        organizer: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            city: true,
            bio: true,
            totalSessions: true,
            streakCount: true,
            points: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                city: true,
                points: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!act || act.deletedAt) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    const isHost = req.userId === act.organizerId;
    const currentParticipant = req.userId ? act.participants.find((p) => p.userId === req.userId && p.status === 'CONFIRMED') : null;
    const canSeePrivateDetails = isHost || !!currentParticipant;

    const confirmedCount = act.participants.filter((p) => p.status === 'CONFIRMED').length;

    // Attach sender display details to activity discussion messages
    const senderIds = Array.from(new Set(act.messages.map((m) => m.senderId)));
    const senders = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, displayName: true, avatarUrl: true },
    });
    const senderMap = new Map(senders.map((s) => [s.id, s]));

    const populatedMessages = act.messages.map((m) => ({
      ...m,
      sender: senderMap.get(m.senderId) || { displayName: 'Community Athlete' },
    }));

    res.json({
      activity: {
        ...act,
        confirmedCount,
        spotsRemaining: Math.max(0, act.maxParticipants - confirmedCount),
        isUserJoined: !!currentParticipant,
        isOrganizer: isHost,
        confirmed30mPrior: currentParticipant?.confirmed30mPrior || false,
        attendanceStatus: currentParticipant?.attendanceStatus || 'UNMARKED',
        meetingPointDetails: canSeePrivateDetails ? act.meetingPointDetails : null,
        checkInCode: canSeePrivateDetails ? act.checkInCode : null,
        messages: canSeePrivateDetails ? populatedMessages : [], // Private Activity Group Chat for confirmed members only!
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch activity details' });
  }
});

// POST /api/activities - Create activity or tournament
const createActivitySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  sportId: z.string(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  activityType: z.enum(['SESSION', 'CASUAL', 'TOURNAMENT']).default('SESSION'),
  tournamentFormat: z.string().optional(),
  tournamentPrize: z.string().optional(),
  startsAt: z.string().refine((d) => !isNaN(Date.parse(d)), 'Valid future date required'),
  durationMinutes: z.number().min(15).max(480).default(60),
  generalLocation: z.string().min(3, 'General meeting area required'),
  meetingPointDetails: z.string().optional(),
  maxParticipants: z.number().min(2, 'At least 2 participants required').max(100, 'Max 100 participants').default(4),
  experienceLevel: z.string().default('All Levels'),
  intensity: z.string().default('Moderate'),
  equipmentNotes: z.string().optional(),
  cost: z.number().min(0).default(0),
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createActivitySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const organizerId = req.userId!;
    const data = parse.data;

    const startDate = new Date(data.startsAt);
    if (startDate.getTime() < Date.now() - 5 * 60 * 1000) {
      res.status(400).json({ error: 'Activity date and time must be in the future' });
      return;
    }

    // Generate random 6-digit Check-In Code for physical verification
    const generatedCode = 'MT-' + Math.floor(1000 + Math.random() * 9000);

    const newActivity = await prisma.activity.create({
      data: {
        organizerId,
        sportId: data.sportId,
        title: data.title,
        description: data.description,
        activityType: data.activityType,
        tournamentFormat: data.tournamentFormat || null,
        tournamentPrize: data.tournamentPrize || null,
        startsAt: startDate,
        durationMinutes: data.durationMinutes,
        generalLocation: data.generalLocation,
        meetingPointDetails: data.meetingPointDetails || 'Specific meeting instructions revealed to confirmed athletes.',
        maxParticipants: data.maxParticipants,
        experienceLevel: data.experienceLevel,
        intensity: data.intensity,
        equipmentNotes: data.equipmentNotes,
        cost: data.cost,
        checkInCode: generatedCode,
        status: 'OPEN',
        participants: {
          create: {
            userId: organizerId,
            role: 'ORGANIZER',
            status: 'CONFIRMED',
          },
        },
      },
      include: {
        sport: true,
        organizer: { select: { displayName: true } },
      },
    });

    // Reward organizer with +25 points for hosting sports session
    await prisma.user.update({
      where: { id: organizerId },
      data: { points: { increment: 25 } },
    });

    res.status(201).json({ activity: newActivity });
  } catch (err: any) {
    console.error('Create activity error:', err);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// POST /api/activities/:id/join - Atomic Transaction Capacity Check
router.post('/:id/join', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const activityId = req.params.id;

    // Transaction to safely prevent simultaneous overbooking race conditions
    const result = await prisma.$transaction(async (tx) => {
      const act = await tx.activity.findUnique({
        where: { id: activityId },
        include: { participants: true },
      });

      if (!act || act.deletedAt) {
        throw new Error('Activity not found');
      }

      if (act.status === 'CANCELLED') {
        throw new Error('This activity has been cancelled by the host');
      }

      const existing = act.participants.find((p) => p.userId === userId);
      if (existing && existing.status === 'CONFIRMED') {
        throw new Error('You are already registered for this session');
      }

      const confirmedCount = act.participants.filter((p) => p.status === 'CONFIRMED').length;
      if (confirmedCount >= act.maxParticipants) {
        throw new Error('Session is at full capacity (no spots remaining)');
      }

      if (existing) {
        await tx.activityParticipant.update({
          where: { id: existing.id },
          data: { status: 'CONFIRMED' },
        });
      } else {
        await tx.activityParticipant.create({
          data: {
            activityId,
            userId,
            role: 'PARTICIPANT',
            status: 'CONFIRMED',
          },
        });
      }

      // Mark FULL if cap reached
      if (confirmedCount + 1 >= act.maxParticipants) {
        await tx.activity.update({
          where: { id: activityId },
          data: { status: 'FULL' },
        });
      }

      return act;
    });

    const joinedUser = await prisma.user.findUnique({ where: { id: userId }, select: { displayName: true } });

    if (result.organizerId !== userId) {
      await prisma.notification.create({
        data: {
          userId: result.organizerId,
          type: 'ACTIVITY_JOIN',
          title: 'New Session Athlete',
          body: `${joinedUser?.displayName || 'An athlete'} joined "${result.title}"!`,
          link: `/activities/${result.id}`,
        },
      });
    }

    res.json({
      message: 'Successfully joined session',
      meetingPointDetails: result.meetingPointDetails,
      checkInCode: result.checkInCode,
    });
  } catch (err: any) {
    console.error('Join error:', err.message);
    res.status(400).json({ error: err.message || 'Failed to join session' });
  }
});

// POST /api/activities/:id/leave - Leave an activity
router.post('/:id/leave', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const activityId = req.params.id;

    const act = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { participants: true },
    });

    if (!act) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    if (act.organizerId === userId) {
      res.status(400).json({ error: 'Hosts cannot leave their own session. You can cancel or reschedule it.' });
      return;
    }

    const participant = act.participants.find((p) => p.userId === userId && p.status === 'CONFIRMED');
    if (!participant) {
      res.status(400).json({ error: 'You are not an active participant in this session' });
      return;
    }

    await prisma.activityParticipant.delete({ where: { id: participant.id } });

    if (act.status === 'FULL') {
      await prisma.activity.update({
        where: { id: activityId },
        data: { status: 'OPEN' },
      });
    }

    res.json({ message: 'You have left the session' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to leave activity' });
  }
});

// POST /api/activities/:id/confirm-30m - 30 minutes prior real-time confirmation ping ("I'm on my way!")
router.post('/:id/confirm-30m', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const activityId = req.params.id;

    const part = await prisma.activityParticipant.findUnique({
      where: { activityId_userId: { activityId, userId } },
    });

    if (!part || part.status !== 'CONFIRMED') {
      res.status(400).json({ error: 'You are not a confirmed participant in this session' });
      return;
    }

    await prisma.activityParticipant.update({
      where: { id: part.id },
      data: { confirmed30mPrior: true },
    });

    // Notify organizer that participant is on their way
    const act = await prisma.activity.findUnique({ where: { id: activityId } });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { displayName: true } });

    if (act && act.organizerId !== userId) {
      await prisma.notification.create({
        data: {
          userId: act.organizerId,
          type: 'ACTIVITY_30M_REMINDER',
          title: 'Athlete Confirmed & On the Way',
          body: `${user?.displayName} confirmed they are heading to "${act.title}"!`,
          link: `/activities/${act.id}`,
        },
      });
    }

    res.json({ message: 'Participation confirmed! Have a great workout.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to confirm attendance' });
  }
});

// POST /api/activities/:id/check-in - QR Check-In / Code verification (Prevents fake streaks)
router.post('/:id/check-in', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const activityId = req.params.id;
    const { code } = req.body;

    const act = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!act) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    if (act.checkInCode !== code?.trim().toUpperCase()) {
      res.status(400).json({ error: 'Invalid check-in code. Please scan or request the code shown by the organizer at the venue.' });
      return;
    }

    const part = await prisma.activityParticipant.findUnique({
      where: { activityId_userId: { activityId, userId } },
    });

    if (!part || part.status !== 'CONFIRMED') {
      res.status(400).json({ error: 'You are not registered for this session' });
      return;
    }

    if (part.attendanceStatus === 'ATTENDED') {
      res.status(400).json({ error: 'Attendance has already been verified for this session' });
      return;
    }

    // Mark attended & reward points (+50 points + streak boost)
    await prisma.activityParticipant.update({
      where: { id: part.id },
      data: { attendanceStatus: 'ATTENDED', checkInAt: new Date() },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: 50 },
        streakCount: { increment: 1 },
        totalSessions: { increment: 1 },
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: 'ATTENDANCE_VERIFIED',
        title: 'Check-In Verified (+50 Points)',
        body: `Your attendance at "${act.title}" is confirmed! Streak updated.`,
        link: '/dashboard',
      },
    });

    res.json({ message: 'Check-in verified! +50 points awarded.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process check-in' });
  }
});

// GET /api/activities/:id/calendar.ics - Export activity session to standard iCalendar file
router.get('/:id/calendar.ics', async (req, res: Response): Promise<void> => {
  try {
    const act = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: { sport: true, organizer: true },
    });

    if (!act) {
      res.status(404).send('Activity not found');
      return;
    }

    const start = new Date(act.startsAt);
    const end = new Date(start.getTime() + act.durationMinutes * 60000);

    const formatIcsDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sports Saathi//Sports Partner Platform//EN',
      'BEGIN:VEVENT',
      `UID:${act.id}@sportssaathi.in`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${act.sport.name}: ${act.title}`,
      `DESCRIPTION:${act.description.replace(/\n/g, ' ')}`,
      `LOCATION:${act.generalLocation}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${act.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`);
    res.send(icsContent);
  } catch (err: any) {
    res.status(500).send('Failed to generate calendar file');
  }
});

// POST /api/activities/:id/invite - Invite partner directly to activity (Anti-Dating feature!)
router.post('/:id/invite', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.userId!;
    const activityId = req.params.id;
    const { recipientId, message } = req.body;

    if (!recipientId || recipientId === senderId) {
      res.status(400).json({ error: 'Invalid recipient' });
      return;
    }

    const act = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!act) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    const invite = await prisma.activityInvite.create({
      data: {
        activityId,
        senderId,
        recipientId,
        message: message || `Hey! Would love for you to join our ${act.title} session.`,
        status: 'PENDING',
      },
    });

    const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { displayName: true } });

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'ACTIVITY_INVITE',
        title: `Sports Activity Invite`,
        body: `${sender?.displayName} invited you to join "${act.title}"!`,
        link: `/activities/${act.id}`,
      },
    });

    res.status(201).json({ message: 'Activity invite sent!', invite });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send activity invite' });
  }
});

// POST /api/activities/:id/messages - Activity Group Chat (Participants Only)
router.post('/:id/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const activityId = req.params.id;
    const { body } = req.body;

    if (!body || !body.trim()) {
      res.status(400).json({ error: 'Message body cannot be empty' });
      return;
    }

    // Confirm user is participant or organizer
    const act = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { participants: true },
    });

    if (!act) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    const isMember = act.organizerId === userId || act.participants.some((p) => p.userId === userId && p.status === 'CONFIRMED');
    if (!isMember) {
      res.status(403).json({ error: 'Activity group discussion is reserved for confirmed participants only' });
      return;
    }

    const message = await prisma.activityMessage.create({
      data: {
        activityId,
        senderId: userId,
        body: body.trim(),
      },
    });

    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, displayName: true, avatarUrl: true },
    });

    res.status(201).json({ message: { ...message, sender } });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send message to group' });
  }
});

export default router;
