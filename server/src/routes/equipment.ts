import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticateToken, AuthenticatedRequest, optionalAuth } from '../middleware/auth';

const router = Router();

// GET /api/equipment - Community equipment library with multi-criteria filters
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sport, condition, sharingType, search, sort } = req.query as Record<string, string | undefined>;

    const whereClause: any = {
      status: 'AVAILABLE',
    };

    if (sport && sport !== 'All') {
      whereClause.sportCategory = { contains: sport };
    }

    if (condition && condition !== 'All') {
      whereClause.condition = condition;
    }

    if (sharingType && sharingType !== 'All') {
      whereClause.sharingType = sharingType;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { pickupArea: { contains: search } },
        { sportCategory: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'quantity') orderBy = { totalQuantity: 'desc' };
    if (sort === 'name') orderBy = { name: 'asc' };

    const items = await prisma.equipmentItem.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            city: true,
          },
        },
        reservations: {
          where: {
            status: { in: ['APPROVED', 'READY_FOR_PICKUP', 'BORROWED'] },
            expectedReturnAt: { gte: new Date() },
          },
          select: {
            quantity: true,
          },
        },
      },
      orderBy,
    });

    // Calculate live available quantity (totalQuantity - currently reserved)
    const sanitized = items.map((item) => {
      const activeReservedQty = item.reservations.reduce((sum, r) => sum + r.quantity, 0);
      const availableQty = Math.max(0, item.totalQuantity - activeReservedQty);
      const isOwner = req.userId === item.ownerId;

      return {
        ...item,
        availableQuantity: availableQty,
        pickupAddress: isOwner ? item.pickupAddress : undefined, // Protected privacy tier
      };
    });

    res.json({ equipment: sanitized, total: sanitized.length });
  } catch (err: any) {
    console.error('Error fetching equipment:', err);
    res.status(500).json({ error: 'Failed to retrieve equipment items' });
  }
});

// GET /api/equipment/:id - Single equipment item details with live inventory verification
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const item = await prisma.equipmentItem.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            city: true,
            points: true,
          },
        },
        reservations: {
          where: {
            status: { in: ['APPROVED', 'READY_FOR_PICKUP', 'BORROWED'] },
            expectedReturnAt: { gte: new Date() },
          },
          select: {
            id: true,
            quantity: true,
            pickupAt: true,
            expectedReturnAt: true,
          },
        },
      },
    });

    if (!item) {
      res.status(404).json({ error: 'Equipment item not found' });
      return;
    }

    const isOwner = req.userId === item.ownerId;
    const activeReservedQty = item.reservations.reduce((sum, r) => sum + r.quantity, 0);
    const availableQty = Math.max(0, item.totalQuantity - activeReservedQty);

    // Borrower check for approved reservation to view exact pickup instructions
    const approvedReservation = req.userId
      ? await prisma.equipmentReservation.findFirst({
          where: {
            equipmentItemId: item.id,
            borrowerId: req.userId,
            status: { in: ['APPROVED', 'READY_FOR_PICKUP', 'BORROWED'] },
          },
        })
      : null;

    res.json({
      equipment: {
        ...item,
        availableQuantity: availableQty,
        pickupAddress: isOwner || approvedReservation ? item.pickupAddress : null,
        isOwner,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch equipment details' });
  }
});

// POST /api/equipment - Create new equipment item
const createEquipmentSchema = z.object({
  name: z.string().min(3, 'Equipment name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  sportCategory: z.string().min(2),
  condition: z.enum(['Brand New', 'Excellent', 'Good', 'Fair']).default('Good'),
  totalQuantity: z.number().min(1).default(1),
  sharingType: z.enum(['FREE_LENDING', 'PAID_RENTAL', 'COMMUNITY_POOL']).default('FREE_LENDING'),
  pickupArea: z.string().min(3, 'Pickup neighborhood or area is required'),
  pickupAddress: z.string().optional(),
  loanDurationRules: z.string().default('Up to 3 days'),
  maxLoanDays: z.number().min(1).max(30).default(3),
  depositRequired: z.number().min(0).default(0),
  pricePerLoan: z.number().min(0).default(0),
  photos: z.string().min(5),
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createEquipmentSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const ownerId = req.userId!;
    const item = await prisma.equipmentItem.create({
      data: {
        ...parse.data,
        ownerId,
        status: 'AVAILABLE',
      },
    });

    res.status(201).json({ equipment: item });
  } catch (err: any) {
    console.error('Error creating equipment item:', err);
    res.status(500).json({ error: 'Failed to list equipment item' });
  }
});

