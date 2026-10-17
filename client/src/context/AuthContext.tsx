import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiRequest, setAuthToken, clearAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    setUser(data.user);
  };

  const register = async (formData: { email: string; password: string; displayName: string }) => {
    const data = await apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    setAuthToken(data.token);
    setUser(data.user);
  };

  const loginWithGoogle = async (googleProfile: { email: string; displayName: string; avatarUrl?: string }) => {
    const data = await apiRequest<{ user: User; token: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleProfile),
    });
    setAuthToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
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
