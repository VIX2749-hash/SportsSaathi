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

  if (path === '/facilities' || path.startsWith('/facilities')) {
    // Check local storage for any user-created spaces
    const localSpaces = JSON.parse(localStorage.getItem('mt_user_spaces') || '[]');
    return { facilities: [...localSpaces, ...FALLBACK_FACILITIES], total: FALLBACK_FACILITIES.length + localSpaces.length } as unknown as T;
  }

  if (path === '/equipment' || path.startsWith('/equipment')) {
    const localGear = JSON.parse(localStorage.getItem('mt_user_equipment') || '[]');
    return { equipment: [...localGear, ...FALLBACK_EQUIPMENT], total: FALLBACK_EQUIPMENT.length + localGear.length } as unknown as T;
  }

  if (path === '/activities' || path.startsWith('/activities')) {
    const localActs = JSON.parse(localStorage.getItem('mt_user_activities') || '[]');
    return { activities: [...localActs, ...FALLBACK_ACTIVITIES], total: FALLBACK_ACTIVITIES.length + localActs.length } as unknown as T;
  }

  if (path === '/partners' || path.startsWith('/partners')) {
    return { partners: FALLBACK_PARTNERS, total: FALLBACK_PARTNERS.length } as unknown as T;
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

  if (path === '/notifications') {
    return { notifications: [] } as unknown as T;
  }

  if (path === '/safety/status') {
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

  return null;
}
