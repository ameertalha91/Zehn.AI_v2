'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PendingApprovalPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // If user is now approved, redirect them to dashboard
  useEffect(() => {
    if (user?.status === 'APPROVED') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">Application under review</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your account is pending approval. Your instructor will review your application and
          you'll receive an email once a decision has been made.
        </p>

        {user?.email && (
          <p className="text-xs text-gray-400 mb-6">
            We'll notify <span className="font-medium text-gray-600">{user.email}</span> when your account is approved.
          </p>
        )}

        <button
          onClick={logout}
          className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
