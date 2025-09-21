// Authentication Context - manages user state throughout the app
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User types that will be supported
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor' | 'admin';
  avatar?: string;
  viewingAs?: 'student' | 'tutor' | 'admin'; // For admin view switching
  centerId?: string; // Associated center for instructors/tutors
}

// What the authentication context provides
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  switchView: (role: 'student' | 'tutor' | 'admin') => void;
  getEffectiveRole: () => 'student' | 'tutor' | 'admin';
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component that wraps the app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        // Check localStorage for existing session
        const savedUser = localStorage.getItem('zehn_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          // Also set cookie for middleware
          document.cookie = `zehn_user=${JSON.stringify(userData)}; path=/; max-age=86400; SameSite=Lax`;
        }
      } catch (error) {
        console.error('Error checking existing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingAuth();
  }, []);

  // Login function - now uses real API
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role.toLowerCase() as 'student' | 'tutor' | 'admin',
        };
        
        setUser(userData);
        localStorage.setItem('zehn_user', JSON.stringify(userData));
        // Also set cookie for middleware
        document.cookie = `zehn_user=${JSON.stringify(userData)}; path=/; max-age=86400; SameSite=Lax`;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function - creates new user
  const register = async (name: string, email: string, password: string, role: string = 'STUDENT'): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('zehn_user');
    // Remove cookie
    document.cookie = 'zehn_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  // Admin view switching function
  const switchView = (role: 'student' | 'tutor' | 'admin') => {
    if (user && user.role === 'admin') {
      const updatedUser = { ...user, viewingAs: role };
      setUser(updatedUser);
      localStorage.setItem('zehn_user', JSON.stringify(updatedUser));
      document.cookie = `zehn_user=${JSON.stringify(updatedUser)}; path=/; max-age=86400; SameSite=Lax`;
    }
  };

  // Get effective role (for admin view switching)
  const getEffectiveRole = (): 'student' | 'tutor' | 'admin' => {
    if (!user) return 'student';
    if (user.role === 'admin' && user.viewingAs) {
      return user.viewingAs;
    }
    return user.role;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    switchView,
    getEffectiveRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
