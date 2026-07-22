'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMe,
  createTransaction,
  listTransactions,
  getTodaySummary,
  type User,
  type Transaction,
  type TransactionType,
  type DailySummary,
} from '@/lib/api';
import { getToken, clearToken } from '@/lib/auth';

const TYPE_LABELS: Record<TransactionType, { rw: string; en: string }> = {
  SALE: { rw: 'Ubugurishe', en: 'Sale' },
  PURCHASE: { rw: 'Ubugure', en: 'Purchase' },
  EXPENSE: { rw: 'Igishoro', en: 'Expense' },
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  const [type, setType] = useState<TransactionType>('SALE');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [amount, setAmount] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [flashMessage, setFlashMessage] = useState('');

  const loadDashboard = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const [meResult, txResult] = await Promise.all([
        getMe(token),
        listTransactions(token, 10),
      ]);
      setUser(meResult);
      setTransactions(txResult);
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

  async function handleGetSummary() {
    const token = getToken();
    if (!token) return;

    setSummaryLoading(true);
    setSummaryError('');

    try {
      const result = await getTodaySummary(token);
      setSummary(result);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Habaye ikosa');
    } finally {
      setSummaryLoading(false);
    }
  }

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

      // reset form
      setItemName('');
      setQuantity('1');
      setAmount('');
      setFlashMessage('Byanditswe neza! (saved)');

      // reload the list
      const updated = await listTransactions(token, 10);
      setTransactions(updated);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Habaye ikosa');
    } finally {
      setSubmitting(false);
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
        <section className="bg-white p-6 rounded-lg border border-stone-200 mb-8">
          <h2 className="text-lg font-semibold mb-1 text-stone-900">
            Amakuru y'uyu munsi
          </h2>
          <p className="text-sm text-stone-500 mb-5">
            Incamake y'uyu munsi (Today's summary)
          </p>

          {!summary ? (
            <button
              onClick={handleGetSummary}
              disabled={summaryLoading}
              className="w-full py-3 px-6 bg-stone-900 text-white font-medium rounded-md hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {summaryLoading ? 'Tegereza...' : 'Reba amakuru y\'uyu munsi'}
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-stone-900 leading-relaxed">
                {summary.spokenKinyarwanda}
              </p>
              <p className="text-sm text-stone-500 leading-relaxed italic">
                {summary.spokenEnglish}
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-3 bg-green-50 rounded-md border border-green-100">
                  <div className="text-xs text-green-700 mb-1">Ubugurishe</div>
                  <div className="text-lg font-semibold text-green-800">
                    {summary.revenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600">RWF</div>
                </div>
                <div className="text-center p-3 bg-stone-50 rounded-md border border-stone-200">
                  <div className="text-xs text-stone-600 mb-1">Igishoro</div>
                  <div className="text-lg font-semibold text-stone-800">
                    {(summary.expenses + summary.purchases).toLocaleString()}
                  </div>
                  <div className="text-xs text-stone-500">RWF</div>
                </div>
                <div
                  className={`text-center p-3 rounded-md border ${
                    summary.netProfit >= 0
                      ? 'bg-blue-50 border-blue-100'
                      : 'bg-red-50 border-red-100'
                  }`}
                >
                  <div className={`text-xs mb-1 ${summary.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    {summary.netProfit >= 0 ? 'Inyungu' : 'Igihombo'}
                  </div>
                  <div
                    className={`text-lg font-semibold ${
                      summary.netProfit >= 0 ? 'text-blue-800' : 'text-red-800'
                    }`}
                  >
                    {Math.abs(summary.netProfit).toLocaleString()}
                  </div>
                  <div className={`text-xs ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    RWF
                  </div>
                </div>
              </div>

              <button
                onClick={handleGetSummary}
                disabled={summaryLoading}
                className="w-full py-2 text-sm text-stone-600 hover:text-stone-900 transition"
              >
                ↻ Ongera utangire (refresh)
              </button>

              {summaryError && (
                <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">
                  {summaryError}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Log transaction form */}
        <section className="bg-white p-6 rounded-lg border border-stone-200 mb-8">
          <h2 className="text-lg font-semibold mb-1 text-stone-900">
            Andika ubucuruzi
          </h2>
          <p className="text-sm text-stone-500 mb-5">
            Log a transaction
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type picker */}
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
                    <div className={`text-xs ${type === t ? 'text-stone-300' : 'text-stone-400'}`}>
                      {TYPE_LABELS[t].en}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Item name */}
            <div>
              <label htmlFor="itemName" className="block text-sm font-medium text-stone-700 mb-2">
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
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 placeholder:text-stone-400"
              />
            </div>

            {/* Quantity + Amount row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-stone-700 mb-2">
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
                <label htmlFor="amount" className="block text-sm font-medium text-stone-700 mb-2">
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
            Ibyanditswe vuba
          </h2>
          <p className="text-sm text-stone-500 mb-5">
            Recent transactions
          </p>

          {transactions.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-8">
              Nta bwanditswe bwabaye. Andika ubwa mbere hejuru.
              <br />
              <span className="text-stone-400">
                No transactions yet. Log your first one above.
              </span>
            </p>
          ) : (
            <ul className="divide-y divide-stone-200">
              {transactions.map((tx) => (
                <li key={tx.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-stone-900">{tx.itemName}</div>
                    <div className="text-xs text-stone-500">
                      {TYPE_LABELS[tx.type].rw} · {parseFloat(tx.quantity)} · {new Date(tx.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    className={`font-semibold ${
                      tx.type === 'SALE' ? 'text-green-700' : 'text-stone-700'
                    }`}
                  >
                    {tx.type === 'SALE' ? '+' : '−'} {parseFloat(tx.amount).toLocaleString()} RWF
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-center text-xs text-stone-500 mt-8">
          Ikigega · Sprint 2
        </p>
      </div>
    </main>
  );
}