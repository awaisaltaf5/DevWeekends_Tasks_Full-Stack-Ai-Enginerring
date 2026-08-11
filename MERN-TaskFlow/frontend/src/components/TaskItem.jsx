import { useState } from 'react';
import {
  HiPencilAlt,
  HiOutlineTrash,
  HiCalendar,
  HiFlag,
  HiOutlineCheckCircle,
  HiOutlineClock
} from 'react-icons/hi';
import Modal from './Modal';

// Derive a status label from the completed flag. (Kept pure/presentational.)
const getStatus = (completed) => (completed ? 'Completed' : 'Open');

const TaskItem = ({ task, onUpdate, onDelete, onToggleComplete, showToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setError('');
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setError('Title is required');
      return;
    }

    if (editTitle.length > 100) {
      setError('Title must be less than 100 characters');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      await onUpdate(task._id, {
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      setIsEditing(false);
      showToast('Task updated successfully', 'success');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update task');
      showToast(error.response?.data?.message || 'Failed to update task', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(task._id);
      setShowDeleteModal(false);
      showToast('Task deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete task', 'error');
      setShowDeleteModal(false);
    }
  };

  const handleToggleComplete = async () => {
    try {
      await onToggleComplete(task._id, !task.completed);
      showToast(
        !task.completed ? 'Task marked as completed' : 'Task marked as incomplete',
        'success'
      );
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const createdAt = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (isEditing) {
    return (
      <div className="task-item editing">
        <div className="edit-form">
          <div className="form-group">
            <label htmlFor={`edit-title-${task._id}`}>Title</label>
            <input
              type="text"
              id={`edit-title-${task._id}`}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              maxLength={100}
              disabled={isUpdating}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor={`edit-desc-${task._id}`}>Description</label>
            <textarea
              id={`edit-desc-${task._id}`}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              maxLength={500}
              rows={3}
              disabled={isUpdating}
            />
          </div>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <div className="task-actions">
            <button onClick={handleSaveEdit} disabled={isUpdating} className="btn-primary btn-small">
              {isUpdating ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
            <button onClick={handleCancelEdit} disabled={isUpdating} className="btn-secondary btn-small">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = getStatus(task.completed);

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-header">
        <div className="task-checkbox">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleComplete}
            id={`task-${task._id}`}
            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          />
          <label htmlFor={`task-${task._id}`}></label>
        </div>

        <div className="task-content">
          <div className="task-title-row">
            <h3 className="task-title">{task.title}</h3>
            <span
              className={`status-badge ${task.completed ? 'status-completed' : 'status-open'}`}
            >
              {task.completed ? <HiOutlineCheckCircle /> : <HiOutlineClock />}
              {status}
            </span>
          </div>

          {task.description && <p className="task-description">{task.description}</p>}

          <div className="task-meta">
            <span className="meta-item" title="Created date">
              <HiCalendar className="meta-icon" aria-hidden="true" />
              {createdAt}
            </span>
            <span className="meta-item" title="Priority">
              <HiFlag className="meta-icon" aria-hidden="true" />
              Priority
            </span>
          </div>
        </div>

        <div className="task-actions">
          <button
            onClick={handleEdit}
            className="btn-icon"
            title="Edit task"
            aria-label={`Edit ${task.title}`}
          >
            <HiPencilAlt />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn-icon btn-icon-danger"
            title="Delete task"
            aria-label={`Delete ${task.title}`}
          >
            <HiOutlineTrash />
          </button>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default TaskItem;