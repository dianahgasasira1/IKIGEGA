'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestOtp, verifyOtp } from '@/lib/api';
import { saveToken } from '@/lib/auth';

type Step = 'phone' | 'otp';

export default function HomePage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [preferredName, setPreferredName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fullPhoneNumber = `+250${phoneNumber}`;

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await requestOtp(fullPhoneNumber);
      setStep('otp');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Habaye ikosa');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const result = await verifyOtp({
        phoneNumber: fullPhoneNumber,
        otp,
        preferredName: preferredName || undefined,
      });
      saveToken(result.token);
      router.push('/dashboard');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Habaye ikosa');
    } finally {
      setLoading(false);
    }
  }

  function handleBackToPhone() {
    setStep('phone');
    setOtp('');
    setErrorMessage('');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-stone-900 mb-2">Ikigega</h1>
          <p className="text-stone-600">Ubucuruzi bwawe, mu jwi ryawe.</p>
          <p className="text-sm text-stone-500 mt-1">Your business, in your voice.</p>
        </div>

        {step === 'phone' && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
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
                  className="flex-1 px-4 py-3 border border-stone-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-stone-900 text-lg text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length !== 9}
              className="w-full py-3 px-6 bg-stone-900 text-white font-medium rounded-md hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-lg"
            >
              {loading ? 'Tegereza...' : 'Komeza'}
            </button>

            <p className="text-xs text-stone-500 text-center">
              Uzabona kode ya SMS igizwe n'imibare 6.
              <br />
              You'll receive a 6-digit code via SMS.
            </p>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center text-sm text-stone-600 mb-4">
              Twohereje kode kuri <strong>{fullPhoneNumber}</strong>.
              <br />
              We sent a code to <strong>{fullPhoneNumber}</strong>.
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-stone-700 mb-2">
                Kode <span className="text-stone-400">(6-digit code)</span>
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                autoFocus
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 text-2xl tracking-widest text-center text-stone-900 placeholder:text-stone-400"
              />
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
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 text-lg text-stone-900 placeholder:text-stone-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 px-6 bg-stone-900 text-white font-medium rounded-md hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-lg"
            >
              {loading ? 'Tegereza...' : 'Iyandikishe'}
            </button>

            <button
              type="button"
              onClick={handleBackToPhone}
              disabled={loading}
              className="w-full py-2 text-sm text-stone-600 hover:text-stone-900 transition"
            >
              ← Hindura nimero ya telefone (change phone number)
            </button>
          </form>
        )}

        {errorMessage && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-center">
            {errorMessage}
          </div>
        )}
      </div>
    </main>
  );
}