export interface User {
  id: number;
  username: string;
  email: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface AuthError {
  status: number;
  name: string;
  message: string;
  details: Record<string, unknown>;
}

export interface Message {
  id?: number;
  username: string;
  text: string;
  timestamp: string;
  room: string;
}

export interface StrapiMessage {
  text: string;
  room: string;
  createdAt: string;
  sender?: {
    data?: {
      attributes: User;
    };
  };
}

export interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

export interface StrapiCollectionResponse<T> {
  data: StrapiEntity<T>[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface AuthState {
  user: User | null;
  jwt: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, jwt: string) => void;
  logout: () => void;
}
