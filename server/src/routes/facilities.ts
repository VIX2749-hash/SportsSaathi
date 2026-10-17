import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticateToken, AuthenticatedRequest, optionalAuth } from '../middleware/auth';

const router = Router();

// GET /api/facilities - Directory of sports facilities with multi-criteria filters
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sport, facilityType, search, amenity, sort } = req.query as Record<string, string | undefined>;

    const whereClause: any = {
      status: 'ACTIVE',
    };

    if (facilityType && facilityType !== 'All') {
      whereClause.facilityType = facilityType;
    }

    if (sport && sport !== 'All') {
      whereClause.sportCategories = { contains: sport };
    }

    if (amenity && amenity !== 'All') {
      whereClause.amenities = { contains: amenity };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
        { sportCategories: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { pricePerSlot: 'asc' };
    if (sort === 'price_desc') orderBy = { pricePerSlot: 'desc' };
    if (sort === 'name') orderBy = { name: 'asc' };

    const facilities = await prisma.sportsFacility.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy,
    });

    // Sanitized: Do not expose precise private address unless authorized
    const sanitized = facilities.map((f) => {
      const isOwner = req.userId === f.ownerId;
      return {
        ...f,
        addressDetails: isOwner ? f.addressDetails : undefined,
      };
    });

    res.json({ facilities: sanitized, total: sanitized.length });
  } catch (err: any) {
    console.error('Error fetching facilities:', err);
    res.status(500).json({ error: 'Failed to retrieve sports facilities' });
  }
});

// GET /api/facilities/:id - Single facility details with available slots
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facilityId = req.params.id;
    const facility = await prisma.sportsFacility.findUnique({
      where: { id: facilityId },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            city: true,
          },
        },
        availabilities: {
          where: {
            startAt: { gte: new Date() },
          },
          orderBy: { startAt: 'asc' },
          take: 50,
        },
      },
    });

    if (!facility) {
      res.status(404).json({ error: 'Sports facility not found' });
      return;
    }

    const isOwner = req.userId === facility.ownerId;
    const hasConfirmedBooking = req.userId
      ? await prisma.facilityBooking.findFirst({
          where: {
            facilityId: facility.id,
            userId: req.userId,
            status: { in: ['CONFIRMED', 'PENDING'] },
            startAt: { gte: new Date() },
          },
        })
      : null;

    res.json({
      facility: {
        ...facility,
        addressDetails: isOwner || hasConfirmedBooking ? facility.addressDetails : null,
        isOwner,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve facility details' });
  }
});

// POST /api/facilities - Create new sports space (Owner / Manager)
const createFacilitySchema = z.object({
  name: z.string().min(3, 'Facility name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  facilityType: z.string().min(2),
  sportCategories: z.string().min(2),
  photos: z.string().min(5),
  location: z.string().min(3, 'General location is required'),
  addressDetails: z.string().optional(),
  amenities: z.string().default('Lockers, Parking, Water Fountain'),
  openingHours: z.string().default('06:00 - 22:00'),
  bookingDurationRules: z.string().default('60 min slots'),
  slotDurationMinutes: z.number().min(15).max(240).default(60),
  pricePerSlot: z.number().min(0).default(0),
  requiresApproval: z.boolean().default(false),
  capacity: z.number().min(1).default(10),
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parse = createFacilitySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.errors[0].message });
      return;
    }

    const data = parse.data;
    const ownerId = req.userId!;

    const facility = await prisma.sportsFacility.create({
      data: {
        ...data,
        ownerId,
        status: 'ACTIVE',
      },
      include: {
        owner: { select: { displayName: true } },
      },
    });

    res.status(201).json({ facility });
  } catch (err: any) {
    console.error('Error creating facility:', err);
    res.status(500).json({ error: 'Failed to list sports facility' });
  }
});

