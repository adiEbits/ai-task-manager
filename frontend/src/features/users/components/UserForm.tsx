/**
 * UserForm Component
 * Reusable form for creating and editing users
 * 
 * @module features/users/components/UserForm
 */

import { useState, type FormEvent, type JSX } from 'react';
import { User, Mail, Lock, Shield, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/common';

export interface UserFormData {
  email: string;
  full_name: string;
  password: string;
  role: 'admin' | 'user';
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  loading?: boolean;
}

export default function UserForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
  loading = false,
}: UserFormProps): JSX.Element {
  const [formData, setFormData] = useState<UserFormData>({
    email: initialData?.email ?? '',
    full_name: initialData?.full_name ?? '',
    password: '',
    role: initialData?.role ?? 'user',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!isEdit && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isEdit && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleChange = (field: keyof UserFormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <label 
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all ${
              errors.full_name 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 bg-white'
            }`}
            placeholder="John Doe"
            disabled={loading}
          />
        </div>
        {errors.full_name && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.full_name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label 
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all ${
              errors.email 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 bg-white'
            }`}
            placeholder="john@example.com"
            disabled={loading}
          />
        </div>
        {errors.email && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label 
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password {!isEdit && <span className="text-red-500">*</span>}
          {isEdit && <span className="text-gray-400 text-xs ml-1">(leave empty to keep current)</span>}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all ${
              errors.password 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 bg-white'
            }`}
            placeholder="••••••••"
            disabled={loading}
          />
        </div>
        {errors.password && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.password}
          </p>
        )}
      </div>

      {/* Role */}
      <div>
        <label 
          htmlFor="role"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Role
        </label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            id="role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all appearance-none"
            disabled={loading}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-purple-200"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="text-white" />
              <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
            </>
          ) : (
            <span>{isEdit ? 'Update User' : 'Create User'}</span>
          )}
        </button>
      </div>
    </form>
  );
}