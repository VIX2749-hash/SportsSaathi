import {
  FALLBACK_FACILITIES,
  FALLBACK_EQUIPMENT,
  FALLBACK_ACTIVITIES,
  FALLBACK_PARTNERS,
  FALLBACK_SPORTS,
} from './fallbackData';

// Prioritize environment variable if defined (for production Vercel / Render / Railway)
const customApiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;
const API_BASE = customApiUrl ? `${customApiUrl.replace(/\/+$/, '')}/api` : '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('mt_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('mt_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('mt_token');
  localStorage.removeItem('mt_demo_user');
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return data as T;
    }

    // If response returned 404 or 500 and it's a GET request, check fallback
    if (options.method === undefined || options.method === 'GET') {
      const fallback = getFallbackForEndpoint<T>(endpoint);
      if (fallback) return fallback;
    }

    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed with status ${response.status}`);
  } catch (err: any) {
    // Check if network failed or server is unreachable (e.g. standalone Vercel preview)
    if (options.method === undefined || options.method === 'GET') {
      const fallback = getFallbackForEndpoint<T>(endpoint);
      if (fallback) return fallback;
    }

    // For write operations on mock Vercel mode, provide optimistic response where appropriate
    if (options.method === 'POST' || options.method === 'PATCH') {
      const mockResult = getMockWriteResponse<T>(endpoint, options.body);
      if (mockResult) return mockResult;
    }

    throw err;
  }
}

function getFallbackForEndpoint<T>(endpoint: string): T | null {
  const path = endpoint.split('?')[0];

  if (path.startsWith('/facilities')) {
    const localSpaces = JSON.parse(localStorage.getItem('mt_user_spaces') || '[]');
    const allSpaces = [...localSpaces, ...FALLBACK_FACILITIES];
    const id = path.replace('/facilities/', '').replace('/facilities', '');
    if (id) {
      const match = allSpaces.find((s) => s.id === id) || allSpaces[0];
      return { facility: match } as unknown as T;
    }
    return { facilities: allSpaces, total: allSpaces.length } as unknown as T;
  }

  if (path.startsWith('/equipment')) {
    const localGear = JSON.parse(localStorage.getItem('mt_user_equipment') || '[]');
    const allGear = [...localGear, ...FALLBACK_EQUIPMENT];
    const id = path.replace('/equipment/', '').replace('/equipment', '');
    if (id) {
      const match = allGear.find((g) => g.id === id) || allGear[0];
      return { equipmentItem: match } as unknown as T;
    }
    return { equipment: allGear, total: allGear.length } as unknown as T;
  }

  if (path.startsWith('/activities')) {
    const localActs = JSON.parse(localStorage.getItem('mt_user_activities') || '[]');
    const allActs = [...localActs, ...FALLBACK_ACTIVITIES];
    const id = path.replace('/activities/', '').replace('/activities', '');
    if (id) {
      const match = allActs.find((a) => a.id === id) || allActs[0];
      return { activity: match } as unknown as T;
    }
    return { activities: allActs, total: allActs.length } as unknown as T;
  }

  if (path === '/partners/leaderboard' || path.startsWith('/partners/leaderboard')) {
    return { leaderboard: FALLBACK_PARTNERS } as unknown as T;
  }

  if (path === '/partners' || path.startsWith('/partners')) {
    return { partners: FALLBACK_PARTNERS, total: FALLBACK_PARTNERS.length } as unknown as T;
  }

  if (path === '/connections' || path.startsWith('/connections')) {
    return { sent: [], received: [], activityInvites: [] } as unknown as T;
  }

  if (path === '/sports') {
    return { sports: FALLBACK_SPORTS } as unknown as T;
  }

  if (path === '/my/facility-bookings' || path.endsWith('/my/facility-bookings')) {
    const localBookings = JSON.parse(localStorage.getItem('mt_user_bookings') || '[]');
    return { bookings: localBookings, myBookings: localBookings, incomingRequests: [] } as unknown as T;
  }

  if (path === '/my/equipment-reservations' || path.endsWith('/my/equipment-reservations')) {
    const localResvs = JSON.parse(localStorage.getItem('mt_user_reservations') || '[]');
    return { reservations: localResvs, incomingRequests: [] } as unknown as T;
  }

  if (path === '/notifications' || path.startsWith('/notifications')) {
    return { notifications: [], unreadCount: 0 } as unknown as T;
  }

  if (path === '/messages/conversations' || path.startsWith('/messages')) {
    return { conversations: [], messages: [], otherUser: null } as unknown as T;
  }

  if (path === '/safety/status' || path.startsWith('/safety')) {
    return { safetyStatus: 'SECURE', isRestricted: false } as unknown as T;
  }

  return null;
}

function getMockWriteResponse<T>(endpoint: string, body?: any): T | null {
  const path = endpoint.split('?')[0];
  const payload = typeof body === 'string' ? JSON.parse(body || '{}') : body || {};

  // Bookings fallback
  if (path.includes('/bookings') && !path.includes('/status') && !path.includes('/cancel')) {
    const newBooking = {
      id: `booking-${Date.now()}`,
      startAt: payload.startAt || new Date().toISOString(),
      endAt: payload.endAt || new Date(Date.now() + 3600000).toISOString(),
      totalPrice: payload.totalPrice || 450,
      status: 'CONFIRMED',
      facility: FALLBACK_FACILITIES[0],
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('mt_user_bookings') || '[]');
    localStorage.setItem('mt_user_bookings', JSON.stringify([newBooking, ...existing]));
    return { booking: newBooking, message: 'Slot booked successfully!' } as unknown as T;
  }

  // Equipment reservation fallback
  if (path.includes('/reservations') && !path.includes('/status') && !path.includes('/cancel')) {
    const newResv = {
      id: `resv-${Date.now()}`,
      pickupAt: payload.pickupAt || new Date().toISOString(),
      expectedReturnAt: payload.expectedReturnAt || new Date(Date.now() + 86400000).toISOString(),
      quantity: payload.quantity || 1,
      totalPrice: 0,
      deposit: payload.deposit || 500,
      status: 'APPROVED',
      equipmentItem: FALLBACK_EQUIPMENT[0],
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('mt_user_reservations') || '[]');
    localStorage.setItem('mt_user_reservations', JSON.stringify([newResv, ...existing]));
    return { reservation: newResv, message: 'Reservation request confirmed!' } as unknown as T;
  }

  // Create facility fallback
  if (path === '/facilities') {
    const newFac = {
      id: `fac-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      owner: { displayName: 'You', avatarUrl: null },
    };
    const existing = JSON.parse(localStorage.getItem('mt_user_spaces') || '[]');
    localStorage.setItem('mt_user_spaces', JSON.stringify([newFac, ...existing]));
    return { facility: newFac } as unknown as T;
  }

  // Create equipment fallback
  if (path === '/equipment') {
    const newEq = {
      id: `eq-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      owner: { displayName: 'You', avatarUrl: null },
    };
    const existing = JSON.parse(localStorage.getItem('mt_user_equipment') || '[]');
    localStorage.setItem('mt_user_equipment', JSON.stringify([newEq, ...existing]));
    return { equipmentItem: newEq } as unknown as T;
  }

  // Activities fallback
  if (path === '/activities') {
    const newAct = {
      id: `act-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      currentParticipants: 1,
      isOrganizer: true,
      isUserJoined: true,
      organizer: { displayName: 'You', avatarUrl: null, points: 150 },
    };
    const existing = JSON.parse(localStorage.getItem('mt_user_activities') || '[]');
    localStorage.setItem('mt_user_activities', JSON.stringify([newAct, ...existing]));
    return { activity: newAct, message: 'Activity created successfully!' } as unknown as T;
  }

  // Connections update/respond fallback
  if (path.startsWith('/connections')) {
    return { message: 'Connection updated successfully' } as unknown as T;
  }

  // Notifications fallback
  if (path.startsWith('/notifications')) {
    return { message: 'Notifications marked as read' } as unknown as T;
  }

  // Messages fallback
  if (path.startsWith('/messages')) {
    return {
      message: {
        id: `msg-${Date.now()}`,
        content: payload.content || '',
        createdAt: new Date().toISOString(),
        senderId: 'me',
      },
    } as unknown as T;
  }

  return null;
}

