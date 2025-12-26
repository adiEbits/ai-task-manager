/**
 * AddUserModal Component
 * Modal for creating new users
 * 
 * @module features/users/components/AddUserModal
 */

import { useState, type JSX } from 'react';
import { X, UserPlus } from 'lucide-react';
import UserForm from './UserForm';
import type { UserFormData } from './UserForm';
import { userService } from '../services/userService';
import type { ApiErrorResponse } from '@/types';
import toast from 'react-hot-toast';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserModal({ 
  open, 
  onClose, 
  onSuccess 
}: AddUserModalProps): JSX.Element | null {
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (data: UserFormData): Promise<void> => {
    setLoading(true);
    
    try {
      await userService.createUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: data.role,
      });
      
      toast.success('User created successfully!');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      const errorMessage = apiError.response?.data?.detail 
        ?? apiError.message 
        ?? 'Failed to create user';
      
      console.error('Failed to create user:', error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-user-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="add-user-title" className="text-lg font-bold text-gray-900">
                Add New User
              </h2>
              <p className="text-sm text-gray-500">Create a new user account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-white/80 rounded-xl transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6">
          <UserForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}