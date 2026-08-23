import axios from 'axios';
import api from './api';

const taskApi = axios.create({
  baseURL: `${api.defaults.baseURL}/tasks`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// GET /tasks - Get all tasks
export const getTasks = async () => {
  const response = await taskApi.get('/');
  return response.data;
};

// GET /tasks/:id - Get single task
export const getTask = async (id) => {
  const response = await taskApi.get(`/${id}`);
  return response.data;
};

// POST /tasks - Create new task
export const createTask = async (taskData) => {
  const response = await taskApi.post('/', taskData);
  return response.data;
};

// PUT /tasks/:id - Update task
export const updateTask = async (id, taskData) => {
  const response = await taskApi.put(`/${id}`, taskData);
  return response.data;
};

// DELETE /tasks/:id - Delete task
export const deleteTask = async (id) => {
  const response = await taskApi.delete(`/${id}`);
  return response.data;
};

export default taskApi;