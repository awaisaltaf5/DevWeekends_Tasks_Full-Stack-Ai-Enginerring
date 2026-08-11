import { useState, useEffect } from 'react';
import {
  HiPlus,
  HiOutlineExclamationCircle,
  HiOutlineClipboardList,
  HiRefresh
} from 'react-icons/hi';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import Toast from './Toast';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskApi';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch all tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getTasks();
      setTasks(response.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tasks. Please check if the backend server is running.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await createTask(taskData);
      setTasks([response.data, ...tasks]);
      setShowForm(false);
      showToast('Task created successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create task', 'error');
      throw error;
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      const response = await updateTask(id, taskData);
      setTasks(tasks.map(task => task._id === id ? response.data : task));
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update task', 'error');
      throw error;
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete task', 'error');
      throw error;
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const response = await updateTask(id, { completed });
      setTasks(tasks.map(task => task._id === id ? response.data : task));
    } catch (error) {
      showToast('Failed to update task status', 'error');
      throw error;
    }
  };

  const handleRetry = () => {
    fetchTasks();
  };

  if (loading) {
    return (
      <div className="task-list-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <div className="header-left">
          <h2>My Tasks</h2>
          <span className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn-primary"
          aria-expanded={showForm}
        >
          {showForm ? 'Cancel' : (
            <>
              <HiPlus className="btn-icon-leading" aria-hidden="true" />
              Add Task
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <HiOutlineExclamationCircle className="alert-icon" aria-hidden="true" />
          <div className="alert-content">
            <p>{error}</p>
            <button onClick={handleRetry} className="btn-retry">
              <HiRefresh className="btn-icon-leading" aria-hidden="true" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="task-form-container">
          <TaskForm 
            onSubmit={handleCreateTask} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            <HiOutlineClipboardList />
          </div>
          <h3>No tasks yet</h3>
          <p>Get started by creating your first task!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <HiPlus className="btn-icon-leading" aria-hidden="true" />
            Create Your First Task
          </button>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map(task => (
            <TaskItem
              key={task._id}
              task={task}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
              showToast={showToast}
            />
          ))}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default TaskList;