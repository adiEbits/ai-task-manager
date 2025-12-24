/**
 * Application Constants
 * Centralized configuration for the entire application
 */

// Task Status Configuration
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_STATUS_CONFIG: Record<TaskStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  [TASK_STATUS.TODO]: {
    label: 'To Do',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
  },
  [TASK_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  [TASK_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
  },
  [TASK_STATUS.ARCHIVED]: {
    label: 'Archived',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  },
};

// Task Priority Configuration
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  order: number;
}> = {
  [TASK_PRIORITY.LOW]: {
    label: 'Low',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    dotColor: 'bg-slate-400',
    order: 3,
  },
  [TASK_PRIORITY.MEDIUM]: {
    label: 'Medium',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    order: 2,
  },
  [TASK_PRIORITY.HIGH]: {
    label: 'High',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
    order: 1,
  },
  [TASK_PRIORITY.URGENT]: {
    label: 'Urgent',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-500',
    order: 0,
  },
};

// User Roles
export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
  },
  TASKS: {
    BASE: '/api/tasks',
    BY_ID: (id: string) => `/api/tasks/${id}`,
    BULK: '/api/tasks/bulk',
  },
  AI: {
    SUGGESTIONS: '/api/ai/suggestions',
    ENHANCE: '/api/ai/enhance',
    PRIORITIZE: '/api/ai/prioritize',
    VOICE_PARSE: '/api/ai/voice/parse',
    NLP_PARSE: '/api/ai/nlp/parse-task',
    HELP_CHAT: '/api/ai/help/chat',
    COACH_CHAT: '/api/ai/coach/chat',
    REPORTS: '/api/ai/reports/generate',
    AUTOMATIONS: '/api/ai/automations/analyze',
    DOCUMENTS: '/api/ai/documents/generate',
  },
  NOTIFICATIONS: {
    SEND_REMINDER: '/api/notifications/send-reminder',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  ACCESS_TOKEN: 'access_token',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
} as const;

// Timing Constants
export const TIMING = {
  DEBOUNCE_MS: 300,
  TOAST_DURATION: 4000,
  TOAST_ERROR_DURATION: 5000,
  API_TIMEOUT: 30000,
  NOTIFICATION_CHECK_INTERVAL: 15 * 60 * 1000, // 15 minutes
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Sort Options
export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];