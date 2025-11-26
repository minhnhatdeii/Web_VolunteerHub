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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
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


// User API functions
export const userApi = {
  // Get current user's profile
  getProfile: async (token: string): Promise<ApiResponse<any>> => {
    return apiCall<any>('/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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