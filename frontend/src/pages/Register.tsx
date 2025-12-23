import { useState, type FormEvent, type ChangeEvent, type JSX } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  User,
  Eye, 
  EyeOff, 
  Loader2, 
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Check
} from 'lucide-react';

interface RegisterResponse {
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
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const passwordRequirements = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
];

export default function Register(): JSX.Element {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = { 
      fullName: '', 
      email: '', 
      password: '', 
      confirmPassword: '' 
    };
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
      isValid = false;
    }

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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await authService.register(
        formData.email, 
        formData.password,
        formData.fullName
      ) as unknown as RegisterResponse;
      
      login(
        {
          id: response.user.id,
          email: response.user.email,
          full_name: response.user.full_name || formData.fullName,
          role: 'user',
        },
        response.session.access_token
      );

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>Account created successfully!</span>
        </div>
      );
      
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Register error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
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
            <h2 className="text-3xl font-bold text-gray-900">Create account</h2>
            <p className="text-gray-500 mt-2">Start managing tasks with AI power</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label 
                htmlFor="fullName" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`
                    w-full pl-12 pr-4 py-3.5 rounded-xl border bg-white
                    text-gray-900 placeholder-gray-400
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                    ${errors.fullName 
                      ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

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
                <p className="mt-2 text-sm text-red-500">{errors.email}</p>
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
                  autoComplete="new-password"
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
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">{errors.password}</p>
              )}
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {passwordRequirements.map((req) => (
                    <div 
                      key={req.id}
                      className={`flex items-center gap-2 text-xs ${
                        req.test(formData.password) ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${
                        req.test(formData.password) ? 'opacity-100' : 'opacity-40'
                      }`} />
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`
                    w-full pl-12 pr-12 py-3.5 rounded-xl border bg-white
                    text-gray-900 placeholder-gray-400
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                    ${errors.confirmPassword 
                      ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
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
              <span className="px-4 bg-gray-50 text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="
              w-full py-3.5 px-6 rounded-xl font-semibold
              text-gray-700 bg-white border-2 border-gray-200
              hover:border-violet-300 hover:bg-violet-50
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            <span>Sign in instead</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-bl from-purple-600 via-violet-600 to-indigo-700 p-12 flex-col justify-center items-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-40 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4">
            Supercharge Your Productivity
          </h2>
          
          <p className="text-violet-200 text-lg mb-8">
            Join thousands of users who manage their tasks smarter with AI-powered assistance.
          </p>

          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-violet-200 text-sm">Active Users</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-violet-200 text-sm">Tasks Created</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">99%</div>
              <div className="text-violet-200 text-sm">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}