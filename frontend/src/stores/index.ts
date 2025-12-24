/**
 * Stores Index
 * Export all stores for easy importing
 */

export {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectIsAdmin,
} from './authStore';

export {
  useTaskStore,
  selectTasks,
  selectSelectedTasks,
  selectFilters,
  selectIsLoading,
  selectError,
} from './taskStore';