// Shared TypeScript interfaces for the entire application

// --- Auth ---
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// --- Tasks ---
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string; // ISO date string: YYYY-MM-DD
  tags: Tag[];
  owner: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  tag_ids?: number[];
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: number;
}

// --- Annotations ---
export interface Point {
  x: number;
  y: number;
}

export interface Polygon {
  id: number;
  label: string;
  points: Point[];
  image: number;
}

export interface AnnotationImage {
  id: number;
  file: string;       // URL from backend media server
  filename: string;
  uploaded_at: string;
  polygons: Polygon[];
}
