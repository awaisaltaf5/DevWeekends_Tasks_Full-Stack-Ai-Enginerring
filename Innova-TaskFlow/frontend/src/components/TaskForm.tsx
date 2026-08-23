import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import type { ApiErrorPayload, CreateTaskData, Task } from '../types';
import { HiOutlineX, HiOutlineExclamationCircle, HiPlus, HiPencilAlt } from 'react-icons/hi';

interface TaskFormProps {
  onSubmit: (taskData: CreateTaskData) => Promise<void>;
  initialData?: Task | null;
  onCancel?: () => void;
}

const TaskForm = ({ onSubmit, initialData = null, onCancel }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCompleted(initialData.completed || false);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        completed
      });

      // Reset form if not editing
      if (!initialData) {
        setTitle('');
        setDescription('');
        setCompleted(false);
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError<ApiErrorPayload>(error) ? error.response?.data?.message : undefined;
      setErrors({ submit: message || 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-header">
        <h2>{initialData ? 'Edit Task' : 'Add New Task'}</h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="form-close" aria-label="Close form">
            <HiOutlineX />
          </button>
        )}
      </div>

      {errors.submit && (
        <div className="alert alert-error" role="alert">
          <HiOutlineExclamationCircle className="alert-icon" aria-hidden="true" />
          <span>{errors.submit}</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">
          Task Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          maxLength={100}
          disabled={isSubmitting}
          autoFocus
          aria-required="true"
          aria-invalid={!!errors.title}
        />
        <div className="form-row">
          {errors.title && <span className="field-error" role="alert">{errors.title}</span>}
          <span className="char-count">{title.length}/100</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          maxLength={500}
          rows={4}
          disabled={isSubmitting}
          aria-describedby="desc-help"
        />
        <div className="form-row">
          {errors.description && <span className="field-error" role="alert">{errors.description}</span>}
          <span className="char-count" id="desc-help">{description.length}/500</span>
        </div>
      </div>

      <div className="form-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            disabled={isSubmitting}
          />
          <span className="checkbox-custom"></span>
          <span>Mark as completed</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? (
            <>
              <span className="spinner-small"></span>
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {initialData ? <HiPencilAlt className="btn-icon-leading" aria-hidden="true" /> : <HiPlus className="btn-icon-leading" aria-hidden="true" />}
              {initialData ? 'Update Task' : 'Create Task'}
            </>
          )}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;