// GET /api/facilities/:id/availability - Query specific date slots and avoid overlapping bookings
router.get('/:id/availability', async (req, res: Response): Promise<void> => {
  try {
    const facilityId = req.params.id;
    const { date } = req.query as { date?: string };

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Existing confirmed or pending bookings for this day
    const bookings = await prisma.facilityBooking.findMany({
      where: {
        facilityId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        startAt: { gte: startOfDay, lte: endOfDay },
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
      },
    });

    res.json({ bookings, date: startOfDay.toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch facility availability' });
  }
});

// POST /api/facilities/:id/bookings - Transaction-safe booking creation with overlap prevention
router.post('/:id/bookings', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const facilityId = req.params.id;
    const { startAt, endAt, notes } = req.body;

    if (!startAt || !endAt) {
      res.status(400).json({ error: 'Start and end time required' });
      return;
    }

    const startTime = new Date(startAt);
    const endTime = new Date(endAt);

    if (startTime.getTime() < Date.now()) {
      res.status(400).json({ error: 'Booking time must be in the future' });
      return;
    }

    if (endTime.getTime() <= startTime.getTime()) {
      res.status(400).json({ error: 'End time must be after start time' });
      return;
    }

    // Atomic transaction ensuring no overlapping bookings
    const result = await prisma.$transaction(async (tx) => {
      const facility = await tx.sportsFacility.findUnique({ where: { id: facilityId } });
      if (!facility || facility.status !== 'ACTIVE') {
        throw new Error('Sports facility is currently not available for bookings');
      }

      // Overlap check on confirmed / pending bookings
      const overlapping = await tx.facilityBooking.findFirst({
        where: {
          facilityId,
          status: { in: ['CONFIRMED', 'PENDING'] },
          AND: [
            { startAt: { lt: endTime } },
            { endAt: { gt: startTime } },
          ],
        },
      });

      if (overlapping) {
        throw new Error('Selected time slot is already booked. Please choose a different window.');
      }

      const initialStatus = facility.requiresApproval ? 'PENDING' : 'CONFIRMED';

      const booking = await tx.facilityBooking.create({
        data: {
          facilityId,
          userId,
          startAt: startTime,
          endAt: endTime,
          totalPrice: facility.pricePerSlot,
          status: initialStatus,
          notes: notes || null,
        },
        include: {
          facility: true,
        },
      });

      return { booking, facility };
    });

    // Notify owner
    const booker = await prisma.user.findUnique({ where: { id: userId }, select: { displayName: true } });
    await prisma.notification.create({
      data: {
        userId: result.facility.ownerId,
        type: 'FACILITY_BOOKING',
        title: 'New Facility Booking',
        body: `${booker?.displayName || 'An athlete'} booked ${result.facility.name} (${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`,
        link: '/my-bookings',
      },
    });

    res.status(201).json({
      message: result.booking.status === 'CONFIRMED' ? 'Booking confirmed successfully!' : 'Booking request submitted for owner approval.',
      booking: result.booking,
    });
  } catch (err: any) {
    console.error('Booking error:', err.message);
    res.status(400).json({ error: err.message || 'Failed to complete booking' });
  }
});

// GET /api/my/facility-bookings - List user's bookings & owner's incoming facility bookings
router.get('/my/facility-bookings', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const userBookings = await prisma.facilityBooking.findMany({
      where: { userId },
      include: {
        facility: {
          include: {
            owner: { select: { displayName: true, email: true } },
          },
        },
      },
      orderBy: { startAt: 'desc' },
    });

    const ownedFacilities = await prisma.sportsFacility.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    const ownedFacilityIds = ownedFacilities.map((f) => f.id);

    const incomingRequests = await prisma.facilityBooking.findMany({
      where: {
        facilityId: { in: ownedFacilityIds },
      },
      include: {
        facility: true,
        user: { select: { id: true, displayName: true, email: true, avatarUrl: true } },
      },
      orderBy: { startAt: 'desc' },
    });

    res.json({
      bookings: userBookings,
      myBookings: userBookings,
      incomingRequests,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve bookings' });
  }
});

// PATCH /api/facility-bookings/:id - Confirm, Reject, or Cancel booking
router.patch('/bookings/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const bookingId = req.params.id;
    const { status, cancellationReason } = req.body; // CONFIRMED, REJECTED, CANCELLED, COMPLETED

    const booking = await prisma.facilityBooking.findUnique({
      where: { id: bookingId },
      include: { facility: true },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const isOwner = booking.facility.ownerId === userId;
    const isBooker = booking.userId === userId;

    if (!isOwner && !isBooker) {
      res.status(403).json({ error: 'Unauthorized to manage this booking' });
      return;
    }

    // Only owner can approve/reject
    if (['CONFIRMED', 'REJECTED'].includes(status) && !isOwner) {
      res.status(403).json({ error: 'Only the facility owner can approve or reject booking requests' });
      return;
    }

    const updated = await prisma.facilityBooking.update({
      where: { id: bookingId },
      data: {
        status,
        cancellationReason: cancellationReason || booking.cancellationReason,
      },
    });

    // Notify other party
    const targetUserId = isOwner ? booking.userId : booking.facility.ownerId;
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'FACILITY_BOOKING',
        title: `Booking ${status}`,
        body: `Booking for ${booking.facility.name} was marked ${status.toLowerCase()}.`,
        link: '/my-bookings',
      },
    });

    res.json({ booking: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

export default router;
