import React from "react";

/**
 * Reusable button with loading state and disabled handling.
 * - Prevents duplicate submissions (while loading).
 * - Respects reduced motion via global CSS.
 */
const Button = ({
  children,
  loading = false,
  disabled = false,
  variant = "primary",
  type = "button",
  className = "",
  onClick,
  ariaLabel,
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 h-[46px] rounded-xl font-semibold text-sm transition-colors duration-150 ease-out disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";
  const variants = {
    primary:
      "bg-brand text-white hover:bg-brand-dark focus:outline-none",
    secondary:
      "bg-brand-soft text-brand-dark hover:bg-indigo-100",
    outline:
      "border border-line bg-white text-ink hover:border-brand hover:text-brand-dark",
    ghost: "text-ink-soft hover:text-brand-dark hover:bg-surface-muted",
    danger:
      "bg-errorred text-white hover:bg-red-700",
  };
  const variantClass = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`${base} ${variantClass} ${className}`}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
