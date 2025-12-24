/**
 * Application Type Definitions
 * Centralized type definitions for the entire application
 */

import type { TaskStatus, TaskPriority, UserRole } from '../constants';

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ============================================
// Task Types
// ============================================

export interface Task {
  id: string;
  auth_users_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  tags: string[];
  due_date?: string;
  completed_at?: string;
  ai_generated: boolean;
  ai_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  tags?: string[];
  due_date?: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  tags?: string[];
  due_date?: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  category?: string;
  tags?: string[];
  due_before?: string;
  due_after?: string;
}

// ============================================
// Auth Types
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
  };
}

// ============================================
// API Types
// ============================================

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// ============================================
// AI Types
// ============================================

export interface AISuggestion {
  id: string;
  type: 'task' | 'optimization' | 'reminder';
  title: string;
  description: string;
  confidence: number;
  action?: () => void;
}

export interface AIParseResult {
  action: 'create' | 'update' | 'delete' | 'query';
  parameters: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    due_date?: string;
    [key: string]: unknown;
  };
  confidence: number;
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIInsight {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}

export interface AIProductivityReport {
  overall_health_score: number;
  insights: AIInsight[];
  recommendations: string[];
  stats: {
    tasks_completed: number;
    tasks_pending: number;
    average_completion_time: number;
    productivity_trend: 'up' | 'down' | 'stable';
  };
}

export interface AIAutomation {
  id: string;
  description: string;
  suggestion: string;
  confidence: 'low' | 'medium' | 'high';
  tasks_affected: string[];
  action_type: string;
}

// ============================================
// MQTT Types
// ============================================

export type MQTTEventType = 'created' | 'updated' | 'deleted';

export interface MQTTTaskCreatedEvent {
  event: 'created';
  data: Task;
}

export interface MQTTTaskUpdatedEvent {
  event: 'updated';
  data: Task;
}

export interface MQTTTaskDeletedEvent {
  event: 'deleted';
  data: { id: string };
}

export type MQTTEvent = 
  | MQTTTaskCreatedEvent 
  | MQTTTaskUpdatedEvent 
  | MQTTTaskDeletedEvent;

export type MQTTEventData = Task | { id: string };

export type MQTTCallback = (event: MQTTEventType, data: MQTTEventData) => void;

// ============================================
// Component Props Types
// ============================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

export interface InputProps extends BaseComponentProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AsyncFunction<T = void> = () => Promise<T>;

export type EventHandler<T = void> = (event: React.SyntheticEvent) => T;