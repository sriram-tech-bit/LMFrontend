import type {
  ApiEnvelope,
  Book,
  BorrowRecord,
  LoginResponse,
  Member,
  MemberHistory,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const token = localStorage.getItem('shelflife-token');
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(`Could not connect to the library API at ${API_BASE}. Check that the backend is running.`, 0);
  }

  let payload: Partial<ApiEnvelope<T>> & { error?: { message?: string } };
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new ApiError(`The API returned an unreadable response (${response.status}).`, response.status);
  }

  if (!response.ok || payload.success === false) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event('shelflife:unauthorized'));
    }
    throw new ApiError(payload.message ?? payload.error?.message ?? `Request failed (${response.status}).`, response.status);
  }
  if (!('data' in payload)) {
    throw new ApiError('The API response did not include the expected data.', response.status);
  }

  return payload as ApiEnvelope<T>;
}

function queryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  const result = query.toString();
  return result ? `?${result}` : '';
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  registerLibrarian: (payload: { name: string; email: string; password: string }) =>
    request<{ id: string; name: string; email: string; role: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listBooks: (params: { search?: string; genre?: string; available?: boolean; page?: number; limit?: number } = {}) =>
    request<Book[]>(`/books${queryString({
      search: params.search,
      genre: params.genre,
      available: params.available === undefined ? undefined : String(params.available),
      page: params.page ?? 1,
      limit: params.limit ?? 100,
      sort: 'title',
    })}`),

  listMembers: (params: { search?: string; status?: string; page?: number; limit?: number } = {}) =>
    request<Member[]>(`/members${queryString({
      search: params.search,
      status: params.status,
      page: params.page ?? 1,
      limit: params.limit ?? 100,
    })}`),

  issueBook: (payload: { book: string; member: string }) =>
    request<{ borrow: BorrowRecord; book: Book; member: Pick<Member, 'id' | 'name' | 'membershipId'> }>('/borrow', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  memberHistory: (memberId: string) =>
    request<MemberHistory>(`/members/${encodeURIComponent(memberId)}/history?page=1&limit=100&sort=-issueDate`),
};
