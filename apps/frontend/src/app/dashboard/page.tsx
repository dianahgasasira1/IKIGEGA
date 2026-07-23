'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMe,
  createTransaction,
  listTransactions,
  getTodaySummary,
  uploadVoiceRecording,
  confirmVoiceProposal,
  rejectVoiceProposal,
  type User,
  type Transaction,
  type TransactionType,
  type DailySummary,
  type VoiceProposal,
} from '@/lib/api';
import { getToken, clearToken } from '@/lib/auth';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

const TYPE_LABELS: Record<TransactionType, { rw: string; en: string }> = {
  SALE: { rw: 'Ubugurishe', en: 'Sale' },
  PURCHASE: { rw: 'Ubugure', en: 'Purchase' },
  EXPENSE: { rw: 'Igishoro', en: 'Expense' },
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState<TransactionType>('SALE');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [amount, setAmount] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [flashMessage, setFlashMessage] = useState('');

  const recorder = useVoiceRecorder();
  const [proposal, setProposal] = useState<VoiceProposal | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  const loadDashboard = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const [meResult, txResult, summaryResult] = await Promise.all([
        getMe(token),
        listTransactions(token, 10),
        getTodaySummary(token),
      ]);
      setUser(meResult);
      setTransactions(txResult);
      setDailySummary(summaryResult);
    } catch {
      clearToken();
      router.push('/');
      return;
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    setSubmitting(true);
    setFormError('');
    setFlashMessage('');

    try {
      await createTransaction(token, {
        type,
        itemName: itemName.trim(),
        quantity: parseFloat(quantity) || 1,
        amount: parseFloat(amount),
      });

      setItemName('');
      setQuantity('1');
      setAmount('');
      setFlashMessage('Byanditswe neza! (saved)');

      const [updated, refreshedSummary] = await Promise.all([
        listTransactions(token, 10),
        getTodaySummary(token),
      ]);
      setTransactions(updated);
      setDailySummary(refreshedSummary);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Habaye ikosa');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUploadRecording() {
    const token = getToken();
    if (!token || !recorder.audioBlob) return;

    setVoiceLoading(true);
    setVoiceError('');

    try {
      const result = await uploadVoiceRecording(token, recorder.audioBlob);
      setProposal(result);
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : 'Habaye ikosa');
    } finally {
      setVoiceLoading(false);
    }
  }

  async function handleConfirmProposal() {
    const token = getToken();
    if (!token || !proposal) return;

    setVoiceLoading(true);
    setVoiceError('');

    try {
      await confirmVoiceProposal(token, proposal.audioId);

      const [updated, refreshedSummary] = await Promise.all([
        listTransactions(token, 10),
        getTodaySummary(token),
      ]);
      setTransactions(updated);
      setDailySummary(refreshedSummary);

      setProposal(null);
      recorder.reset();
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : 'Habaye ikosa');
    } finally {
      setVoiceLoading(false);
    }
  }

  async function handleRejectProposal() {
    const token = getToken();
    if (!token || !proposal) return;

    setVoiceLoading(true);
    setVoiceError('');

    try {
      await rejectVoiceProposal(token, proposal.audioId);
      setProposal(null);
      recorder.reset();
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : 'Habaye ikosa');
    } finally {
      setVoiceLoading(false);
    }
  }

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
    <main className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Ikigega</h1>
            <p className="text-sm text-stone-600">
              Ikaze, {user?.preferredName || 'mama'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            Sohoka
          </button>
        </header>

        {/* Today's summary */}
        {dailySummary && (
          <section className="bg-white p-6 rounded-lg border border-stone-200 mb-8">
            <h2 className="text-lg font-semibold mb-1 text-stone-900">
              Nyagorora umutungo
            </h2>
            <p className="text-sm text-stone-500 mb-5">Today's summary</p>

            <p className="text-lg text-stone-900 leading-relaxed mb-2">
              {dailySummary.spokenKinyarwanda}
            </p>
            <p className="text-sm text-stone-500 leading-relaxed italic mb-5">
              {dailySummary.spokenEnglish}
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-md border border-green-100">
                <div className="text-xs text-green-700 mb-1">Ubugurishe</div>
                <div className="text-lg font-semibold text-green-800">
                  {dailySummary.revenue.toLocaleString()}
                </div>
                <div className="text-xs text-green-600">RWF</div>
              </div>
              <div className="text-center p-3 bg-stone-50 rounded-md border border-stone-200">
                <div className="text-xs text-stone-600 mb-1">Igishoro</div>
                <div className="text-lg font-semibold text-stone-800">
                  {(dailySummary.expenses + dailySummary.purchases).toLocaleString()}
                </div>
                <div className="text-xs text-stone-500">RWF</div>
              </div>
              <div
                className={`text-center p-3 rounded-md border ${
                  dailySummary.netProfit >= 0
                    ? 'bg-blue-50 border-blue-100'
                    : 'bg-red-50 border-red-100'
                }`}
              >
                <div
                  className={`text-xs mb-1 ${
                    dailySummary.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'
                  }`}
                >
                  {dailySummary.netProfit >= 0 ? 'Inyungu' : 'Igihombo'}
                </div>
                <div
                  className={`text-lg font-semibold ${
                    dailySummary.netProfit >= 0 ? 'text-blue-800' : 'text-red-800'
                  }`}
                >
                  {Math.abs(dailySummary.netProfit).toLocaleString()}
                </div>
                <div
                  className={`text-xs ${
                    dailySummary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
                  }`}
                >
                  RWF
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Voice logging */}
        <section className="bg-white p-6 rounded-lg border border-stone-200 mb-8">
          <h2 className="text-lg font-semibold mb-1 text-stone-900">
            Vuga ubucuruzi
          </h2>
          <p className="text-sm text-stone-500 mb-5">Log by voice</p>

          {!proposal && (
            <div className="text-center">
              {recorder.status === 'idle' && (
                <button
                  onClick={recorder.startRecording}
                  className="w-24 h-24 rounded-full bg-stone-900 text-white text-4xl hover:bg-stone-800 transition"
                  aria-label="Start recording"
                >
                  🎤
                </button>
              )}

              {recorder.status === 'requesting-permission' && (
                <p className="text-stone-600">Tegereza uruhushya...</p>
              )}

              {recorder.status === 'recording' && (
                <div>
                  <button
                    onClick={recorder.stopRecording}
                    className="w-24 h-24 rounded-full bg-red-600 text-white text-4xl hover:bg-red-700 transition animate-pulse"
                    aria-label="Stop recording"
                  >
                    ⏹
                  </button>
                  <p className="mt-3 text-sm text-red-700 font-medium">
                    Uravuga... (recording)
                  </p>
                </div>
              )}

              {recorder.status === 'stopped' && (
                <div className="space-y-3">
                  <div className="text-4xl">🎧</div>
                  <p className="text-sm text-stone-600">
                    Byabitse. Umva nanone maze wemeze.
                    <br />
                    <span className="text-stone-400">Recorded. Listen and confirm.</span>
                  </p>
                  {recorder.audioBlob && (
                    <audio
                      controls
                      src={URL.createObjectURL(recorder.audioBlob)}
                      className="w-full"
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleUploadRecording}
                      disabled={voiceLoading}
                      className="flex-1 py-2 px-4 bg-stone-900 text-white text-sm font-medium rounded-md hover:bg-stone-800 disabled:opacity-40 transition"
                    >
                      {voiceLoading ? 'Tegereza...' : 'Ohereza (send)'}
                    </button>
                    <button
                      onClick={recorder.reset}
                      className="flex-1 py-2 px-4 border border-stone-300 text-stone-700 text-sm font-medium rounded-md hover:bg-stone-50 transition"
                    >
                      Ongera (redo)
                    </button>
                  </div>
                </div>
              )}

              {recorder.status === 'error' && (
                <div>
                  <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">
                    {recorder.error || 'Habaye ikosa'}
                  </p>
                  <button
                    onClick={recorder.reset}
                    className="mt-3 text-sm text-stone-600 hover:text-stone-900"
                  >
                    Ongera ugerageze (try again)
                  </button>
                </div>
              )}
            </div>
          )}

          {proposal && (
            <div className="space-y-4">
              <p className="text-sm text-stone-500 mb-1">Wavuze:</p>
              <p className="text-lg text-stone-900 italic">
                "{proposal.proposed.originalTranscript}"
              </p>

              <div className="bg-stone-50 rounded-md p-4 border border-stone-200">
                <p className="text-sm text-stone-500 mb-3">Twumva:</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-stone-500">Ubwoko:</span>{' '}
                    <span className="font-medium text-stone-900">
                      {TYPE_LABELS[proposal.proposed.type].rw}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500">Ikintu:</span>{' '}
                    <span className="font-medium text-stone-900">
                      {proposal.proposed.itemName}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500">Ingano:</span>{' '}
                    <span className="font-medium text-stone-900">
                      {proposal.proposed.quantity}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500">Amafaranga:</span>{' '}
                    <span className="font-medium text-stone-900">
                      {proposal.proposed.amount.toLocaleString()} RWF
                    </span>
                  </div>
                </div>
                <p className="text-xs text-stone-400 mt-3">
                  Ikizere: {Math.round(proposal.proposed.confidence * 100)}%
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmProposal}
                  disabled={voiceLoading}
                  className="flex-1 py-3 px-4 bg-green-700 text-white font-medium rounded-md hover:bg-green-800 disabled:opacity-40 transition"
                >
                  {voiceLoading ? 'Tegereza...' : 'Emeza (yes, save)'}
                </button>
                <button
                  onClick={handleRejectProposal}
                  disabled={voiceLoading}
                  className="flex-1 py-3 px-4 border border-stone-300 text-stone-700 font-medium rounded-md hover:bg-stone-50 disabled:opacity-40 transition"
                >
                  Oya (no, redo)
                </button>
              </div>
            </div>
          )}

          {voiceError && (
            <p className="mt-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">
              {voiceError}
            </p>
          )}
        </section>

        {/* Log transaction form */}
        <section className="bg-white p-6 rounded-lg border border-stone-200 mb-8">
          <h2 className="text-lg font-semibold mb-1 text-stone-900">
            Andika ubucuruzi
          </h2>
          <p className="text-sm text-stone-500 mb-5">Log a transaction</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Ubwoko <span className="text-stone-400">(type)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(TYPE_LABELS) as TransactionType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 px-3 rounded-md border text-sm font-medium transition ${
                      type === t
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                    }`}
                  >
                    <div>{TYPE_LABELS[t].rw}</div>
                    <div
                      className={`text-xs ${
                        type === t ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      {TYPE_LABELS[t].en}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="itemName"
                className="block text-sm font-medium text-stone-700 mb-2"
              >
                Ikintu <span className="text-stone-400">(item)</span>
              </label>
              <input
                id="itemName"
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="ibitunguru"
                required
                maxLength={100}
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900 placeholder:text-stone-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-stone-700 mb-2"
                >
                  Ingano <span className="text-stone-400">(qty)</span>
                </label>
                <input
                  id="quantity"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900 placeholder:text-stone-400"
                />
              </div>
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-stone-700 mb-2"
                >
                  Amafaranga <span className="text-stone-400">(RWF)</span>
                </label>
                <input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  required
                  className="w-full px-4 py-3 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !itemName.trim() || !amount}
              className="w-full py-3 px-6 bg-stone-900 text-white font-medium rounded-md hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Tegereza...' : 'Bika'}
            </button>

            {formError && (
              <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">
                {formError}
              </p>
            )}
            {flashMessage && (
              <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-md p-3">
                {flashMessage}
              </p>
            )}
          </form>
        </section>

        {/* Recent transactions */}
        <section className="bg-white p-6 rounded-lg border border-stone-200">
          <h2 className="text-lg font-semibold mb-1 text-stone-900">
            Ubucuruzi bwa vuba
          </h2>
          <p className="text-sm text-stone-500 mb-5">Recent transactions</p>

          {transactions.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-8">
              Nta bucuruzi bwabaye. Andika ubwa mbere hejuru.
              <br />
              <span className="text-stone-400">
                No transactions yet. Log your first one above.
              </span>
            </p>
          ) : (
            <ul className="divide-y divide-stone-200">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-stone-900">{tx.itemName}</div>
                    <div className="text-xs text-stone-500">
                      {TYPE_LABELS[tx.type].rw} · {parseFloat(tx.quantity)} ·{' '}
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    className={`font-semibold ${
                      tx.type === 'SALE' ? 'text-green-700' : 'text-stone-700'
                    }`}
                  >
                    {tx.type === 'SALE' ? '+' : '−'}{' '}
                    {parseFloat(tx.amount).toLocaleString()} RWF
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
