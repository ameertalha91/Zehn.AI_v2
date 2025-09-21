import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export interface AuthorizedUser {
  id: string;
  email: string;
  role: string;
  isAdmin?: boolean;
  viewingAs?: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthorizedUser | null> {
  // Get user role from middleware headers
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const isAdmin = request.headers.get('x-is-admin') === 'true';
  const viewingAs = request.headers.get('x-viewing-as');
  
  if (!userId || !userRole) {
    return null;
  }

  // In production, verify JWT token here
  // For now, trust the middleware headers
  return {
    id: userId,
    email: '', // Can fetch from DB if needed
    role: userRole,
    isAdmin,
    viewingAs: viewingAs || undefined
  };
}

export function hasRole(user: AuthorizedUser | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  
  // Admin has access to everything (unless viewing as another role)
  if (user.isAdmin && !user.viewingAs) return true;
  
  // Check if user has one of the allowed roles
  return allowedRoles.some(role => role.toLowerCase() === user.role.toLowerCase());
}

export function createAuthResponse(error: string, status: number = 403) {
  return new Response(
    JSON.stringify({ error }),
    { 
      status, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}
