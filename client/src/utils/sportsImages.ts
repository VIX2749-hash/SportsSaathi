// Verified high-resolution athletic photography with robust fallbacks
export const SPORT_DEFAULT_IMAGES: Record<string, string> = {
  Cricket: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=800&q=80',
  Badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
  Football: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
  Soccer: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
  Tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
  Running: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80',
  Yoga: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
  Cycling: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
  'Gym & Lifting': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  Fitness: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  Gym: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  Swimming: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
  Basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  Hiking: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
  General: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
};

// Facility specific curated images
export const FACILITY_DEFAULT_IMAGES: Record<string, string> = {
  'Badminton Court': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
  'Football Ground': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
  'Cricket Nets': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
  'Tennis Court': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
  'Running Track': 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80',
  'Gym / Fitness Studio': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  'Yoga Studio': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
};

// Generates an offline athletic SVG data-URI that NEVER fails even with zero network connectivity
export function createSvgPlaceholder(title: string, category: string = 'SPORTS'): string {
  const safeTitle = (title || 'Sports Saathi').replace(/[<>&"]/g, '');
  const safeCategory = (category || 'ATHLETICS').toUpperCase().replace(/[<>&"]/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#231215"/>
        <stop offset="50%" stop-color="#341b20"/>
        <stop offset="100%" stop-color="#190d0f"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FAF7F0" stroke-width="0.5" stroke-opacity="0.08"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <circle cx="700" cy="80" r="140" fill="#CCFF00" fill-opacity="0.06"/>
    <circle cx="100" cy="380" r="180" fill="#E76244" fill-opacity="0.08"/>
    
    <g transform="translate(60, 220)">
      <rect x="0" y="-30" width="140" height="26" rx="13" fill="#CCFF00" fill-opacity="0.2"/>
      <text x="70" y="-12" fill="#CCFF00" font-family="monospace, monospace" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="2">${safeCategory}</text>
      
      <text x="0" y="30" fill="#FAF7F0" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="900" letter-spacing="1">
        ${safeTitle.length > 28 ? safeTitle.substring(0, 28) + '...' : safeTitle}
      </text>
      <text x="0" y="65" fill="#FAF7F0" fill-opacity="0.6" font-family="monospace, monospace" font-size="14" letter-spacing="3">
        SPORTS SAATHI • ATHLETIC MATCHING
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getSportImage(category?: string, title?: string): string {
  if (!category) return SPORT_DEFAULT_IMAGES['Cricket'];

  const normalized = category.toLowerCase().trim();

  for (const [key, url] of Object.entries(SPORT_DEFAULT_IMAGES)) {
    if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
      return url;
    }
  }

  // Facility type matching
  for (const [key, url] of Object.entries(FACILITY_DEFAULT_IMAGES)) {
    if (normalized.includes(key.toLowerCase())) {
      return url;
    }
  }

  if (title) {
    const normTitle = title.toLowerCase();
    if (normTitle.includes('cricket') || normTitle.includes('bat')) return SPORT_DEFAULT_IMAGES['Cricket'];
    if (normTitle.includes('badminton') || normTitle.includes('racket')) return SPORT_DEFAULT_IMAGES['Badminton'];
    if (normTitle.includes('football') || normTitle.includes('turf') || normTitle.includes('soccer')) return SPORT_DEFAULT_IMAGES['Football'];
    if (normTitle.includes('tennis')) return SPORT_DEFAULT_IMAGES['Tennis'];
    if (normTitle.includes('run')) return SPORT_DEFAULT_IMAGES['Running'];
    if (normTitle.includes('yoga') || normTitle.includes('mat')) return SPORT_DEFAULT_IMAGES['Yoga'];
    if (normTitle.includes('cycle') || normTitle.includes('cycling') || normTitle.includes('bike')) return SPORT_DEFAULT_IMAGES['Cycling'];
  }

  return SPORT_DEFAULT_IMAGES['Cricket'];
}
