// Anti-Dating keyword moderation heuristics
const FLAGGED_DATING_KEYWORDS = [
  'hookup', 'hook up', 'dating', 'romance', 'single and looking', 'seeking female',
  'seeking male', 'cute girls', 'hot guys', 'sugar baby', 'sugar daddy', 'casual fun',
  'netflix and chill', 'cuddle', 'sensual', 'friends with benefits', 'fwb', 'nsfw'
];

export function validateSportsBio(bio: string): { isValid: boolean; reason?: string } {
  if (!bio || bio.trim().length < 15) {
    return {
      isValid: false,
      reason: 'Sports profile bio is mandatory (minimum 15 characters). Please mention your favorite sport, typical pace, or athletic training goal.',
    };
  }

  const lower = bio.toLowerCase();
  for (const word of FLAGGED_DATING_KEYWORDS) {
    if (lower.includes(word)) {
      return {
        isValid: false,
        reason: `Bio contains restricted romantic/dating phrase ("${word}"). Move Together is strictly a sports and athletic partnership platform.`,
      };
    }
  }

  return { isValid: true };
}

// Location bucket privacy helper (never expose raw km distance like "0.2 km")
export function bucketDistance(cityMatch: boolean, neighborhoodMatch: boolean): string {
  if (neighborhoodMatch) return 'In your neighborhood area';
  if (cityMatch) return 'Within your city metro (~5-15 km)';
  return 'Regional area';
}
