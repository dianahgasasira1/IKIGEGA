'use client';

import { useState } from 'react';
import { createUser } from '@/lib/api';

export default function HomePage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const user = await createUser({
        phoneNumber: `+250${phoneNumber}`,
        preferredName: preferredName || undefined,
      });
      setStatus('success');
      setMessage(`Murakaza neza, ${user.preferredName || 'mama'}!`);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Habaye ikosa');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-stone-900 mb-2">Ikigega</h1>
          <p className="text-stone-600">
            Ubucuruzi bwawe, mu jwi ryawe.
          </p>
          <p className="text-sm text-stone-500 mt-1">
            Your business, in your voice.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-2">
              Nimero ya telefone <span className="text-stone-400">(phone number)</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 border border-r-0 border-stone-300 bg-stone-100 text-stone-600 rounded-l-md">
                +250
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={9}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="788123456"
                required
                className="flex-1 px-4 py-3 border border-stone-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-stone-900 text-lg"
              />
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
              Izina <span className="text-stone-400">(name, optional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="Mama Uwase"
              maxLength={50}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 text-lg"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || phoneNumber.length !== 9}
            className="w-full py-3 px-6 bg-stone-900 text-white font-medium rounded-md hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-lg"
          >
            {status === 'loading' ? 'Tegereza...' : 'Iyandikishe'}
          </button>
        </form>

        {status === 'success' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800 text-center">
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-center">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}