import { useState, type FormEvent, type ChangeEvent, type JSX } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Brain
} from 'lucide-react';

interface LoginResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Tasks',
    description: 'Smart task creation with natural language',
  },
  {
    icon: Zap,
    title: 'Voice Commands',
    description: 'Create tasks by speaking naturally',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and protected',
  },
];

export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = { email: '', password: '' };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const response = await authService.login(
        formData.email, 
        formData.password
      ) as unknown as LoginResponse;
      
      const role = response.user.role || 
                   (formData.email === 'aditya@ealphabits.com' ? 'admin' : 'user');
      
      login(
        {
          id: response.user.id,
          email: response.user.email,
          full_name: response.user.full_name || formData.email.split('@')[0],
          role: role as 'admin' | 'user',
        },
        response.session.access_token
      );

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>Welcome back, {response.user.full_name || 'User'}!</span>
        </div>
      );
      
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
        </div>
        
        {/* Logo */}
        <div className="relative z-10 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Task Manager</h1>
              <p className="text-violet-200 text-sm">Powered by Intelligence</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="flex items-start gap-4 animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">{feature.title}</h3>
                <p className="text-violet-200 text-sm mt-1">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative z-10 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <p className="text-violet-200 text-sm">
            © 2025 AI Task Manager.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Task Manager</h1>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-2">Sign in to continue to your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`
                    w-full pl-12 pr-4 py-3.5 rounded-xl border bg-white
                    text-gray-900 placeholder-gray-400
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                    ${errors.email 
                      ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`
                    w-full pl-12 pr-12 py-3.5 rounded-xl border bg-white
                    text-gray-900 placeholder-gray-400
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                    ${errors.password 
                      ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <button 
                type="button"
                className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3.5 px-6 rounded-xl font-semibold text-white
                bg-gradient-to-r from-violet-600 to-purple-600
                hover:from-violet-700 hover:to-purple-700
                focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 transform hover:-translate-y-0.5
                flex items-center justify-center gap-2
                shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30
              "
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">New to AI Task Manager?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="
              w-full py-3.5 px-6 rounded-xl font-semibold
              text-gray-700 bg-white border-2 border-gray-200
              hover:border-violet-300 hover:bg-violet-50
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            <span>Create an account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}