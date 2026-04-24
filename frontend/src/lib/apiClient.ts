import { useAuthStore } from '@/store/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiClient<T>(
  endpoint: string,
  { params, ...customConfig }: FetchOptions = {}
): Promise<T> {
  const jwt = useAuthStore.getState().jwt;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (jwt) {
    headers.Authorization = `Bearer ${jwt}`;
  }

  const config: FetchOptions = {
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (response.ok) {
    return data;
  }

  throw {
    status: response.status,
    ...data.error,
  };
}

import { User, StrapiMessage, StrapiCollectionResponse } from '@/types';

export const authApi = {
  login: (body: object) =>
    apiClient<{ user: User; jwt: string }>('/api/auth/local', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  register: (body: object) =>
    apiClient<{ user: User; jwt: string }>('/api/auth/local/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
export const messagesApi = {
  getByRoom: (room: string) =>
    apiClient<StrapiCollectionResponse<StrapiMessage>>(`/api/messages`, {
      params: {
        'filters[room][$eq]': room,
        'populate': 'sender',
        'sort[0]': 'createdAt:desc',
        'pagination[limit]': '50',
      },
    }),
};
