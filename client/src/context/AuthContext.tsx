import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiRequest, setAuthToken, clearAuthToken, getAuthToken } from '../services/api';
import { FALLBACK_SPORTS } from '../services/fallbackData';

export const DEMO_USERS: Record<string, User> = {
  'rohan.sharma@gmail.com': {
    id: 'demo-rohan-sharma',
    email: 'rohan.sharma@gmail.com',
    displayName: 'Rohan Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Cricket all-rounder (pace bowler & middle-order bat) and regular weekend 5K runner at Cubbon Park. Looking for net practice partners and weekend box cricket squads!',
    city: 'Bengaluru, India',
    area: 'Indiranagar',
    profileVisibility: 'PUBLIC',
    searchRadiusKm: 15,
    completedOnboarding: true,
    streakCount: 8,
    totalSessions: 24,
    points: 140,
    sports: [
      { id: 's1', sportId: 'sp-1', experienceLevel: 'Advanced', goals: 'Net bowling practice & box cricket tournaments', preferredIntensity: 'High', sport: FALLBACK_SPORTS[0] },
      { id: 's2', sportId: 'sp-4', experienceLevel: 'Intermediate', goals: '5K pacing & Cubbon Park loops', preferredIntensity: 'Moderate', sport: FALLBACK_SPORTS[3] },
    ],
    availabilities: [
      { id: 'a1', dayOfWeek: 'Tuesday', timeSlot: 'Evening (5-9 PM)' },
      { id: 'a2', dayOfWeek: 'Thursday', timeSlot: 'Evening (5-9 PM)' },
      { id: 'a3', dayOfWeek: 'Saturday', timeSlot: 'Early Morning (5-8 AM)' },
      { id: 'a4', dayOfWeek: 'Sunday', timeSlot: 'Morning (8-12 PM)' },
    ],
  },
  'ananya.iyer@gmail.com': {
    id: 'demo-ananya-iyer',
    email: 'ananya.iyer@gmail.com',
    displayName: 'Ananya Iyer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Competitive badminton club player & yoga enthusiast. Always up for fast doubles rallies at Play Arena or peaceful morning vinyasa sessions.',
    city: 'Bengaluru, India',
    area: 'Koramangala',
    profileVisibility: 'PUBLIC',
    searchRadiusKm: 12,
    completedOnboarding: true,
    streakCount: 14,
    totalSessions: 42,
    points: 210,
    sports: [
      { id: 's3', sportId: 'sp-2', experienceLevel: 'Advanced', goals: 'Competitive doubles, tournament prep & smash drills', preferredIntensity: 'High', sport: FALLBACK_SPORTS[1] },
      { id: 's4', sportId: 'sp-8', experienceLevel: 'Intermediate', goals: 'Flexibility, pranayama, and core balance', preferredIntensity: 'Moderate', sport: FALLBACK_SPORTS[7] },
    ],
    availabilities: [
      { id: 'a5', dayOfWeek: 'Monday', timeSlot: 'Evening (5-9 PM)' },
      { id: 'a6', dayOfWeek: 'Wednesday', timeSlot: 'Evening (5-9 PM)' },
      { id: 'a7', dayOfWeek: 'Saturday', timeSlot: 'Morning (8-12 PM)' },
    ],
  },
  'vikram.malhotra@gmail.com': {
    id: 'demo-vikram-malhotra',
    email: 'vikram.malhotra@gmail.com',
    displayName: 'Vikram Malhotra',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Former university football striker. Organizing weekly 7v7 turf matches in Mumbai & Bandra sea face morning conditioning runs.',
    city: 'Mumbai, India',
    area: 'Bandra West',
    profileVisibility: 'PUBLIC',
    searchRadiusKm: 15,
    completedOnboarding: true,
    streakCount: 9,
    totalSessions: 31,
    points: 165,
    sports: [
      { id: 's5', sportId: 'sp-3', experienceLevel: 'Advanced', goals: 'Competitive 7v7 turf leagues, team tactics', preferredIntensity: 'High', sport: FALLBACK_SPORTS[2] },
      { id: 's6', sportId: 'sp-6', experienceLevel: 'Intermediate', goals: 'Athletic power & functional conditioning', preferredIntensity: 'High', sport: FALLBACK_SPORTS[5] },
    ],
    availabilities: [
      { id: 'a8', dayOfWeek: 'Tuesday', timeSlot: 'Evening (5-9 PM)' },
      { id: 'a9', dayOfWeek: 'Thursday', timeSlot: 'Evening (5-9 PM)' },
      { id: 'a10', dayOfWeek: 'Sunday', timeSlot: 'Morning (8-12 PM)' },
    ],
  },
  // Legacy aliases
  'alex.rivera@example.com': {
    id: 'demo-alex-rivera',
    email: 'alex.rivera@example.com',
    displayName: 'Rohan Sharma (Alex)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Cricket all-rounder (pace bowler & middle-order bat) and regular weekend 5K runner at Cubbon Park.',
    city: 'Bengaluru, India',
    area: 'Indiranagar',
    profileVisibility: 'PUBLIC',
    searchRadiusKm: 15,
    completedOnboarding: true,
    streakCount: 8,
    totalSessions: 24,
    points: 140,
    sports: [
      { id: 's1', sportId: 'sp-1', experienceLevel: 'Advanced', goals: 'Net bowling practice & box cricket tournaments', preferredIntensity: 'High', sport: FALLBACK_SPORTS[0] },
      { id: 's2', sportId: 'sp-4', experienceLevel: 'Intermediate', goals: '5K pacing & Cubbon Park loops', preferredIntensity: 'Moderate', sport: FALLBACK_SPORTS[3] },
    ],
    availabilities: [
      { id: 'a1', dayOfWeek: 'Tuesday', timeSlot: 'Evening (5-9 PM)' },
      { id: 'a2', dayOfWeek: 'Thursday', timeSlot: 'Evening (5-9 PM)' },
    ],
  },
  'sarah.chen@example.com': {
    id: 'demo-sarah-chen',
    email: 'sarah.chen@example.com',
    displayName: 'Ananya Iyer (Sarah)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Competitive badminton club player & yoga enthusiast. Fast doubles rallies & morning vinyasa.',
    city: 'Bengaluru, India',
    area: 'Koramangala',
    profileVisibility: 'PUBLIC',
    searchRadiusKm: 12,
    completedOnboarding: true,
    streakCount: 14,
    totalSessions: 42,
    points: 210,
    sports: [
      { id: 's3', sportId: 'sp-2', experienceLevel: 'Advanced', goals: 'Competitive doubles & tournament prep', preferredIntensity: 'High', sport: FALLBACK_SPORTS[1] },
    ],
    availabilities: [
      { id: 'a5', dayOfWeek: 'Monday', timeSlot: 'Evening (5-9 PM)' },
    ],
  },
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: { email: string; password: string; displayName: string }) => Promise<void>;
  loginWithGoogle: (googleProfile: { email: string; displayName: string; avatarUrl?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (updated: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{ user: User }>('/auth/me');
      setUser(data.user);
      localStorage.setItem('mt_demo_user', JSON.stringify(data.user));
    } catch {
      // Offline / standalone Vercel preview fallback
      const cached = localStorage.getItem('mt_demo_user');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          clearAuthToken();
          setUser(null);
        }
      } else {
        clearAuthToken();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password = 'password123') => {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const data = await apiRequest<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      setAuthToken(data.token);
      localStorage.setItem('mt_demo_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err: any) {
      // If network fails (e.g. Vercel deployment with no backend), use instant demo profile
      const demoProfile = DEMO_USERS[normalizedEmail] || {
        id: `user-${Date.now()}`,
        email: normalizedEmail,
        displayName: normalizedEmail.split('@')[0],
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        bio: 'Sports Saathi athlete ready to train and keep moving.',
        city: 'Bengaluru, India',
        area: 'Indiranagar',
        profileVisibility: 'PUBLIC',
        searchRadiusKm: 15,
        completedOnboarding: true,
        streakCount: 5,
        totalSessions: 14,
        points: 120,
        sports: [
          { id: 's1', sportId: 'sp-1', experienceLevel: 'Intermediate', goals: 'Net practice & recreational matches', preferredIntensity: 'Moderate', sport: FALLBACK_SPORTS[0] },
        ],
        availabilities: [
          { id: 'a1', dayOfWeek: 'Saturday', timeSlot: 'Morning (8-12 PM)' },
        ],
      };

      const fallbackToken = `sports-saathi-token-${Date.now()}`;
      setAuthToken(fallbackToken);
      localStorage.setItem('mt_demo_user', JSON.stringify(demoProfile));
      setUser(demoProfile);
    }
  };

  const register = async (formData: { email: string; password: string; displayName: string }) => {
    try {
      const data = await apiRequest<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...formData, ageConfirmed: true }),
      });
      setAuthToken(data.token);
      localStorage.setItem('mt_demo_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err: any) {
      // Fallback for standalone demo
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: formData.email,
        displayName: formData.displayName,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Excited to train, show up, and keep moving.',
        city: 'Bengaluru, India',
        area: 'Indiranagar',
        profileVisibility: 'PUBLIC',
        searchRadiusKm: 15,
        completedOnboarding: false,
        streakCount: 1,
        totalSessions: 1,
        points: 100,
        sports: [],
        availabilities: [],
      };
      setAuthToken(`sports-saathi-token-${Date.now()}`);
      localStorage.setItem('mt_demo_user', JSON.stringify(newUser));
      setUser(newUser);
    }
  };

  const loginWithGoogle = async (googleProfile: { email: string; displayName: string; avatarUrl?: string }) => {
    try {
      const data = await apiRequest<{ user: User; token: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(googleProfile),
      });
      setAuthToken(data.token);
      localStorage.setItem('mt_demo_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err: any) {
      // Instant Google session fallback
      const googleUser: User = {
        id: `google-${Date.now()}`,
        email: googleProfile.email,
        displayName: googleProfile.displayName,
        avatarUrl: googleProfile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        bio: 'Google athlete ready to find partners and book sports spaces.',
        city: 'Bengaluru, India',
        area: 'Indiranagar',
        profileVisibility: 'PUBLIC',
        searchRadiusKm: 15,
        completedOnboarding: true,
        streakCount: 7,
        totalSessions: 18,
        points: 130,
        sports: [
          { id: 's1', sportId: 'sp-1', experienceLevel: 'Advanced', goals: 'Regular practice and weekend games', preferredIntensity: 'High', sport: FALLBACK_SPORTS[0] },
        ],
        availabilities: [
          { id: 'a1', dayOfWeek: 'Sunday', timeSlot: 'Morning (8-12 PM)' },
        ],
      };
      setAuthToken(`sports-saathi-google-token-${Date.now()}`);
      localStorage.setItem('mt_demo_user', JSON.stringify(googleUser));
      setUser(googleUser);
    }
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem('mt_demo_user');
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem('mt_demo_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
