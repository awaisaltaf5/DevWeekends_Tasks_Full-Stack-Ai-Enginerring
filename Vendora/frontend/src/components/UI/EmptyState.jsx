import React from "react";

/**
 * Consistent empty state for lists (cart, wishlist, orders, search results, etc.)
 */
const EmptyState = ({
  icon,
  title = "Nothing here yet",
  message = "Your list is currently empty.",
  actionText,
  onAction,
  actionHref,
}) => {
  const Action = actionHref ? (
    <a
      href={actionHref}
      className="mt-4 inline-flex items-center justify-center px-5 h-[44px] rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
    >
      {actionText}
    </a>
  ) : onAction ? (
    <button
      onClick={onAction}
      className="mt-4 inline-flex items-center justify-center px-5 h-[44px] rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer"
    >
      {actionText}
    </button>
  ) : null;

  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {icon ? (
        <div className="w-16 h-16 rounded-full bg-brand-soft flex items-center justify-center text-brand mb-4">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-soft">{message}</p>
      {Action}
    </div>
  );
};

export default EmptyState;
