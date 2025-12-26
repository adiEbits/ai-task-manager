/**
 * EditUserModal Component
 * Modal for editing existing users
 * 
 * @module features/users/components/EditUserModal
 */

import { useState, useEffect, type JSX } from 'react';
import { X, UserCog } from 'lucide-react';
import UserForm from './UserForm';
import type { UserFormData } from './UserForm';
import { userService } from '../services/userService';
import { LoadingSpinner } from '@/components/common';
import type { User, ApiErrorResponse } from '@/types';
import toast from 'react-hot-toast';

interface EditUserModalProps {
  open: boolean;
  userId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({ 
  open, 
  userId,
  onClose, 
  onSuccess 
}: EditUserModalProps): JSX.Element | null {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (open && userId) {
      loadUser(userId);
    } else {
      setUser(null);
    }
  }, [open, userId]);

  const loadUser = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const userData = await userService.getUser(id);
      setUser(userData);
    } catch (error: unknown) {
      console.error('Failed to load user:', error);
      toast.error('Failed to load user');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UserFormData): Promise<void> => {
    if (!userId) return;
    
    setSaving(true);
    
    try {
      const updateData: Record<string, string> = {
        email: data.email,
        full_name: data.full_name,
        role: data.role,
      };
      
      if (data.password) {
        updateData.password = data.password;
      }
      
      await userService.updateUser(userId, updateData);
      
      toast.success('User updated successfully!');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      const errorMessage = apiError.response?.data?.detail 
        ?? apiError.message 
        ?? 'Failed to update user';
      
      console.error('Failed to update user:', error);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget && !saving) {
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
      aria-labelledby="edit-user-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <UserCog className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="edit-user-title" className="text-lg font-bold text-gray-900">
                Edit User
              </h2>
              <p className="text-sm text-gray-500">
                {loading ? 'Loading...' : user?.full_name ?? 'Update user details'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-white/80 rounded-xl transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4">Loading user...</p>
              </div>
            </div>
          ) : user ? (
            <UserForm
              initialData={{
                email: user.email,
                full_name: user.full_name,
                role: user.role as 'admin' | 'user',
              }}
              onSubmit={handleSubmit}
              onCancel={onClose}
              isEdit
              loading={saving}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">User not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}