import api from './api';
import type { ApiResponse, CreateTaskData, Task, TasksResponse, UpdateTaskData } from '../types';

const taskApi = api;

// GET /tasks - Get all tasks
export const getTasks = async (): Promise<TasksResponse> => {
  const response = await taskApi.get<TasksResponse>('/tasks/');
  return response.data;
};

// GET /tasks/:id - Get single task
export const getTask = async (id: string): Promise<ApiResponse<Task>> => {
  const response = await taskApi.get<ApiResponse<Task>>(`/tasks/${id}`);
  return response.data;
};

// POST /tasks - Create new task
export const createTask = async (taskData: CreateTaskData): Promise<ApiResponse<Task>> => {
  const response = await taskApi.post<ApiResponse<Task>>('/tasks/', taskData);
  return response.data;
};

// PUT /tasks/:id - Update task
export const updateTask = async (id: string, taskData: UpdateTaskData): Promise<ApiResponse<Task>> => {
  const response = await taskApi.put<ApiResponse<Task>>(`/tasks/${id}`, taskData);
  return response.data;
};

// DELETE /tasks/:id - Delete task
export const deleteTask = async (id: string): Promise<ApiResponse<{}>> => {
  const response = await taskApi.delete<ApiResponse<{}>>(`/tasks/${id}`);
  return response.data;
};

export default taskApi;