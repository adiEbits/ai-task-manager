import { api } from './api';

interface LoginResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  access_token: string;
  refresh_token: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  access_token: string;
  refresh_token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      return {
        user: response.data.user,
        session: {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
        },
      } as any;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  async register(
    email: string,
    password: string,
    fullName: string
  ): Promise<RegisterResponse> {
    try {
      const response = await api.post('/api/auth/register', {
        email,
        password,
        full_name: fullName,
      });

      return {
        user: response.data.user,
        session: {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
        },
      } as any;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Registration failed'
      );
    }
  },

  async logout(): Promise<void> {
    // Just clear local storage, backend is stateless
    localStorage.removeItem('access_token');
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};