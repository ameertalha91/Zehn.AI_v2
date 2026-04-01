'use client';

import { useAuth } from '@/lib/auth-context';

export default function AccountRejectedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">Application not approved</h1>
        <p className="text-gray-500 text-sm mb-6">
          Unfortunately your registration was not approved. If you believe this is an error,
          please contact your instructor or the platform support team.
        </p>

        {user?.email && (
          <p className="text-xs text-gray-400 mb-6">
            Account: <span className="font-medium text-gray-600">{user.email}</span>
          </p>
        )}

        <button
          onClick={logout}
          className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}
