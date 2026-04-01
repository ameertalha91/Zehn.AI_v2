'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import OAuthButtons from '@/components/OAuthButtons';

function getRedirectPath(role: string, status: string): string {
  if (status === 'PENDING_APPROVAL') return '/pending-approval';
  if (status === 'REJECTED') return '/account-rejected';
  const r = role?.toUpperCase();
  if (r === 'INSTRUCTOR' || r === 'TUTOR') return '/instructor';
  if (r === 'ZEHNAI_ADMIN' || r === 'ADMIN') return '/admin';
  return '/dashboard';
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  if (isAuthenticated && user) {
    router.replace(getRedirectPath(user.role, user.status));
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLocked(false);
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result && typeof result === 'object' && 'locked' in result) {
        setIsLocked(true);
        setError((result as { error: string }).error);
        return;
      }

      if (result === true || result) {
        // login() updates auth context — read role/status from there
        // Redirect handled by the isAuthenticated guard above on next render
        router.push('/dashboard');
      } else {
        setError('Invalid email or password.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back to Zehn.AI</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              id="email" name="email" type="email" required
              value={formData.email} onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password" name="password" type="password" required
              value={formData.password} onChange={handleChange}
              placeholder="Your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {error && (
            <div className={`px-3 py-2 rounded-lg text-sm border ${isLocked ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={isLoading || isLocked}
            className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">or</div>
          </div>

          <OAuthButtons callbackUrl="/dashboard" />
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-gray-900 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
