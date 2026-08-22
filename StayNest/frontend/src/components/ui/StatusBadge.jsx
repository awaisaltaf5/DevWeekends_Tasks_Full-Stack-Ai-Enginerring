/**
 * Status badge for booking lifecycle states.
 * Uses Lucide icons + colour coding — no emojis.
 */
import { Clock, CheckCircle, XCircle, PackageCheck } from 'lucide-react'

const STATUS = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-800 ring-amber-200' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800 ring-red-200' },
  completed: { label: 'Completed', icon: PackageCheck, color: 'bg-blue-100 text-blue-800 ring-blue-200' },
}

export default function StatusBadge({ status = 'pending', children, className = '' }) {
  const s = STATUS[status] || STATUS.pending
  const Icon = s.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-offset-2 ${s.color} ${className}`}
    >
      <Icon size={12} />
      {children || s.label}
    </span>
  )
}
