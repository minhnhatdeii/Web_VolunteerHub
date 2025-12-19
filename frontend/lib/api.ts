import { Event } from '@/types/event';
import { GetRegistrationsOptions, Registration } from '@/types/registration';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Generic API call function
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    const baseHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        ...baseHeaders,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Event API functions
export const eventApi = {
  // Get all events
  getEvents: async (): Promise<ApiResponse<Event[]>> => {
    return apiCall<Event[]>('/events');
  },

  // Get a specific event by ID
  getEventById: async (id: string): Promise<ApiResponse<Event>> => {
    return apiCall<Event>(`/events/${id}`);
  },

  // Get manager events by manager ID
  getManagerEvents: async (managerId: string): Promise<ApiResponse<Event[]>> => {
    return apiCall<Event[]>(`/events/manager/${managerId}/events`);
  },

  // Admin fetch events with optional status (requires admin token)
  getAdminEvents: async (token: string, status?: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const endpoint = `/admin/events${params.toString() ? `?${params.toString()}` : ''}`;
    return apiCall<any>(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Search events with filters
  searchEvents: async (params?: {
    search?: string;
    category?: string;
    status?: string;
  }): Promise<ApiResponse<Event[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/events?${queryString}` : '/events';

    return apiCall<Event[]>(endpoint);
  },
};


export const registrationApi = {
  getMyRegistrations: async (token: string): Promise<ApiResponse<any>> => {
    return apiCall<any>('/registrations/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getEventRegistrations: async (
    eventId: string,
    options?: GetRegistrationsOptions
  ): Promise<ApiResponse<Registration[]>> => {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status.join(','));
    params.append('countOnly', 'false');

    const headers: Record<string, string> = {};
    if (options?.managerToken) headers['Authorization'] = `Bearer ${options.managerToken}`;

    const endpoint = `/registrations/event/${eventId}?${params.toString()}`;
    const result = await apiCall<Registration[]>(endpoint, { headers });

    return result;
  },

  getEventRegistrationCount: async (
    eventId: string,
    options?: { status?: string[] }
  ): Promise<ApiResponse<{ count: number }>> => { // <--- đây là ApiResponse
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status.join(','));
    params.append('countOnly', 'true');

    const endpoint = `/registrations/event/${eventId}?${params.toString()}`;
    const result = await apiCall<{ count: number }>(endpoint);
    return result; // trả về ApiResponse<{ count: number }>
  },

  //REGISTRATION API FUNCTIONS
  // Register for an event
  registerForEvent: async (eventId: string, token: string): Promise<ApiResponse<any>> => {
    return apiCall(`/registrations/${eventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Cancel registration for an event
  cancelRegistration: async (eventId: string, token: string): Promise<ApiResponse<any>> => {
    return apiCall(`/registrations/${eventId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  approveRegistration: async (
    eventId: string,
    registrationId: string,
    token: string
  ): Promise<ApiResponse<any>> => {

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    return apiCall(`/registrations/${eventId}/${registrationId}/approve`,
      {
        method: "POST",
        headers,
      }
    );
  },

  rejectRegistration: async (
    eventId: string,
    registrationId: string,
    token: string
  ): Promise<ApiResponse<any>> => {

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    return apiCall<any>(`/registrations/${eventId}/${registrationId}/reject`,
      {
        method: "POST",
        headers,
      }
    );
  },

};

// Posts / Comments API functions
export const postApi = {
  getEventPosts: async (eventId: string, options?: { limit?: number; cursor?: string }): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.cursor) params.append('cursor', options.cursor);
    const qs = params.toString();
    const endpoint = `/events/${eventId}/posts${qs ? `?${qs}` : ""}`;
    return apiCall<any>(endpoint);
  },

  createPost: async (
    eventId: string,
    payload: { content?: string; file?: File | null },
    token: string
  ): Promise<ApiResponse<any>> => {
    const form = new FormData();
    if (payload.content) form.append("content", payload.content);
    if (payload.file) form.append("image", payload.file);

    return apiCall<any>(`/events/${eventId}/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form as any,
    });
  },

  addComment: async (postId: string, content: string, token: string): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/posts/${postId}/comments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  },

  toggleLike: async (postId: string, token: string): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};


// User API functions
export const userApi = {
  // Get current user's profile
  getProfile: async (token: string): Promise<ApiResponse<any>> => {
    return apiCall<any>('/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Update current user's profile
  updateProfile: async (token: string, payload: any): Promise<ApiResponse<any>> => {
    return apiCall<any>('/users/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  // Upload avatar using base64/dataUrl
  uploadAvatar: async (token: string, payload: { dataUrl?: string; base64?: string; contentType?: string }) => {
    return apiCall<any>('/users/me/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },
};

// Auth API functions
export const authApi = {
  // Login
  login: async (email: string, password: string): Promise<ApiResponse<any>> => {
    return apiCall<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Register
  register: async (userData: any): Promise<ApiResponse<any>> => {
    return apiCall<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Notification API functions
export const notificationApi = {
  // Get user notifications
  getNotifications: async (
    token: string,
    options?: { limit?: number; offset?: number; unreadOnly?: boolean }
  ): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.unreadOnly) params.append('unreadOnly', 'true');

    const queryString = params.toString();
    const endpoint = queryString ? `/users/me/notifications?${queryString}` : '/users/me/notifications';

    return apiCall<any>(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get unread notification count
  getUnreadCount: async (token: string): Promise<ApiResponse<{ count: number }>> => {
    return apiCall<{ count: number }>('/users/me/notifications/unread-count', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Mark a notification as read
  markAsRead: async (token: string, notificationId: string): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/users/me/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Mark all notifications as read
  markAllAsRead: async (token: string): Promise<ApiResponse<any>> => {
    return apiCall<any>('/users/me/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
