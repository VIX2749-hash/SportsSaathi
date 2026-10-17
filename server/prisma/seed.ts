import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sports and initial platform data...');

  // 1. Clean existing records if any
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

  // 2. Sports Master List
  const sportsData = [
    { name: 'Running', category: 'Endurance', icon: 'Flame' },
    { name: 'Badminton', category: 'Racket', icon: 'Activity' },
    { name: 'Tennis', category: 'Racket', icon: 'CircleDot' },
    { name: 'Football', category: 'Team', icon: 'Trophy' },
    { name: 'Basketball', category: 'Team', icon: 'Dribbble' },
    { name: 'Cycling', category: 'Endurance', icon: 'Bike' },
    { name: 'Gym & Lifting', category: 'Fitness', icon: 'Dumbbell' },
    { name: 'Swimming', category: 'Endurance', icon: 'Waves' },
    { name: 'Hiking', category: 'Outdoor', icon: 'Compass' },
    { name: 'Yoga', category: 'Fitness', icon: 'Smile' },
    { name: 'Volleyball', category: 'Team', icon: 'Shield' },
    { name: 'Cricket', category: 'Team', icon: 'Target' },
  ];

  const sportsMap: Record<string, any> = {};
  for (const s of sportsData) {
    const created = await prisma.sport.create({ data: s });
    sportsMap[s.name] = created;
  }

  // 3. Realistic Demo Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersData = [
    {
      email: 'alex.rivera@example.com',
      displayName: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Marathon trainee & casual tennis enthusiast. Looking for early morning interval partners and weekend rally sessions.',
      city: 'Seattle, WA',
      area: 'Green Lake / Ballard',
      completedOnboarding: true,
      streakCount: 6,
      totalSessions: 18,
      sports: [
        { sport: 'Running', level: 'Advanced', goals: 'Train for a marathon, Improve pacing', intensity: 'High' },
        { sport: 'Tennis', level: 'Intermediate', goals: 'Play socially, Improve backhand rally', intensity: 'Moderate' },
      ],
      availabilities: [
        { day: 'Tuesday', slot: 'Early Morning (5-8 AM)' },
        { day: 'Thursday', slot: 'Early Morning (5-8 AM)' },
        { day: 'Saturday', slot: 'Morning (8-12 PM)' },
        { day: 'Sunday', slot: 'Morning (8-12 PM)' },
      ],
    },
    {
      email: 'sarah.chen@example.com',
      displayName: 'Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      bio: 'Badminton club player & weekend trail runner. Always excited for doubles matches or hilly trail 10ks!',
      city: 'Seattle, WA',
      area: 'Capitol Hill',
      completedOnboarding: true,
      streakCount: 12,
      totalSessions: 34,
      sports: [
        { sport: 'Badminton', level: 'Advanced', goals: 'Competitive doubles, tournament prep', intensity: 'High' },
        { sport: 'Running', level: 'Intermediate', goals: 'Stay fit, trail exploration', intensity: 'Moderate' },
      ],
      availabilities: [
        { day: 'Monday', slot: 'Evening (5-9 PM)' },
        { day: 'Wednesday', slot: 'Evening (5-9 PM)' },
        { day: 'Saturday', slot: 'Morning (8-12 PM)' },
      ],
    },
    {
      email: 'marcus.vance@example.com',
      displayName: 'Marcus Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Former collegiate soccer player, now organizing friendly pickup football and strength circuits.',
      city: 'Seattle, WA',
      area: 'South Lake Union',
      completedOnboarding: true,
      streakCount: 4,
      totalSessions: 22,
      sports: [
        { sport: 'Football', level: 'Advanced', goals: 'Competitive matches, team chemistry', intensity: 'High' },
        { sport: 'Gym & Lifting', level: 'Intermediate', goals: 'Strength hypertrophy & conditioning', intensity: 'High' },
      ],
      availabilities: [
        { day: 'Tuesday', slot: 'Evening (5-9 PM)' },
        { day: 'Thursday', slot: 'Evening (5-9 PM)' },
        { day: 'Sunday', slot: 'Afternoon (12-5 PM)' },
      ],
    },
    {
      email: 'elena.rostova@example.com',
      displayName: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      bio: 'Beginner runner & yoga practitioner wanting gentle accountability. Pace is 6:30 min/km, conversational & friendly!',
      city: 'Seattle, WA',
      area: 'Fremont',
      completedOnboarding: true,
      streakCount: 3,
      totalSessions: 9,
      sports: [
        { sport: 'Running', level: 'Beginner', goals: 'Build consistency, run a 5K without stopping', intensity: 'Light' },
        { sport: 'Yoga', level: 'Intermediate', goals: 'Flexibility and core balance', intensity: 'Moderate' },
      ],
      availabilities: [
        { day: 'Wednesday', slot: 'Morning (8-12 PM)' },
        { day: 'Friday', slot: 'Morning (8-12 PM)' },
        { day: 'Sunday', slot: 'Morning (8-12 PM)' },
      ],
    },
    {
      email: 'david.kim@example.com',
      displayName: 'David Kim',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'Cycling enthusiast & weekend hiker. Road bikes on weekdays (30-40km), Cascade hikes on Saturdays.',
      city: 'Seattle, WA',
      area: 'Queen Anne',
      completedOnboarding: true,
      streakCount: 8,
      totalSessions: 27,
      sports: [
        { sport: 'Cycling', level: 'Advanced', goals: 'Tempo paceline rides, climb elevation', intensity: 'High' },
        { sport: 'Hiking', level: 'Intermediate', goals: 'Scenic peaks & fresh air', intensity: 'Moderate' },
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

  // 4. Connect Alex and Sarah as sample connection
  const conn = await prisma.connection.create({
    data: {
      requesterId: createdUsers[0].id,
      recipientId: createdUsers[1].id,
      status: 'ACCEPTED',
      message: 'Hey Sarah! Loved your profile, let me know if you want to run Green Lake loop or hit some badminton rallies!',
    },
  });

  // Conversation between Alex & Sarah
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
      body: 'Hey Sarah! Are you free this Thursday for an easy morning loop around the lake?',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderId: createdUsers[1].id,
      body: 'Hey Alex! Yes definitely, Thursday 6:45 AM works great for me. Let me know the meeting spot!',
    },
  });

  // Connection request from Marcus to Alex (PENDING)
  await prisma.connection.create({
    data: {
      requesterId: createdUsers[2].id,
      recipientId: createdUsers[0].id,
      status: 'PENDING',
      message: 'Hey Alex, looking for an accountability gym partner for lifting sessions at SLU gym. Interested?',
    },
  });

  // 5. Seed Realistic Upcoming Activities
  const now = new Date();
  const tomorrowMorning = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrowMorning.setHours(7, 0, 0, 0);

  const weekendSaturday = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  weekendSaturday.setHours(9, 30, 0, 0);

  const weekendSunday = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  weekendSunday.setHours(14, 0, 0, 0);

  const activities = [
    {
      organizerId: createdUsers[0].id,
      sportId: sportsMap['Running'].id,
      title: 'Sunrise 8K Pace Run — Green Lake Loop',
      description: 'Moderate pace (5:15 - 5:30 min/km) two loops around Green Lake. We do a 5-minute dynamic warm-up and finish with coffee at the local roaster.',
      startsAt: tomorrowMorning,
      durationMinutes: 60,
      generalLocation: 'Green Lake Park, Seattle',
      meetingPointDetails: 'Directly in front of Green Lake Community Boathouse, beside the wooden benches.',
      maxParticipants: 6,
      experienceLevel: 'Intermediate',
      intensity: 'Moderate',
      cost: 0.0,
      status: 'OPEN',
      equipmentNotes: 'Running shoes, hydration bottle, optional GPS watch.',
    },
    {
      organizerId: createdUsers[1].id,
      sportId: sportsMap['Badminton'].id,
      title: 'Intermediate Doubles & Fast Drills',
      description: 'Court booked for 2 hours! Need two more players to run friendly competitive doubles matches and rotational play.',
      startsAt: weekendSaturday,
      durationMinutes: 120,
      generalLocation: 'Seattle Badminton Club, Kirkland',
      meetingPointDetails: 'Courts #3 & #4 reserved under Sarah. Shuttles provided, bring non-marking indoor shoes.',
      maxParticipants: 4,
      experienceLevel: 'Intermediate',
      intensity: 'High',
      cost: 12.0,
      status: 'OPEN',
      equipmentNotes: 'Indoor badminton racket. Nylon/feather birds supplied.',
    },
    {
      organizerId: createdUsers[2].id,
      sportId: sportsMap['Football'].id,
      title: '7v7 Turf Pickup Football Match',
      description: 'Casual yet competitive 7v7 soccer match on synthetic turf. Bibs and match balls supplied. Good sportsmanship essential!',
      startsAt: weekendSunday,
      durationMinutes: 90,
      generalLocation: 'Miller Playfield, Capitol Hill',
      meetingPointDetails: 'North goal turf sideline near the locker shed.',
      maxParticipants: 14,
      experienceLevel: 'All Levels',
      intensity: 'High',
      cost: 5.0,
      status: 'OPEN',
      equipmentNotes: 'Turf boots or soccer cleats, shin guards recommended.',
    },
    {
      organizerId: createdUsers[4].id,
      sportId: sportsMap['Cycling'].id,
      title: 'Mercer Island 40km Tempo Paceline',
      description: 'Group road bike cruise around Mercer Island. Rolling average pace ~26-29 km/h. Smooth single/double pacelines with regroup points at top of climbs.',
      startsAt: weekendSaturday,
      durationMinutes: 90,
      generalLocation: 'Enatai Beach Park, Bellevue',
      meetingPointDetails: 'Main parking area near bicycle repair stand.',
      maxParticipants: 8,
      experienceLevel: 'Advanced',
      intensity: 'High',
      cost: 0.0,
      status: 'OPEN',
      equipmentNotes: 'Road bike in good tune, helmet mandatory, front/rear lights.',
    },
    {
      organizerId: createdUsers[3].id,
      sportId: sportsMap['Running'].id,
      title: 'Gentle Walk & Run 5K for Beginners',
      description: 'Welcoming beginner group! Interval of 3 min jog / 2 min walk along the flat Burke-Gilman trail. Nobody gets left behind!',
      startsAt: weekendSunday,
      durationMinutes: 45,
      generalLocation: 'Burke-Gilman Trail, Fremont',
      meetingPointDetails: 'Fremont Bridge plaza near the stone bench.',
      maxParticipants: 8,
      experienceLevel: 'Beginner',
      intensity: 'Light',
      cost: 0.0,
      status: 'OPEN',
      equipmentNotes: 'Comfortable walking or running shoes.',
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

    // Add Sarah to Alex's run
    if (act.title.includes('Sunrise 8K')) {
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
          body: "Looking forward to this run! Weather looks crisp and clear tomorrow morning.",
        },
      });
    }
  }

  // Initial notification for Alex
  await prisma.notification.create({
    data: {
      userId: createdUsers[0].id,
      type: 'CONNECTION_REQUEST',
      title: 'New Connection Request',
      body: 'Marcus Vance sent you a connection request for Gym & Lifting.',
      link: '/dashboard',
    },
  });

  console.log('Database successfully seeded with realistic athletes and sessions!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
