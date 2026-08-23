import { useEffect } from 'react';
import { HiOutlineX, HiOutlineExclamationCircle } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h3 id="modal-title">
            {isDanger && <HiOutlineExclamationCircle className="modal-title-icon" aria-hidden="true" />}
            {title}
          </h3>
          <button onClick={onClose} className="modal-close" aria-label="Close modal">
            <HiOutlineX />
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={isDanger ? 'btn-danger' : 'btn-primary'}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;