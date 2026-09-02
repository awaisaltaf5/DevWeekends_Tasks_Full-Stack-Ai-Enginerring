import React from "react";
import { RxCross1 } from "react-icons/rx";

/**
 * Reusable confirmation dialog for destructive actions.
 * Usage:
 *   <ConfirmDialog open={bool} title="..." message="..." confirmText="Delete" onConfirm={fn} onCancel={fn} />
 */
const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-screen bg-[#0000005c] z-[99999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[420px] bg-white rounded-lg shadow-xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onCancel}
          aria-label="Close dialog"
        >
          <RxCross1 size={20} />
        </button>
        <h3
          id="confirm-dialog-title"
          className="text-[18px] font-[600] text-gray-900 pr-6"
        >
          {title}
        </h3>
        <p className="text-[14px] text-gray-600 mt-2 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 text-[14px] font-[500] rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`px-4 py-2 text-[14px] font-[500] rounded-md text-white transition-colors ${
              destructive
                ? "bg-[#e5435c] hover:bg-[#d13a52]"
                : "bg-[#2563eb] hover:bg-[#1d4ed8]"
            }`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
