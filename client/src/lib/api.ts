// API client utilities for making requests to the backend
import type { 
  AuthResponse, 
  TreesResponse, 
  TreeDetailsResponse, 
  EventsResponse, 
  ContactsResponse, 
  GalleryResponse,
  UsersResponse, 
  StatsResponse,
  MessageResponse
} from './types';


class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new APIError(response.status, error.message || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: (data: any) => fetchAPI<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  login: (data: any) => fetchAPI<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  logout: () => fetchAPI<MessageResponse>('/auth/logout', { method: 'POST' }),
  
  me: () => fetchAPI<AuthResponse>('/auth/me'),
};

// Trees API
export const treesAPI = {
  getAll: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI<TreesResponse>(`/trees${query ? `?${query}` : ''}`);
  },
  
  getOne: (id: string) => fetchAPI<TreeDetailsResponse>(`/trees/${id}`),
  
  create: (data: any) => fetchAPI<MessageResponse>('/trees', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: any) => fetchAPI<MessageResponse>(`/trees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  addUpdate: (id: string, data: any) => fetchAPI<MessageResponse>(`/trees/${id}/updates`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Events API
export const eventsAPI = {
  getAll: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI<EventsResponse>(`/events${query ? `?${query}` : ''}`);
  },
  
  getOne: (id: string) => fetchAPI<EventsResponse>(`/events/${id}`),
  
  create: (data: any) => fetchAPI<MessageResponse>('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  join: (id: string) => fetchAPI<MessageResponse>(`/events/${id}/join`, { method: 'POST' }),
};

// Gallery API
export const galleryAPI = {
  getAll: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI<GalleryResponse>(`/gallery${query ? `?${query}` : ''}`);
  },
  
  create: (data: any) => fetchAPI<MessageResponse>('/gallery', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  like: (id: string) => fetchAPI<MessageResponse>(`/gallery/${id}/like`, { method: 'POST' }),
};

// Contact API
export const contactAPI = {
  submit: (data: any) => fetchAPI<MessageResponse>('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getAll: () => fetchAPI<ContactsResponse>('/contact'),
};

// Stats API
export const statsAPI = {
  getGeneral: () => fetchAPI<StatsResponse>('/stats'),
  
  getUser: (userId: string) => fetchAPI<any>(`/stats/user/${userId}`),
};

// Admin API
export const adminAPI = {
  getUsers: () => fetchAPI<UsersResponse>('/admin/users'),
  
  verifyUser: (userId: string, isVerified: boolean) => fetchAPI<MessageResponse>(`/admin/users/${userId}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ isVerified }),
  }),
};
