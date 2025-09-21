
'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Admin from './parts/Admin';
import Tutor from './parts/Tutor';
import Student from './parts/Student';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Dashboard() {
  const { user, isLoading, isAuthenticated, getEffectiveRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Render dashboard based on effective role (for admin view switching)
  const userRole = getEffectiveRole()?.toUpperCase();
  
  switch (userRole) {
    case 'ADMIN':
      // If admin is viewing as admin, redirect to admin dashboard
      if (user.role === 'admin' && !user.viewingAs) {
        router.push('/admin/dashboard');
        return null;
      }
      return (
        <ProtectedRoute allowedRoles={['admin']}>
          <Admin />
        </ProtectedRoute>
      );
    case 'TUTOR':
    case 'INSTRUCTOR':
    case 'EDUCATOR':
      return (
        <ProtectedRoute allowedRoles={['tutor']}>
          <Tutor />
        </ProtectedRoute>
      );
    case 'STUDENT':
    default:
      return (
        <ProtectedRoute allowedRoles={['student']}>
          <Student />
        </ProtectedRoute>
      );
  }
}
