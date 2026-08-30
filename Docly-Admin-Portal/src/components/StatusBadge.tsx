import React from 'react';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'badge-pending' },
  verified: { label: 'Approved', cls: 'badge-verified' },
  rejected: { label: 'Rejected', cls: 'badge-rejected' },
};

interface StatusBadgeProps {
  status: string;
}

/** Docly-style verification status badge with a circular dot. */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_STYLES[status] ?? { label: status, cls: 'badge-neutral' };
  return (
    <span className={`badge ${config.cls}`}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {config.label}
    </span>
  );
};

export default StatusBadge;