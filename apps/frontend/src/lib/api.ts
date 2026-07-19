/**
 * Ikigega API client — a thin wrapper around fetch()
 * for talking to the NestJS backend at http://localhost:3001
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type User = {
  id: string;
  phoneNumber: string;
  preferredName: string | null;
  privatePinHash: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserInput = {
  phoneNumber: string;
  preferredName?: string;
};

export type ApiError = {
  message: string | string[];
  error: string;
  statusCode: number;
};

/**
 * Register a new user by phone number.
 * Throws on non-2xx responses with the backend's error payload.
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    const messages = Array.isArray(error.message) ? error.message.join(', ') : error.message;
    throw new Error(messages || 'Something went wrong');
  }

  return response.json() as Promise<User>;
}
