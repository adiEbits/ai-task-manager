export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  created_at: string;
}

export interface Task {
  id: string;
  auth_users_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  tags: string[];
  due_date?: string;
  completed_at?: string;
  ai_generated: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ai_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface TaskCreateData {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  tags?: string[];
  due_date?: string;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
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
// MQTT Event Types
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
  data: {
    id: string;
  };
}

export type MQTTEvent = 
  | MQTTTaskCreatedEvent 
  | MQTTTaskUpdatedEvent 
  | MQTTTaskDeletedEvent;

export type MQTTEventType = 'created' | 'updated' | 'deleted';

export type MQTTCallback = (event: MQTTEventType, data: Task | { id: string }) => void;