// POST /api/equipment/:id/reservations (or /reserve) - Request to borrow equipment with atomic inventory safety
const handleReservationRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const borrowerId = req.userId!;
    const equipmentItemId = req.params.id;
    const { pickupAt, startAt, expectedReturnAt, endAt, quantity, purposeNote, notes } = req.body;

    const requestedQty = Number(quantity) || 1;
    if (requestedQty < 1) {
      res.status(400).json({ error: 'Quantity must be at least 1' });
      return;
    }

    const pickupDate = new Date(pickupAt || startAt);
    const returnDate = new Date(expectedReturnAt || endAt);

    if (pickupDate.getTime() < Date.now() - 5 * 60 * 1000) {
      res.status(400).json({ error: 'Pickup date must be in the future' });
      return;
    }

    if (returnDate.getTime() <= pickupDate.getTime()) {
      res.status(400).json({ error: 'Return date must be after pickup date' });
      return;
    }

    // Atomic transaction ensuring inventory quantity integrity
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.equipmentItem.findUnique({
        where: { id: equipmentItemId },
        include: {
          reservations: {
            where: {
              status: { in: ['APPROVED', 'READY_FOR_PICKUP', 'BORROWED'] },
              AND: [
                { pickupAt: { lt: returnDate } },
                { expectedReturnAt: { gt: pickupDate } },
              ],
            },
          },
        },
      });

      if (!item || item.status !== 'AVAILABLE') {
        throw new Error('Equipment item is currently unavailable');
      }

      if (item.ownerId === borrowerId) {
        throw new Error('You cannot borrow your own equipment');
      }

      const activeReservedQty = item.reservations.reduce((sum, r) => sum + r.quantity, 0);
      const remainingInventory = item.totalQuantity - activeReservedQty;

      if (remainingInventory < requestedQty) {
        throw new Error(`Insufficient inventory: only ${remainingInventory} unit(s) available for the requested period.`);
      }

      const reservation = await tx.equipmentReservation.create({
        data: {
          equipmentItemId,
          borrowerId,
          quantity: requestedQty,
          pickupAt: pickupDate,
          expectedReturnAt: returnDate,
          totalPrice: item.pricePerLoan,
          deposit: item.depositRequired,
          status: 'PENDING',
          purposeNote: purposeNote || null,
        },
        include: {
          equipmentItem: true,
        },
      });

      return { reservation, item };
    });

    // Notify owner
    const borrower = await prisma.user.findUnique({ where: { id: borrowerId }, select: { displayName: true } });
    await prisma.notification.create({
      data: {
        userId: result.item.ownerId,
        type: 'EQUIPMENT_RESERVATION',
        title: 'New Equipment Borrow Request',
        body: `${borrower?.displayName || 'An athlete'} requested to borrow ${result.item.name} (${requestedQty} unit).`,
        link: '/my-bookings',
      },
    });

    res.status(201).json({
      message: 'Reservation request submitted for owner confirmation!',
      reservation: result.reservation,
    });
  } catch (err: any) {
    console.error('Reservation error:', err.message);
    res.status(400).json({ error: err.message || 'Failed to submit reservation' });
  }
};

router.post('/:id/reservations', authenticateToken, handleReservationRequest);
router.post('/:id/reserve', authenticateToken, handleReservationRequest);

// GET /api/my/equipment-reservations - List borrower's reservations & owner's incoming borrowing requests
router.get('/my/equipment-reservations', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const myBorrowings = await prisma.equipmentReservation.findMany({
      where: { borrowerId: userId },
      include: {
        equipmentItem: {
          include: {
            owner: { select: { displayName: true, email: true } },
          },
        },
        handoverEvents: true,
      },
      orderBy: { pickupAt: 'desc' },
    });

    const ownedItems = await prisma.equipmentItem.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    const ownedItemIds = ownedItems.map((i) => i.id);

    const incomingRequests = await prisma.equipmentReservation.findMany({
      where: {
        equipmentItemId: { in: ownedItemIds },
      },
      include: {
        equipmentItem: true,
        borrower: { select: { id: true, displayName: true, email: true, avatarUrl: true } },
        handoverEvents: true,
      },
      orderBy: { pickupAt: 'desc' },
    });

    res.json({
      reservations: myBorrowings,
      myBorrowings,
      incomingRequests,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve equipment reservations' });
  }
});

