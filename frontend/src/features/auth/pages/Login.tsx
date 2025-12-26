/**
 * Login Page
 * Fixed to work with backend /api/auth/login endpoint
 * No TypeScript errors, no ESLint warnings
 */

import { useState, type FormEvent, type JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, Mic, Shield } from 'lucide-react';
import { api, type ApiError } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { createLogger } from '@/utils/logger';
import { toastService } from '@/utils/toast';
import { STORAGE_KEYS, USER_ROLE } from '@/constants';
import type { User } from '@/types';

const logger = createLogger('Login');

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

interface LoginApiResponse {
  user: {
    id: string;
    email: string;
    full_name?: string;
    role?: string;
    avatar_url?: string;
    created_at: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    logger.info('Attempting login', { email: formData.email });

    // Clear any stale auth data first
    logout();

    try {
      // Call the backend endpoint: /api/auth/login
      const response = await api.post<LoginApiResponse>('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      logger.info('Login response received');

      const { user, access_token } = response.data;
      
      if (!access_token) {
        throw new Error('No access token in response');
      }

      // Determine user role from backend response
      // Only aditya@ealphabits.com OR users with role='admin' from backend get admin role
      const isAdminUser = 
        formData.email.toLowerCase() === 'aditya@ealphabits.com' ||
        user?.role === 'admin';

      const userData: User = {
        id: user?.id || '',
        email: user?.email || formData.email,
        full_name: user?.full_name || formData.email.split('@')[0],
        role: isAdminUser ? USER_ROLE.ADMIN : USER_ROLE.USER,
        avatar_url: user?.avatar_url,
        created_at: user?.created_at || new Date().toISOString(),
      };

      // Save token to localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      
      // Save to store
      login(userData, access_token);
      
      logger.info('Login successful', { userId: userData.id, role: userData.role });
      toastService.success(`Welcome back, ${userData.full_name}!`);
      
      navigate('/dashboard');
    } catch (error: unknown) {
      const apiError = error as ApiError;
      logger.error('Login failed', apiError as Error);
      
      // Get error message
      const errorMessage = apiError?.message || 'Invalid email or password';
      
      toastService.error(errorMessage);
      setErrors({ password: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof LoginFormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Task Manager</h1>
              <p className="text-violet-200 text-sm">Powered by Intelligence</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">AI-Powered Tasks</h3>
              <p className="text-violet-200">Smart task creation with natural language</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Voice Commands</h3>
              <p className="text-violet-200">Create tasks by speaking naturally</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Secure & Private</h3>
              <p className="text-violet-200">Your data is encrypted and protected</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-violet-200 text-sm">© 2025 AI Task Manager</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Task Manager</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-500 ${
                    errors.email ? 'border-red-400' : 'border-gray-200'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-500 ${
                    errors.password ? 'border-red-400' : 'border-gray-200'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-4 text-sm text-gray-400">New to AI Task Manager?</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-violet-300 hover:bg-violet-50 transition-all"
          >
            Create an account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}