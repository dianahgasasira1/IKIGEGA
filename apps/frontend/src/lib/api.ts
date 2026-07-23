/**
 * Ikigega API client
 * Talks to the NestJS backend at http://localhost:3001
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================
// Types
// ============================================================

export type User = {
  id: string;
  phoneNumber: string;
  preferredName: string | null;
  createdAt: string;
};

export type RegisterResponse = {
  message: string;
  phoneNumber: string;
  expiresInMinutes: number;
};

export type VerifyOtpResponse = {
  token: string;
  user: {
    id: string;
    phoneNumber: string;
    preferredName: string | null;
  };
};

export type ApiError = {
  message: string | string[];
  error: string;
  statusCode: number;
};

// ============================================================
// Helper: throws a real Error on non-2xx responses
// ============================================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    const messages = Array.isArray(error.message) ? error.message.join(', ') : error.message;
    throw new Error(messages || 'Something went wrong');
  }
  return response.json() as Promise<T>;
}

// ============================================================
// Auth endpoints
// ============================================================

/**
 * Step 1 of registration: request an OTP for a phone number.
 */
export async function requestOtp(phoneNumber: string): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  });
  return handleResponse<RegisterResponse>(response);
}

/**
 * Step 2 of registration: submit the OTP + optional name to receive a JWT.
 */
export async function verifyOtp(input: {
  phoneNumber: string;
  otp: string;
  preferredName?: string;
}): Promise<VerifyOtpResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<VerifyOtpResponse>(response);
}

/**
 * Get the currently-logged-in user's profile.
 * Requires a valid JWT.
 */
export async function getMe(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<User>(response);
}

// ============================================================
// Transactions
// ============================================================

export type TransactionType = 'SALE' | 'PURCHASE' | 'EXPENSE';

export type Transaction = {
  id: string;
  businessId: string;
  type: TransactionType;
  itemName: string;
  inventoryItemId: string | null;
  quantity: string; // Prisma Decimal comes across as string
  amount: string;
  timestamp: string;
  isConfirmed: boolean;
  inventoryItem?: {
    name: string;
    unitOfMeasure: string;
  } | null;
};

export type CreateTransactionInput = {
  type: TransactionType;
  itemName: string;
  quantity?: number;
  amount: number;
};

export async function createTransaction(
  token: string,
  input: CreateTransactionInput,
): Promise<Transaction> {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  return handleResponse<Transaction>(response);
}

export async function listTransactions(
  token: string,
  limit = 20,
): Promise<Transaction[]> {
  const response = await fetch(
    `${API_BASE_URL}/transactions?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return handleResponse<Transaction[]>(response);
}

// ============================================================
// Summary
// ============================================================

export type DailySummary = {
  date: string;
  revenue: number;
  expenses: number;
  purchases: number;
  netProfit: number;
  transactionCount: number;
  spokenKinyarwanda: string;
  spokenEnglish: string;
};

export async function getTodaySummary(token: string): Promise<DailySummary> {
  const response = await fetch(`${API_BASE_URL}/summary/today`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<DailySummary>(response);
}

// ============================================================
// Voice
// ============================================================

export type VoiceProposal = {
  audioId: string;
  proposed: {
    type: 'SALE' | 'PURCHASE' | 'EXPENSE';
    itemName: string;
    quantity: number;
    amount: number;
    confidence: number;
    originalTranscript: string;
  };
};

export async function uploadVoiceRecording(
  token: string,
  audioBlob: Blob,
): Promise<VoiceProposal> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  const response = await fetch(`${API_BASE_URL}/voice/log-sale`, {
    method: 'POST',
    headers: {
      // Note: NO 'Content-Type' — browser sets it with the correct boundary
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return handleResponse<VoiceProposal>(response);
}

export async function confirmVoiceProposal(
  token: string,
  audioId: string,
): Promise<Transaction> {
  const response = await fetch(`${API_BASE_URL}/voice/confirm/${audioId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<Transaction>(response);
}

export async function rejectVoiceProposal(
  token: string,
  audioId: string,
): Promise<{ rejected: boolean }> {
  const response = await fetch(`${API_BASE_URL}/voice/reject/${audioId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<{ rejected: boolean }>(response);
}