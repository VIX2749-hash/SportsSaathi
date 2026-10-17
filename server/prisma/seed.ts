import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Sports Saathi platform data for India...');

  // 1. Clean existing records in proper dependency order
  await prisma.equipmentReservation.deleteMany({});
  await prisma.facilityBooking.deleteMany({});
  await prisma.equipmentItem.deleteMany({});
  await prisma.sportsFacility.deleteMany({});
  await prisma.activityMessage.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.activityParticipant.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.connection.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.userSport.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.block.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.sport.deleteMany({});

  // 2. Sports Master List — Indian athletic favorites
  const sportsData = [
    { name: 'Cricket', category: 'Team', icon: 'Target' },
    { name: 'Badminton', category: 'Racket', icon: 'Activity' },
    { name: 'Football', category: 'Team', icon: 'Trophy' },
    { name: 'Running', category: 'Endurance', icon: 'Flame' },
    { name: 'Tennis', category: 'Racket', icon: 'CircleDot' },
    { name: 'Gym & Lifting', category: 'Fitness', icon: 'Dumbbell' },
    { name: 'Cycling', category: 'Endurance', icon: 'Bike' },
    { name: 'Swimming', category: 'Endurance', icon: 'Waves' },
    { name: 'Yoga', category: 'Fitness', icon: 'Smile' },
    { name: 'Basketball', category: 'Team', icon: 'Dribbble' },
    { name: 'Volleyball', category: 'Team', icon: 'Shield' },
    { name: 'Table Tennis', category: 'Racket', icon: 'Activity' },
  ];

  const sportsMap: Record<string, any> = {};
  for (const s of sportsData) {
    const created = await prisma.sport.create({ data: s });
    sportsMap[s.name] = created;
  }

  // 3. Authentic Indian Athletes / Demo Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersData = [
    {
      email: 'rohan.sharma@gmail.com',
      displayName: 'Rohan Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Cricket all-rounder (pace bowler & middle-order bat) and regular weekend 5K runner at Cubbon Park. Looking for net practice partners and weekend box cricket squads!',
      city: 'Bengaluru, India',
      area: 'Indiranagar',
      completedOnboarding: true,
      streakCount: 8,
      totalSessions: 24,
      sports: [
        { sport: 'Cricket', level: 'Advanced', goals: 'Net bowling practice & box cricket tournaments', intensity: 'High' },
        { sport: 'Running', level: 'Intermediate', goals: '5K pacing & Cubbon Park weekend morning loops', intensity: 'Moderate' },
      ],
      availabilities: [
        { day: 'Tuesday', slot: 'Evening (5-9 PM)' },
        { day: 'Thursday', slot: 'Evening (5-9 PM)' },
        { day: 'Saturday', slot: 'Early Morning (5-8 AM)' },
        { day: 'Sunday', slot: 'Morning (8-12 PM)' },
      ],
    },
    {
      email: 'ananya.iyer@gmail.com',
      displayName: 'Ananya Iyer',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Competitive badminton club player & yoga enthusiast. Always up for fast doubles rallies at Play Arena or peaceful morning vinyasa sessions.',
      city: 'Bengaluru, India',
      area: 'Koramangala',
      completedOnboarding: true,
      streakCount: 14,
      totalSessions: 42,
      sports: [
        { sport: 'Badminton', level: 'Advanced', goals: 'Competitive doubles, tournament prep & smash drills', intensity: 'High' },
        { sport: 'Yoga', level: 'Intermediate', goals: 'Flexibility, pranayama, and core balance', intensity: 'Moderate' },
      ],
      availabilities: [
        { day: 'Monday', slot: 'Evening (5-9 PM)' },
        { day: 'Wednesday', slot: 'Evening (5-9 PM)' },
        { day: 'Saturday', slot: 'Morning (8-12 PM)' },
      ],
    },
    {
      email: 'vikram.malhotra@gmail.com',
      displayName: 'Vikram Malhotra',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'Former university football striker. Organizing weekly 7v7 turf matches in Mumbai & Bandra sea face morning conditioning runs.',
      city: 'Mumbai, India',
      area: 'Bandra West',
      completedOnboarding: true,
      streakCount: 9,
      totalSessions: 31,
      sports: [
        { sport: 'Football', level: 'Advanced', goals: 'Competitive 7v7 turf leagues, team tactics', intensity: 'High' },
        { sport: 'Gym & Lifting', level: 'Intermediate', goals: 'Athletic power & functional conditioning', intensity: 'High' },
      ],
      availabilities: [
        { day: 'Tuesday', slot: 'Evening (5-9 PM)' },
        { day: 'Thursday', slot: 'Evening (5-9 PM)' },
        { day: 'Sunday', slot: 'Morning (8-12 PM)' },
      ],
    },
    {
      email: 'priya.patel@gmail.com',
      displayName: 'Priya Patel',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      bio: 'Passionate road cyclist & tennis player. Love weekend highway pacelines along Golf Course Road and club tennis rallies.',
      city: 'Delhi NCR, India',
      area: 'Gurugram CyberHub',
      completedOnboarding: true,
      streakCount: 6,
      totalSessions: 19,
      sports: [
        { sport: 'Cycling', level: 'Advanced', goals: '50km highway tempo rides, paceline cruising', intensity: 'High' },
        { sport: 'Tennis', level: 'Intermediate', goals: 'Baseline rallies & mixed doubles matches', intensity: 'Moderate' },
      ],
      availabilities: [
        { day: 'Wednesday', slot: 'Early Morning (5-8 AM)' },
        { day: 'Friday', slot: 'Early Morning (5-8 AM)' },
        { day: 'Sunday', slot: 'Early Morning (5-8 AM)' },
      ],
    },
    {
      email: 'kabir.sen@gmail.com',
      displayName: 'Kabir Sen',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      bio: 'Casual runner & badminton enthusiast in Hyderabad tech corridor. Looking for evening shuttle drills at Gachibowli indoor stadium.',
      city: 'Hyderabad, India',
      area: 'Gachibowli',
      completedOnboarding: true,
      streakCount: 5,
      totalSessions: 14,
      sports: [
        { sport: 'Badminton', level: 'Intermediate', goals: 'Evening rallying & doubles match play', intensity: 'Moderate' },
        { sport: 'Running', level: 'Beginner', goals: 'Build consistency, run 5K without stopping', intensity: 'Light' },
      ],
      availabilities: [
        { day: 'Tuesday', slot: 'Early Morning (5-8 AM)' },
        { day: 'Thursday', slot: 'Early Morning (5-8 AM)' },
        { day: 'Saturday', slot: 'Early Morning (5-8 AM)' },
      ],
    },
  ];

  const createdUsers: any[] = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        city: u.city,
        area: u.area,
        completedOnboarding: u.completedOnboarding,
        streakCount: u.streakCount,
        totalSessions: u.totalSessions,
      },
    });

    for (const sp of u.sports) {
      const sportEntity = sportsMap[sp.sport];
      if (sportEntity) {
        await prisma.userSport.create({
          data: {
            userId: user.id,
            sportId: sportEntity.id,
            experienceLevel: sp.level,
            goals: sp.goals,
            preferredIntensity: sp.intensity,
          },
        });
      }
    }

    for (const av of u.availabilities) {
      await prisma.availability.create({
        data: {
          userId: user.id,
          dayOfWeek: av.day,
          timeSlot: av.slot,
        },
      });
    }

    createdUsers.push(user);
  }

  // 4. Sample Connection between Rohan and Ananya
  await prisma.connection.create({
    data: {
      requesterId: createdUsers[0].id,
      recipientId: createdUsers[1].id,
      status: 'ACCEPTED',
      message: 'Hey Ananya! Loved your profile. Up for some badminton drills at Play Arena or a sunrise run at Cubbon Park?',
    },
  });

  // Conversation between Rohan & Ananya
  const conv = await prisma.conversation.create({
    data: {
      user1Id: createdUsers[0].id,
      user2Id: createdUsers[1].id,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderId: createdUsers[0].id,
      body: 'Hey Ananya! Are you free this Thursday evening for a shuttle session at Play Arena?',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderId: createdUsers[1].id,
      body: 'Hey Rohan! Yes definitely, Thursday 7:00 PM works great. I have Court #3 booked!',
    },
  });

  // Connection request from Vikram to Rohan (PENDING)
  await prisma.connection.create({
    data: {
      requesterId: createdUsers[2].id,
      recipientId: createdUsers[0].id,
      status: 'PENDING',
      message: 'Hey Rohan, noticed you play football too! We have a weekend 7v7 turf pickup match in Bandra when you visit Mumbai. Interested?',
    },
  });

  // 5. Seed Realistic Indian Activities
  const now = new Date();
  const tomorrowMorning = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrowMorning.setHours(6, 30, 0, 0);

  const weekendSaturday = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  weekendSaturday.setHours(17, 0, 0, 0);

  const weekendSunday = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  weekendSunday.setHours(18, 30, 0, 0);

  const activities = [
    {
      organizerId: createdUsers[0].id,
      sportId: sportsMap['Running'].id,
      title: 'Sunrise 8K Pace Run — Cubbon Park Loop',
      description: 'Conversational pace (5:30 - 5:45 min/km) two loops around lush green Cubbon Park. We do a 5-minute dynamic warm-up and finish with south Indian filter coffee & dosas at Airlines Hotel!',
      startsAt: tomorrowMorning,
      durationMinutes: 60,
      generalLocation: 'Cubbon Park, Bengaluru',
      meetingPointDetails: 'Opposite King Edward Statue entrance, near the wooden park pavilion.',
      maxParticipants: 10,
      experienceLevel: 'Intermediate',
      intensity: 'Moderate',
      cost: 0.0,
      status: 'OPEN',
      equipmentNotes: 'Running shoes, hydration bottle, optional GPS watch.',
    },
    {
      organizerId: createdUsers[1].id,
      sportId: sportsMap['Badminton'].id,
      title: 'Evening Badminton Doubles & Court Drills',
      description: 'BWF-standard wooden sprung court booked for 2 hours! Need two more players for high-energy doubles matches and rotational drills. Mavis 350 shuttles provided.',
      startsAt: weekendSaturday,
      durationMinutes: 120,
      generalLocation: 'Play Arena, Sarjapur Road, Bengaluru',
      meetingPointDetails: 'Indoor Badminton Hall, Court #3 reserved under Ananya. Non-marking gum-sole shoes mandatory!',
      maxParticipants: 4,
      experienceLevel: 'Intermediate',
      intensity: 'High',
      cost: 250.0,
      status: 'OPEN',
      equipmentNotes: 'Indoor badminton racket. Yonex Mavis 350 shuttles supplied.',
    },
    {
      organizerId: createdUsers[2].id,
      sportId: sportsMap['Football'].id,
      title: '7v7 Floodlit Turf Football Match',
      description: 'Fast-paced, friendly 7v7 soccer under floodlights. High-grade artificial turf, team bibs and match balls provided. Great sportsmanship and fun vibe guaranteed!',
      startsAt: weekendSunday,
      durationMinutes: 90,
      generalLocation: 'Ares Turf, Bandra West, Mumbai',
      meetingPointDetails: 'Pitch 1 near the players dugout and reception desk.',
      maxParticipants: 14,
      experienceLevel: 'All Levels',
      intensity: 'High',
      cost: 350.0,
      status: 'OPEN',
      equipmentNotes: 'Turf studs or flat football boots, shin guards recommended.',
    },
    {
      organizerId: createdUsers[3].id,
      sportId: sportsMap['Cycling'].id,
      title: 'Gurugram 45km Sunrise Highway Paceline',
      description: 'Group road bike paceline ride along Faridabad-Gurugram highway. Rolling average 27-30 km/h with regroup points at toll plaza. Tail-lights and helmets mandatory.',
      startsAt: weekendSaturday,
      durationMinutes: 90,
      generalLocation: 'CyberHub / Golf Course Road, Gurugram',
      meetingPointDetails: 'CyberHub Amphitheatre main plaza parking.',
      maxParticipants: 8,
      experienceLevel: 'Advanced',
      intensity: 'High',
      cost: 0.0,
      status: 'OPEN',
      equipmentNotes: 'Road bike in good tune, helmet mandatory, front/rear strobe lights.',
    },
    {
      organizerId: createdUsers[0].id,
      sportId: sportsMap['Cricket'].id,
      title: 'Shivaji Park Weekend Cricket Nets Session',
      description: 'Batting and bowling nets practice with season balls! 2 hours of solid net time with pace and spin bowlers. Bring your batting pads, gloves, and helmet.',
      startsAt: weekendSunday,
      durationMinutes: 120,
      generalLocation: 'Shivaji Park Cricket Ground, Dadar, Mumbai',
      meetingPointDetails: 'Net #4 on the south side of Shivaji Park pavilion.',
      maxParticipants: 8,
      experienceLevel: 'Intermediate',
      intensity: 'High',
      cost: 150.0,
      status: 'OPEN',
      equipmentNotes: 'White cricket kit, batting gear, season leather cricket balls.',
    },
  ];

  for (const act of activities) {
    const createdAct = await prisma.activity.create({ data: act });
    // Add organizer as confirmed participant
    await prisma.activityParticipant.create({
      data: {
        activityId: createdAct.id,
        userId: act.organizerId,
        role: 'ORGANIZER',
        status: 'CONFIRMED',
      },
    });

    // Add Ananya to Rohan's run
    if (act.title.includes('Cubbon Park')) {
      await prisma.activityParticipant.create({
        data: {
          activityId: createdAct.id,
          userId: createdUsers[1].id,
          role: 'PARTICIPANT',
          status: 'CONFIRMED',
        },
      });
      // Add a message in activity discussion
      await prisma.activityMessage.create({
        data: {
          activityId: createdAct.id,
          senderId: createdUsers[1].id,
          body: 'Looking forward to this run! Weather looks crisp and clear tomorrow morning in Cubbon Park.',
        },
      });
    }
  }

  // Initial notification for Rohan
  await prisma.notification.create({
    data: {
      userId: createdUsers[0].id,
      type: 'CONNECTION_REQUEST',
      title: 'New Connection Request',
      body: 'Vikram Malhotra sent you a connection request for Football.',
      link: '/dashboard',
    },
  });

  // 6. Seed Indian Sports Facilities
  const facility1 = await prisma.sportsFacility.create({
    data: {
      ownerId: createdUsers[1].id, // Ananya Iyer
      name: 'Play Arena Indoor Badminton & Multi-Sport Hub',
      description: 'Premium BWF-grade wooden sprung synthetic courts with shadowless tournament LED lighting, air coolers, shower rooms, and pro-stringing shop.',
      facilityType: 'Badminton Court',
      sportCategories: 'Badminton, Racket',
      photos: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
      location: 'Sarjapur Road / Bellandur, Bengaluru',
      addressDetails: 'Play Arena, Central Jail Rd, Kasavanahalli, Bengaluru, Karnataka 560035',
      amenities: 'Showers, Changing Rooms, Free Parking, Pro Shop, Mineral Water, Cafe',
      openingHours: '06:00 - 23:00',
      bookingDurationRules: '60 min slots (Max 2 consecutive hours)',
      slotDurationMinutes: 60,
      pricePerSlot: 450.0,
      requiresApproval: false,
      capacity: 8,
      status: 'ACTIVE',
    },
  });

  const facility2 = await prisma.sportsFacility.create({
    data: {
      ownerId: createdUsers[2].id, // Vikram Malhotra
      name: 'Decathlon Multi-Pitch 7v7 Football Turf',
      description: 'All-weather FIFA-certified rubber crumb turf pitch with high-powered floodlights, player dugout, and 30-foot boundary netting.',
      facilityType: 'Football Ground',
      sportCategories: 'Football, Team',
      photos: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
      location: 'Whitefield / Mahadevapura, Bengaluru',
      addressDetails: 'Decathlon Sports India, ITPL Main Rd, Whitefield, Bengaluru 560048',
      amenities: 'Floodlights, Changing Rooms, Equipment Storage, Spectator Seating, Drinking Water',
      openingHours: '06:00 - 23:30',
      bookingDurationRules: '90 min slots',
      slotDurationMinutes: 90,
      pricePerSlot: 1400.0,
      requiresApproval: true,
      capacity: 18,
      status: 'ACTIVE',
    },
  });

  const facility3 = await prisma.sportsFacility.create({
    data: {
      ownerId: createdUsers[0].id, // Rohan Sharma
      name: 'Shivaji Park Cricket Nets & Practice Cages',
      description: 'Historic cricket training turf and practice cages with natural clay pitches and astro-turf lanes. Bowling machine available upon request.',
      facilityType: 'Cricket Nets',
      sportCategories: 'Cricket, Team',
      photos: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
      location: 'Dadar / Shivaji Park, Mumbai',
      addressDetails: 'Shivaji Park Ground, Dadar West, Mumbai, Maharashtra 400028',
      amenities: 'Practice Nets, Turf Pitches, Bowling Machine, Gear Lockers, Water Point',
      openingHours: '06:30 - 19:30',
      bookingDurationRules: '60 min slots',
      slotDurationMinutes: 60,
      pricePerSlot: 350.0,
      requiresApproval: false,
      capacity: 6,
      status: 'ACTIVE',
    },
  });

  const facility4 = await prisma.sportsFacility.create({
    data: {
      ownerId: createdUsers[3].id, // Priya Patel
      name: 'Siri Fort Sports Complex Tennis & Pickleball Courts',
      description: 'Championship synthetic hard-surface outdoor tennis courts resurfaced with anti-glare finish and evening LED lighting.',
      facilityType: 'Tennis Court',
      sportCategories: 'Tennis, Racket',
      photos: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
      location: 'August Kranti Marg, Siri Fort, New Delhi',
      addressDetails: 'Siri Fort Sports Complex, Khel Gaon Marg, New Delhi 110049',
      amenities: 'Night Lighting, Locker Rooms, Pro Shop, Refreshment Canteen, Ample Parking',
      openingHours: '06:00 - 21:30',
      bookingDurationRules: '60 min slots',
      slotDurationMinutes: 60,
      pricePerSlot: 500.0,
      requiresApproval: false,
      capacity: 4,
      status: 'ACTIVE',
    },
  });

  // 7. Seed Indian Community Equipment Items
  const eq1 = await prisma.equipmentItem.create({
    data: {
      ownerId: createdUsers[1].id, // Ananya Iyer
      name: 'Yonex Astrox 88D Pro Badminton Rackets (Pair)',
      description: 'High-performance Yonex graphite rackets strung with BG65Ti at 26 lbs. Includes thermal padded kit bag and 3 extra grip tapes.',
      sportCategory: 'Badminton',
      condition: 'Excellent',
      totalQuantity: 2,
      sharingType: 'FREE_LENDING',
      pickupArea: 'Koramangala 4th Block, Bengaluru',
      pickupAddress: 'Near Sony World Signal, Koramangala',
      loanDurationRules: 'Up to 3 days loan',
      maxLoanDays: 3,
      depositRequired: 500.0,
      pricePerLoan: 0.0,
      photos: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=700&q=80',
      status: 'AVAILABLE',
    },
  });

  const eq2 = await prisma.equipmentItem.create({
    data: {
      ownerId: createdUsers[0].id, // Rohan Sharma
      name: 'SS Ton Reserve English Willow Cricket Bat + Kit',
      description: 'Handcrafted Grade 1 English Willow cricket bat with thick edges and light pickup, plus batting gloves and 2 red leather balls.',
      sportCategory: 'Cricket',
      condition: 'Excellent',
      totalQuantity: 1,
      sharingType: 'PAID_RENTAL',
      pickupArea: 'Indiranagar 100ft Road, Bengaluru',
      pickupAddress: 'Near Toit Brewpub, Indiranagar',
      loanDurationRules: '1 - 4 days',
      maxLoanDays: 4,
      depositRequired: 800.0,
      pricePerLoan: 200.0,
      photos: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
    },
  });

  const eq3 = await prisma.equipmentItem.create({
    data: {
      ownerId: createdUsers[2].id, // Vikram Malhotra
      name: 'Nivia Antrix FIFA Match Ball & Agility Markers',
      description: 'Official match ball with micro-fiber textured PU casing, dual-action air pump with gauge, and set of 20 flat agility discs.',
      sportCategory: 'Football',
      condition: 'Good',
      totalQuantity: 3,
      sharingType: 'FREE_LENDING',
      pickupArea: 'Bandra West, Mumbai',
      pickupAddress: 'Carter Road Promenade entrance',
      loanDurationRules: 'Up to 2 days',
      maxLoanDays: 2,
      depositRequired: 0.0,
      pricePerLoan: 0.0,
      photos: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=700&q=80',
      status: 'AVAILABLE',
    },
  });

  const eq4 = await prisma.equipmentItem.create({
    data: {
      ownerId: createdUsers[3].id, // Priya Patel
      name: 'Manduka Eco Cork High-Density Yoga Mats & Blocks',
      description: 'Organic natural cork and rubber anti-sweat grip mat, two high-density eva foam blocks, and cotton carrying strap.',
      sportCategory: 'Yoga',
      condition: 'Brand New',
      totalQuantity: 4,
      sharingType: 'FREE_LENDING',
      pickupArea: 'CyberHub, Gurugram',
      pickupAddress: 'DLF Phase 2 near CyberHub Metro Station',
      loanDurationRules: 'Up to 5 days',
      maxLoanDays: 5,
      depositRequired: 300.0,
      pricePerLoan: 0.0,
      photos: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=80',
      status: 'AVAILABLE',
    },
  });

  // 8. Sample Facility Booking & Equipment Reservation for Rohan Sharma
  const sampleBookingStart = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  sampleBookingStart.setHours(18, 0, 0, 0);
  const sampleBookingEnd = new Date(sampleBookingStart.getTime() + 60 * 60 * 1000);

  await prisma.facilityBooking.create({
    data: {
      facilityId: facility1.id,
      userId: createdUsers[0].id, // Rohan booked Ananya's badminton court
      startAt: sampleBookingStart,
      endAt: sampleBookingEnd,
      totalPrice: 450.0,
      status: 'CONFIRMED',
      notes: 'Badminton doubles practice session with partners',
    },
  });

  // Sample Equipment Reservation
  const resvStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const resvEnd = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  await prisma.equipmentReservation.create({
    data: {
      equipmentItemId: eq1.id,
      borrowerId: createdUsers[0].id, // Rohan borrowing Ananya's Yonex rackets
      quantity: 1,
      pickupAt: resvStart,
      expectedReturnAt: resvEnd,
      totalPrice: 0.0,
      deposit: 500.0,
      status: 'APPROVED',
      approvedBy: createdUsers[1].id,
      purposeNote: 'Playing badminton session at Play Arena',
      pickupCondition: 'Rackets and strings in immaculate condition',
    },
  });

  console.log('Database successfully seeded with authentic Indian athletes, activities, sports spaces, and gear!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
