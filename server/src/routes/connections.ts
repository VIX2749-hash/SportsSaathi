import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/connections - list user's connections
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const sent = await prisma.connection.findMany({
      where: { requesterId: userId },
      include: {
        recipient: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            city: true,
            points: true,
            sports: { include: { sport: true } },
          },
        },
      },
    });

    const received = await prisma.connection.findMany({
      where: { recipientId: userId },
      include: {
        requester: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            city: true,
            points: true,
            sports: { include: { sport: true } },
          },
        },
      },
    });

    // Also include activity invites
    const activityInvites = await prisma.activityInvite.findMany({
      where: { recipientId: userId, status: 'PENDING' },
      include: {
        activity: { include: { sport: true } },
        sender: { select: { displayName: true, avatarUrl: true } },
      },
    });

    res.json({ sent, received, activityInvites });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve connections' });
  }
});

// POST /api/connections - Rate limit: Cannot send > 5 pending requests (Spam prevention)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const requesterId = req.userId!;
    const { recipientId, message } = req.body;

    if (!recipientId || recipientId === requesterId) {
      res.status(400).json({ error: 'Invalid recipient ID' });
      return;
    }

    // Rate limiting: Max 5 pending requests
    const pendingCount = await prisma.connection.count({
      where: { requesterId, status: 'PENDING' },
    });

    if (pendingCount >= 5) {
      res.status(429).json({ error: 'Rate limit reached: You cannot have more than 5 pending connection requests simultaneously. Please wait for athletes to respond or invite them to an activity session instead.' });
      return;
    }

    // Check if blocked
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { userId: requesterId, blockedId: recipientId },
          { userId: recipientId, blockedId: requesterId },
        ],
      },
    });
    if (isBlocked) {
      res.status(403).json({ error: 'Cannot connect with this athlete' });
      return;
    }

    // Check existing
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, recipientId },
          { requesterId: recipientId, recipientId: requesterId },
        ],
      },
    });

    if (existing) {
      res.status(400).json({ error: `Connection request already exists with status: ${existing.status}` });
      return;
    }

    const connection = await prisma.connection.create({
      data: {
        requesterId,
        recipientId,
        message: message || 'Would love to train together!',
        status: 'PENDING',
      },
      include: {
        requester: { select: { displayName: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'CONNECTION_REQUEST',
        title: 'New Sports Connection',
        body: `${connection.requester.displayName} wants to connect for training sessions.`,
        link: '/messages',
      },
    });

    res.status(201).json({ connection });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send connection request' });
  }
});

// PATCH /api/connections/:id - Accept or Decline
router.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { status } = req.body; // ACCEPTED or DECLINED

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      res.status(400).json({ error: 'Status must be ACCEPTED or DECLINED' });
      return;
    }

    const conn = await prisma.connection.findUnique({
      where: { id: req.params.id },
      include: { requester: true, recipient: true },
    });

    if (!conn) {
      res.status(404).json({ error: 'Connection request not found' });
      return;
    }

    if (conn.recipientId !== userId) {
      res.status(403).json({ error: 'Unauthorized to update this connection' });
      return;
    }

    const updated = await prisma.connection.update({
      where: { id: req.params.id },
      data: { status },
    });

    if (status === 'ACCEPTED') {
      const existingConv = await prisma.conversation.findFirst({
        where: {
          OR: [
            { user1Id: conn.requesterId, user2Id: conn.recipientId },
            { user1Id: conn.recipientId, user2Id: conn.requesterId },
          ],
        },
      });

      if (!existingConv) {
        await prisma.conversation.create({
          data: {
            user1Id: conn.requesterId,
            user2Id: conn.recipientId,
          },
        });
      }

      await prisma.notification.create({
        data: {
          userId: conn.requesterId,
          type: 'CONNECTION_ACCEPTED',
          title: 'Sports Connection Accepted!',
          body: `${conn.recipient.displayName} accepted your connection. Say hello!`,
          link: '/messages',
        },
      });
    }

    res.json({ connection: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update connection' });
  }
});

export default router;
