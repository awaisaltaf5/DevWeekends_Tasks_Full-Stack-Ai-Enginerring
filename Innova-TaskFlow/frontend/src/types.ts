export enum TaskStatus {
  Open = 'Open',
  Completed = 'Completed'
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface TasksResponse extends ApiResponse<Task[]> {
  count: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastState = { message: string; type: ToastType } | null;

export interface ApiErrorPayload {
  message?: string;
}