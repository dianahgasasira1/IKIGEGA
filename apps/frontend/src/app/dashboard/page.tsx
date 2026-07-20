'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe, type User } from '@/lib/api';
import { getToken, clearToken } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/');
      return;
    }

    getMe(token)
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        clearToken();
        router.push('/');
      });
  }, [router]);

  function handleLogout() {
    clearToken();
    router.push('/');
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-600">Tegereza...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Ikigega</h1>
            <p className="text-sm text-stone-600">Ikaze, {user?.preferredName || 'mama'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            Sohoka (log out)
          </button>
        </header>

        <div className="bg-white p-6 rounded-lg border border-stone-200">
          <h2 className="text-lg font-semibold mb-4 text-stone-900">
            Uwinjiye mu ikaze
          </h2>
          <p className="text-sm text-stone-600 mb-4">You are logged in.</p>

          <dl className="space-y-2 text-sm">
            <div className="flex">
              <dt className="w-32 text-stone-500">Nimero:</dt>
              <dd className="text-stone-900">{user?.phoneNumber}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 text-stone-500">Izina:</dt>
              <dd className="text-stone-900">{user?.preferredName || '—'}</dd>
            </div>
            <div className="flex">
              <dt className="w-32 text-stone-500">Iyandikwa:</dt>
              <dd className="text-stone-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </dd>
            </div>
          </dl>
        </div>

        <p className="text-center text-xs text-stone-500 mt-8">
          Sprint 1 · Authentication working end-to-end 🎉
        </p>
      </div>
    </main>
  );
}
