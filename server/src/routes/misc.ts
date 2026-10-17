import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications - List user's notifications
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, readAt: null },
    });

    res.json({ notifications, unreadCount });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// PATCH /api/notifications/:id/read - Mark one notification read
router.patch('/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId },
      data: { readAt: new Date() },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark read' });
  }
});

// POST /api/notifications/read-all - Mark all read
router.post('/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark all read' });
  }
});

// POST /api/safety/report - Report user or activity (With anti-dating / harassment flags)
router.post('/report', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const reporterId = req.userId!;
    const { reportedUserId, activityId, category, description } = req.body;

    if (!category || !description) {
      res.status(400).json({ error: 'Report category and description are required' });
      return;
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedUserId: reportedUserId || null,
        activityId: activityId || null,
        category,
        description: description.trim(),
        status: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Safety report submitted for moderation review. Thank you for protecting our athletic community.', report });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// GET /api/safety/reports/queue - Moderation Queue Review (Admin / Moderator endpoint)
router.get('/reports/queue', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, displayName: true, email: true } },
        reportedUser: { select: { id: true, displayName: true, email: true } },
        activity: { select: { id: true, title: true } },
      },
      take: 50,
    });
    res.json({ queue: reports });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
});

// POST /api/blocks - Block a user (Returns 201 Created as specified)
router.post('/blocks', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { blockedUserId } = req.body;

    if (!blockedUserId || blockedUserId === userId) {
      res.status(400).json({ error: 'Invalid user to block' });
      return;
    }

    const block = await prisma.block.upsert({
      where: {
        userId_blockedId: { userId, blockedId: blockedUserId },
      },
      update: {},
      create: {
        userId,
        blockedId: blockedUserId,
      },
    });

    // Remove active connections
    await prisma.connection.deleteMany({
      where: {
        OR: [
          { requesterId: userId, recipientId: blockedUserId },
          { requesterId: blockedUserId, recipientId: userId },
        ],
      },
    });

    res.status(201).json({ message: 'User blocked. They cannot view your activities, invite you, or message you.', block });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// GET /api/blocks - Get user's blocked list
router.get('/blocks', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const blocks = await prisma.block.findMany({
      where: { userId },
      include: {
        blocked: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });
    res.json({ blocks });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve blocks' });
  }
});

// GET /api/sports - Get sports list
router.get('/sports', async (_req, res: Response): Promise<void> => {
  try {
    const sports = await prisma.sport.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ sports });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch sports' });
  }
});

export default router;
