import { useState, useEffect } from 'react';
import type { IconType } from 'react-icons';
import type { ToastType } from '../types';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineX
} from 'react-icons/hi';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

const Toast = ({ message, type = 'info', onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons: Record<ToastType, IconType> = {
    success: HiOutlineCheckCircle,
    error: HiOutlineXCircle,
    warning: HiOutlineExclamationCircle,
    info: HiOutlineInformationCircle
  };

  const Icon = icons[type] || icons.info;

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-visible' : 'toast-hidden'}`} role="status">
      <Icon className="toast-icon" aria-hidden="true" />
      <span className="toast-message">{message}</span>
      <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="toast-close" aria-label="Close notification">
        <HiOutlineX />
      </button>
    </div>
  );
};

export default Toast;