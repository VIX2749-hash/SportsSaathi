import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/messages/conversations - List user's conversations
router.get('/conversations', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Populate the other user's info
    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            city: true,
          },
        });

        // Count unread
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            readAt: null,
          },
        });

        return {
          id: conv.id,
          otherUser,
          lastMessage: conv.messages[0] || null,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      })
    );

    res.json({ conversations: populated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

// GET /api/messages/conversations/:id - Retrieve messages for conversation
router.get('/conversations/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const conversationId = req.params.id;

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv || (conv.user1Id !== userId && conv.user2Id !== userId)) {
      res.status(403).json({ error: 'Access denied to this conversation' });
      return;
    }

    // Mark unread as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, displayName: true, avatarUrl: true, city: true },
    });

    res.json({ messages, otherUser });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// POST /api/messages/conversations/:id - Send message
router.post('/conversations/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const conversationId = req.params.id;
    const { body } = req.body;

    if (!body || !body.trim()) {
      res.status(400).json({ error: 'Message content cannot be empty' });
      return;
    }

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv || (conv.user1Id !== userId && conv.user2Id !== userId)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const recipientId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;

    // Check block status
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { userId, blockedId: recipientId },
          { userId: recipientId, blockedId: userId },
        ],
      },
    });

    if (isBlocked) {
      res.status(403).json({ error: 'You cannot message this user' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        body: body.trim(),
      },
      include: {
        sender: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Notify recipient
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        body: `${message.sender.displayName}: ${message.body.slice(0, 50)}...`,
        link: '/messages',
      },
    });

    res.status(201).json({ message });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// POST /api/messages/start - Initiate or find conversation by partner ID
router.post('/start', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { targetUserId } = req.body;

    if (!targetUserId || targetUserId === userId) {
      res.status(400).json({ error: 'Invalid recipient ID' });
      return;
    }

    // Verify connection exists and is ACCEPTED
    const conn = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: userId, recipientId: targetUserId, status: 'ACCEPTED' },
          { requesterId: targetUserId, recipientId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    if (!conn) {
      res.status(403).json({ error: 'You must have an accepted connection to start a direct message thread' });
      return;
    }

    let conv = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: userId },
        ],
      },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          user1Id: userId,
          user2Id: targetUserId,
        },
      });
    }

    res.json({ conversationId: conv.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

export default router;
