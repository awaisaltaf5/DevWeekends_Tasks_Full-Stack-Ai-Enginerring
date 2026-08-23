import type { Request } from 'express';

export enum TaskStatus {
  Open = 'Open',
  Completed = 'Completed'
}

export interface Task {
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskBody {
  title?: unknown;
  description?: unknown;
  completed?: unknown;
}

export interface UpdateTaskBody {
  title?: unknown;
  description?: unknown;
  completed?: unknown;
}

export interface AuthPayload {
  id?: string;
  userId?: string;
  email?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: string;
}
