'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  centerId?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean | { locked: boolean; error: string }>;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

function setSessionCookie(userData: User) {
  document.cookie = `zehn_user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = 'zehn_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zehn_user');
      if (saved) {
        const userData = JSON.parse(saved) as User;
        setUser(userData);
        setSessionCookie(userData);
      }
    } catch {
      // Corrupt storage — clear it
      localStorage.removeItem('zehn_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 423) {
        // Account locked
        return { locked: true, error: data.error as string };
      }

      if (!response.ok) {
        return false;
      }

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        status: data.user.status,
        centerId: data.user.centerId ?? undefined,
        image: data.user.image ?? undefined,
      };

      setUser(userData);
      localStorage.setItem('zehn_user', JSON.stringify(userData));
      setSessionCookie(userData);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role = 'STUDENT'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();
      return response.ok ? { success: true } : { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zehn_user');
    clearSessionCookie();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
