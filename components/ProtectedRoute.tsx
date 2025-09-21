/**
 * PROTECTED ROUTE COMPONENT - Role-based access control wrapper
 * 
 * This component provides role-based access control for pages and components.
 * It ensures only users with appropriate roles can access protected content.
 * 
 * ARCHITECTURE OVERVIEW:
 * - Wraps components that require authentication and specific roles
 * - Integrates with auth-context for user authentication state
 * - Provides automatic redirection for unauthorized users
 * - Supports multiple allowed roles per route
 * 
 * USAGE PATTERN:
 * - Wrap any component that needs protection
 * - Specify allowed roles (e.g., ['student', 'admin'])
 * - Component handles authentication and authorization automatically
 * 
 * RELATED MODULES TO UNDERSTAND:
 * - /lib/auth-context.tsx - User authentication state management
 * - /app/login/page.tsx - Login page for unauthenticated users
 * - /app/dashboard/page.tsx - Default redirect destination
 * 
 * ROLE SYSTEM:
 * - STUDENT: Can access student-specific content
 * - TUTOR: Can access instructor/tutor content
 * - ADMIN: Can access all content
 */

'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/dashboard' 
}: ProtectedRouteProps) {
  // AUTHENTICATION STATE
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // ACCESS CONTROL LOGIC
  useEffect(() => {
    if (!isLoading) {
      // AUTHENTICATION CHECK
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // AUTHORIZATION CHECK
      // If authenticated but role not allowed, redirect to dashboard
      // Note: Admin role has access to everything
      const userRole = user?.role?.toLowerCase();
      const isAllowed = allowedRoles.some(role => 
        role.toLowerCase() === userRole || userRole === 'admin'
      );

      if (!isAllowed) {
        router.push(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, redirectTo, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Don't render if not authorized
  const userRole = user?.role?.toLowerCase();
  const isAllowed = allowedRoles.some(role => 
    role.toLowerCase() === userRole || userRole === 'admin'
  );

  if (!isAuthenticated || !isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