// PATCH /api/equipment-reservations/:id - Approve or Reject request
router.patch('/reservations/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const reservationId = req.params.id;
    const { status } = req.body; // APPROVED, REJECTED, CANCELLED

    const resv = await prisma.equipmentReservation.findUnique({
      where: { id: reservationId },
      include: { equipmentItem: true },
    });

    if (!resv) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }

    const isOwner = resv.equipmentItem.ownerId === userId;
    const isBorrower = resv.borrowerId === userId;

    if (!isOwner && !isBorrower) {
      res.status(403).json({ error: 'Unauthorized to manage this reservation' });
      return;
    }

    if (['APPROVED', 'REJECTED'].includes(status) && !isOwner) {
      res.status(403).json({ error: 'Only the equipment owner can approve or reject borrowing requests' });
      return;
    }

    const updated = await prisma.equipmentReservation.update({
      where: { id: reservationId },
      data: {
        status: status === 'APPROVED' ? 'READY_FOR_PICKUP' : status,
        approvedBy: isOwner ? userId : undefined,
      },
    });

    const targetUser = isOwner ? resv.borrowerId : resv.equipmentItem.ownerId;
    await prisma.notification.create({
      data: {
        userId: targetUser,
        type: 'EQUIPMENT_RESERVATION',
        title: `Equipment Request ${status}`,
        body: `Your reservation for ${resv.equipmentItem.name} was marked ${status.toLowerCase()}.`,
        link: '/my-bookings',
      },
    });

    res.json({ reservation: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update reservation status' });
  }
});

// POST /api/equipment-reservations/:id/handover - Record physical handover
router.post('/reservations/:id/handover', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const reservationId = req.params.id;
    const { conditionNotes, evidenceUrls } = req.body;

    const resv = await prisma.equipmentReservation.findUnique({
      where: { id: reservationId },
      include: { equipmentItem: true },
    });

    if (!resv) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }

    if (resv.equipmentItem.ownerId !== userId) {
      res.status(403).json({ error: 'Only the equipment owner can confirm handover' });
      return;
    }

    await prisma.$transaction([
      prisma.equipmentReservation.update({
        where: { id: reservationId },
        data: {
          status: 'BORROWED',
          pickupCondition: conditionNotes || 'Good condition at handover',
        },
      }),
      prisma.equipmentHandoverEvent.create({
        data: {
          reservationId,
          eventType: 'PICKUP_HANDOVER',
          recordedBy: userId,
          conditionNotes: conditionNotes || 'Handover completed by owner.',
          evidenceUrls: evidenceUrls || null,
        },
      }),
    ]);

    await prisma.notification.create({
      data: {
        userId: resv.borrowerId,
        type: 'EQUIPMENT_RESERVATION',
        title: 'Equipment Picked Up',
        body: `You have picked up ${resv.equipmentItem.name}. Expected return date: ${resv.expectedReturnAt.toLocaleDateString()}.`,
        link: '/my-bookings',
      },
    });

    res.json({ message: 'Handover recorded successfully. Status updated to BORROWED.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record handover' });
  }
});

// POST /api/equipment-reservations/:id/return - Confirm return, verify condition, restore inventory
router.post('/reservations/:id/return', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const reservationId = req.params.id;
    const { conditionNotes, damageReported, evidenceUrls } = req.body;

    const resv = await prisma.equipmentReservation.findUnique({
      where: { id: reservationId },
      include: { equipmentItem: true },
    });

    if (!resv) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }

    if (resv.equipmentItem.ownerId !== userId) {
      res.status(403).json({ error: 'Only the equipment owner can verify and confirm return' });
      return;
    }

    const eventType = damageReported ? 'DAMAGE_REPORT' : 'RETURN_RECEIPT';

    await prisma.$transaction([
      prisma.equipmentReservation.update({
        where: { id: reservationId },
        data: {
          status: 'RETURNED',
          actualReturnAt: new Date(),
          returnCondition: conditionNotes || (damageReported ? 'Returned with damage/wear' : 'Returned in good condition'),
        },
      }),
      prisma.equipmentHandoverEvent.create({
        data: {
          reservationId,
          eventType,
          recordedBy: userId,
          conditionNotes: conditionNotes || 'Item returned to owner.',
          evidenceUrls: evidenceUrls || null,
        },
      }),
      // Award community points to borrower for returning equipment on time
      prisma.user.update({
        where: { id: resv.borrowerId },
        data: { points: { increment: 20 } },
      }),
    ]);

    await prisma.notification.create({
      data: {
        userId: resv.borrowerId,
        type: 'EQUIPMENT_RESERVATION',
        title: 'Return Confirmed (+20 Points)',
        body: `Your return of ${resv.equipmentItem.name} has been confirmed by the owner. Thank you!`,
        link: '/my-bookings',
      },
    });

    res.json({ message: 'Return confirmed and inventory restored! Borrower awarded +20 points.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process return' });
  }
});

export default router;
