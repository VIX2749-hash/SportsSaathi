export interface CompatibilityFactor {
  label: string;
  weight: number;
  score: number; // 0 to 1
  detail: string;
}

export interface CompatibilityResult {
  overallPercentage: number;
  factors: CompatibilityFactor[];
  matchSummary: string;
}

export function calculateCompatibility(
  currentUser: {
    city?: string | null;
    sports: Array<{ sportId: string; experienceLevel: string; preferredIntensity: string }>;
    availabilities: Array<{ dayOfWeek: string; timeSlot: string }>;
  },
  candidateUser: {
    city?: string | null;
    sports: Array<{ sportId: string; experienceLevel: string; preferredIntensity: string }>;
    availabilities: Array<{ dayOfWeek: string; timeSlot: string }>;
  }
): CompatibilityResult {
  const factors: CompatibilityFactor[] = [];

  // 1. Sport Overlap (Weight: 40%)
  const userSportIds = new Set(currentUser.sports.map((s) => s.sportId));
  const sharedSports = candidateUser.sports.filter((s) => userSportIds.has(s.sportId));
  const sportScore = currentUser.sports.length > 0 
    ? Math.min(1, sharedSports.length / Math.min(currentUser.sports.length, candidateUser.sports.length || 1))
    : 0.5;

  let sharedSportDetails = sharedSports.length > 0
    ? `${sharedSports.length} shared sport${sharedSports.length > 1 ? 's' : ''}`
    : 'Different focus sports';
  factors.push({
    label: 'Sports Overlap',
    weight: 0.40,
    score: sportScore,
    detail: sharedSportDetails,
  });

  // 2. Schedule Compatibility (Weight: 30%)
  const userScheduleKeys = new Set(
    currentUser.availabilities.map((a) => `${a.dayOfWeek}_${a.timeSlot}`)
  );
  const matchingSlots = candidateUser.availabilities.filter((a) =>
    userScheduleKeys.has(`${a.dayOfWeek}_${a.timeSlot}`)
  );
  const scheduleScore = currentUser.availabilities.length > 0
    ? Math.min(1, matchingSlots.length / Math.min(currentUser.availabilities.length, 4))
    : 0.5;

  factors.push({
    label: 'Schedule Overlap',
    weight: 0.30,
    score: scheduleScore,
    detail: matchingSlots.length > 0
      ? `${matchingSlots.length} overlapping weekly window${matchingSlots.length > 1 ? 's' : ''}`
      : 'Open/flexible hours',
  });

  // 3. Skill & Intensity Compatibility (Weight: 20%)
  let intensityMatches = 0;
  for (const s1 of currentUser.sports) {
    const match = candidateUser.sports.find((s2) => s2.sportId === s1.sportId);
    if (match) {
      if (match.experienceLevel === s1.experienceLevel) intensityMatches += 1;
      else intensityMatches += 0.5;
    }
  }
  const intensityScore = sharedSports.length > 0 ? Math.min(1, intensityMatches / sharedSports.length) : 0.6;
  factors.push({
    label: 'Skill & Pace Alignment',
    weight: 0.20,
    score: intensityScore,
    detail: intensityScore > 0.7 ? 'Comparable experience level' : 'Compatible training pace',
  });

  // 4. Geographic/Proximity (Weight: 10%)
  const sameCity = (currentUser.city || '').toLowerCase() === (candidateUser.city || '').toLowerCase();
  const geoScore = sameCity ? 1.0 : 0.4;
  factors.push({
    label: 'Location Proximity',
    weight: 0.10,
    score: geoScore,
    detail: sameCity ? 'Same home area/city' : 'Regional partner',
  });

  const totalWeighted = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
  const overallPercentage = Math.round(totalWeighted * 100);

  let matchSummary = 'Great overall fit for training sessions.';
  if (overallPercentage >= 85) matchSummary = 'High compatibility — shared sports and matching weekly availability!';
  else if (overallPercentage >= 70) matchSummary = 'Strong alignment on schedule and core athletic goals.';
  else matchSummary = 'Solid casual partner to expand your routine.';

  return {
    overallPercentage,
    factors,
    matchSummary,
  };
}
