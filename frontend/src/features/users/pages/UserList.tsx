/**
 * UserList Page
 * Admin page to manage platform users with modal-based CRUD
 * Uses skeleton loaders for better UX
 * 
 * @module features/users/pages/UserList
 */

import { useState, useEffect, useCallback, type JSX } from 'react';
import { 
  Users, 
  Mail, 
  Shield, 
  Trash2, 
  Plus, 
  Search, 
  Edit2,
  RefreshCw 
} from 'lucide-react';
import { 
  PageHeader, 
  ConfirmDialog, 
  EmptyState,
  TableSkeleton,
  StatCardSkeleton 
} from '@/components/common';
import { AddUserModal, EditUserModal } from '../components';
import { userService } from '../services/userService';
import type { User, ApiErrorResponse } from '@/types';
import toast from 'react-hot-toast';

export default function UserList(): JSX.Element {
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal State
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  
  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [deleting, setDeleting] = useState<boolean>(false);

  const loadUsers = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error: unknown) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAddClick = (): void => {
    setAddModalOpen(true);
  };

  const handleEditClick = (user: User): void => {
    setEditUserId(user.id);
    setEditModalOpen(true);
  };

  const handleToggleRole = async (user: User): Promise<void> => {
    try {
      await userService.toggleRole(user.id, user.role as 'admin' | 'user');
      toast.success('User role updated!');
      loadUsers();
    } catch (error: unknown) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleDeleteClick = (user: User): void => {
    setDeleteDialog({ open: true, user });
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteDialog.user) return;
    
    setDeleting(true);
    
    try {
      await userService.deleteUser(deleteDialog.user.id);
      toast.success('User deleted successfully!');
      setDeleteDialog({ open: false, user: null });
      loadUsers();
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      const errorMessage = apiError.response?.data?.detail 
        ?? apiError.message 
        ?? 'Failed to delete user';
      
      console.error('Failed to delete user:', error);
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleModalSuccess = (): void => {
    loadUsers();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    regularUsers: users.filter((u) => u.role === 'user').length,
  };

  // Loading State with Skeleton
  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <PageHeader
          icon={<Users className="w-8 h-8" />}
          title="User Management"
          description="Loading users..."
        />
        
        {/* Stats Skeleton */}
        <StatCardSkeleton count={3} />
        
        {/* Table Skeleton */}
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Page Header */}
        <PageHeader
          icon={<Users className="w-8 h-8" />}
          title="User Management"
          description={`Manage platform users and roles (${users.length} total)`}
          actions={
            <button
              type="button"
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-200"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add User</span>
            </button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-600 mb-1">Total Users</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-600 mb-1">Admins</div>
            <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-600 mb-1">Regular Users</div>
            <div className="text-2xl font-bold text-blue-600">{stats.regularUsers}</div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
            />
          </div>
          <button
            type="button"
            onClick={loadUsers}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-16 h-16" />}
            title={users.length === 0 ? 'No users yet' : 'No matching users'}
            description={users.length === 0 
              ? 'Create your first user to get started' 
              : 'Try adjusting your search'
            }
            action={users.length === 0 && (
              <button
                type="button"
                onClick={handleAddClick}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            )}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Role
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Joined
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {user.full_name?.charAt(0).toUpperCase() ?? user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {user.full_name ?? 'No name'}
                            </div>
                            <div className="text-sm text-gray-500 truncate">{user.email}</div>
                            {/* Mobile role badge */}
                            <div className="sm:hidden mt-1">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {user.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleRole(user)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Toggle role"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditClick(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => window.open(`mailto:${user.email}`)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors hidden sm:block"
                            title="Send email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Edit User Modal */}
      <EditUserModal
        open={editModalOpen}
        userId={editUserId}
        onClose={() => {
          setEditModalOpen(false);
          setEditUserId(null);
        }}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteDialog.user?.full_name ?? deleteDialog.user?.email}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}