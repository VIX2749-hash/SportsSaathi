export interface Sport {
  id: string;
  name: string;
  category: string;
  icon: string;
}

export interface UserSport {
  id?: string;
  sportId: string;
  experienceLevel: string; // Beginner, Casual, Intermediate, Advanced, Competitive
  goals: string;
  preferredIntensity: string; // Light, Moderate, High, Competitive
  sport?: Sport;
}

export interface Availability {
  id?: string;
  dayOfWeek: string;
  timeSlot: string;
  timezone?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  bio: string;
  city: string;
  area?: string | null;
  profileVisibility: string;
  searchRadiusKm: number;
  completedOnboarding: boolean;
  streakCount: number;
  totalSessions: number;
  points: number;
  deletionRequestedAt?: string | null;
  sports?: UserSport[];
  availabilities?: Availability[];
}

export interface CompatibilityFactor {
  label: string;
  weight: number;
  score: number;
  detail: string;
}

export interface CompatibilityResult {
  overallPercentage: number;
  factors: CompatibilityFactor[];
  matchSummary: string;
}

export interface Partner {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  city: string;
  area?: string | null;
  distanceBucket?: string;
  streakCount: number;
  totalSessions: number;
  points: number;
  sports: UserSport[];
  availabilities: Availability[];
  compatibility?: CompatibilityResult;
}

export interface ActivityParticipant {
  id: string;
  activityId: string;
  userId: string;
  role: 'ORGANIZER' | 'PARTICIPANT';
  status: 'CONFIRMED' | 'CANCELLED' | 'WAITLIST';
  attendanceStatus: 'UNMARKED' | 'ATTENDED' | 'MISSED';
  confirmed30mPrior?: boolean;
  checkInAt?: string | null;
  joinedAt: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    city?: string;
    points?: number;
  };
}

export interface ActivityMessage {
  id: string;
  activityId: string;
  senderId: string;
  body: string;
  createdAt: string;
  sender?: {
    id?: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export interface Activity {
  id: string;
  organizerId: string;
  sportId: string;
  title: string;
  description: string;
  activityType: 'SESSION' | 'CASUAL' | 'TOURNAMENT';
  tournamentFormat?: string | null;
  tournamentPrize?: string | null;
  startsAt: string;
  durationMinutes: number;
  generalLocation: string;
  meetingPointDetails?: string | null;
  maxParticipants: number;
  experienceLevel: string;
  intensity: string;
  equipmentNotes?: string | null;
  cost: number;
  checkInCode?: string | null;
  status: 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED';
  confirmedCount?: number;
  spotsRemaining?: number;
  isUserJoined?: boolean;
  isOrganizer?: boolean;
  confirmed30mPrior?: boolean;
  attendanceStatus?: 'UNMARKED' | 'ATTENDED' | 'MISSED';
  sport: Sport;
  organizer: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    city?: string;
    bio?: string;
    totalSessions?: number;
    streakCount?: number;
    points?: number;
  };
  participants?: ActivityParticipant[];
  messages?: ActivityMessage[];
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
  sender: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export interface ConversationSummary {
  id: string;
  otherUser: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    city?: string;
  };
  lastMessage?: {
    body: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface SportsFacility {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  facilityType: string;
  sportCategories: string;
  photos: string;
  location: string;
  addressDetails?: string | null;
  amenities: string;
  openingHours: string;
  bookingDurationRules: string;
  slotDurationMinutes: number;
  pricePerSlot: number;
  requiresApproval: boolean;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    city?: string;
  };
}

export interface FacilityBooking {
  id: string;
  facilityId: string;
  userId: string;
  startAt: string;
  endAt: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  facility?: SportsFacility;
  user?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    city?: string;
  };
}

export interface EquipmentHandoverEvent {
  id: string;
  reservationId: string;
  recordedById: string;
  eventType: 'PICKED_UP' | 'RETURNED';
  notes?: string | null;
  conditionReport?: string | null;
  createdAt: string;
  recordedBy?: {
    id: string;
    displayName: string;
  };
}

export interface EquipmentItem {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  sportCategory: string;
  condition: string;
  totalQuantity: number;
  availableQuantity?: number;
  sharingType: 'FREE_LENDING' | 'PAID_RENTAL' | 'COMMUNITY_POOL';
  pickupArea: string;
  pickupAddress?: string | null;
  loanDurationRules: string;
  maxLoanDays: number;
  depositRequired: number;
  pricePerLoan: number;
  photos: string;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    city?: string;
  };
}

export interface EquipmentReservation {
  id: string;
  equipmentId: string;
  borrowerId: string;
  quantity: number;
  startAt: string;
  endAt: string;
  totalCost: number;
  depositHeld: number;
  status: 'PENDING' | 'CONFIRMED' | 'PICKED_UP' | 'RETURNED' | 'CANCELLED' | 'REJECTED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  equipment?: EquipmentItem;
  borrower?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    city?: string;
  };
  handoverEvents?: EquipmentHandoverEvent[];
}
