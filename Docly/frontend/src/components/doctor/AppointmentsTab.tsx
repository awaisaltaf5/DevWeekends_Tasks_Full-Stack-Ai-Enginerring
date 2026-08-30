import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, FileText, Search, Video } from 'lucide-react';
import { type Appointment } from '../../types';
import {
  updateAppointmentStatus,
  updateAppointmentNotes,
} from '../../services/appointmentService';
import { apiErrorMessage } from '../../services/api';

export interface AppointmentFilter {
  status?: string;
  from?: string;
  to?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AppointmentsTabProps {
  appointments: Appointment[];
  pagination?: Pagination;
  loading: boolean;
  filter: AppointmentFilter;
  setFilter: (f: AppointmentFilter) => void;
  onFilterApply: (f: AppointmentFilter) => void;
  onUpdated: () => void;
  onPageChange: (page: number) => void;
}

const STATUS_OPTIONS = [
  'all',
  'pending',
  'confirmed',
  'scheduled',
  'completed',
  'cancelled',
  'no-show',
] as const;

function dateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Statuses a doctor may move a given status to (mirrors backend whitelist). */
const TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'scheduled', 'cancelled', 'no-show'],
  confirmed: ['scheduled', 'completed', 'cancelled', 'no-show'],
  scheduled: ['completed', 'cancelled', 'no-show', 'confirmed'],
  completed: [],
  cancelled: [],
  'no-show': [],
};

function formatAppointmentDate(value: string): string {
  const dateOnly = value.slice(0, 10);
  return new Date(`${dateOnly}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AppointmentsTab({
  appointments,
  pagination,
  loading,
  filter,
  onFilterApply,
  onUpdated,
  onPageChange,
}: AppointmentsTabProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const safePagination = pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 };

  const applyDatePreset = (preset: 'today' | 'upcoming' | 'all') => {
    const today = new Date();
    const todayValue = dateString(today);
    if (preset === 'today') {
      onFilterApply({ ...filter, from: todayValue, to: todayValue });
    } else if (preset === 'upcoming') {
      onFilterApply({ ...filter, from: todayValue, to: undefined });
    } else {
      onFilterApply({ ...filter, from: undefined, to: undefined });
    }
  };

  const handleStatusChange = async (a: Appointment, next: string) => {
    setBusyId(a.id);
    setActionError(null);
    try {
      await updateAppointmentStatus(a.id, next as Appointment['status']);
      onUpdated();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const openNotes = (a: Appointment) => {
    setEditingNotesId(a.id);
    setNotesDraft(a.notes ?? '');
    setActionError(null);
  };

  const saveNotes = async (a: Appointment) => {
    setBusyId(a.id);
    setActionError(null);
    try {
      await updateAppointmentNotes(a.id, notesDraft);
      setEditingNotesId(null);
      setNotesDraft('');
      onUpdated();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 flex items-center gap-2 text-sm font-semibold text-foreground"><CalendarDays className="h-4 w-4 text-primary" /> Date</span>
          {(['today', 'upcoming', 'all'] as const).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyDatePreset(preset)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium capitalize text-muted hover:border-primary hover:text-primary"
            >
              {preset}
            </button>
          ))}
          <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row">
            <input type="date" value={filter.from ?? ''} onChange={(event) => onFilterApply({ ...filter, from: event.target.value || undefined })} className="input py-2 text-sm" aria-label="Appointments from date" />
            <input type="date" value={filter.to ?? ''} onChange={(event) => onFilterApply({ ...filter, to: event.target.value || undefined })} className="input py-2 text-sm" aria-label="Appointments to date" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <span className="mr-2 flex items-center gap-2 text-sm font-semibold text-foreground"><Search className="h-4 w-4 text-primary" /> Status</span>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onFilterApply({ ...filter, status: s === 'all' ? undefined : s })}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              filter.status === (s === 'all' ? undefined : s)
                ? 'bg-primary text-white'
                : 'border border-border bg-card text-muted hover:text-foreground'
            }`}
          >
            {s}
          </button>
        ))}
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {loading && (
        <div className="space-y-3" role="status" aria-label="Loading appointments">
          {[1, 2, 3].map((item) => <div key={item} className="card h-32 animate-pulse bg-background-alt" />)}
        </div>
      )}
      {!loading && appointments.length === 0 && (
        <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
          <CalendarDays className="h-10 w-10 text-muted" />
          <h2 className="font-semibold text-foreground">No appointments found</h2>
          <p className="text-sm text-muted">Try a different date or status filter.</p>
        </div>
      )}
{!loading &&
        appointments.map((a) => {
          const nextStatuses = TRANSITIONS[a.status] ?? [];
          return (
            <div key={a.id} className="card card-hover p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    {a.patient?.name ?? 'Patient'} —{' '}
                    {formatAppointmentDate(a.date)}
                  </p>
                  <p className="text-sm text-muted">
                    {a.startTime} – {a.endTime} · {a.type} · Rs. {a.fee}
                  </p>
                  {a.patient?.email && <p className="text-sm text-muted">{a.patient.email}</p>}
                  {a.reason && <p className="mt-1 text-sm text-muted">Reason: {a.reason}</p>}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    to={`/appointments/${a.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
                  >
                    Details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <span
                    className={`shrink-0 self-start rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      a.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : a.status === 'cancelled' || a.status === 'no-show'
                        ? 'bg-red-100 text-red-700'
                        : a.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {a.status}
                  </span>
                  {a.type === 'video' &&
                    (a.status === 'confirmed' || a.status === 'scheduled' || a.status === 'pending') && (
                      <Link
                        to={`/video/${a.id}`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary/90"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join
                      </Link>
                    )}
                </div>
              </div>

              {/* Consultation notes editor */}
              <div className="mt-3">
                {editingNotesId === a.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      rows={3}
                      maxLength={2000}
                      className="input w-full text-sm"
                      placeholder="Add consultation notes…"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveNotes(a)}
                        disabled={busyId === a.id}
                        className="btn-primary px-3 py-1.5 text-xs"
                      >
                        {busyId === a.id ? 'Saving…' : 'Save notes'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotesId(null);
                          setNotesDraft('');
                        }}
                        className="btn-secondary px-3 py-1.5 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="max-w-md truncate text-sm text-muted">
                      {a.notes ? `Notes: ${a.notes}` : 'No notes yet.'}
                    </span>
                    <button onClick={() => openNotes(a)} className="btn-secondary px-3 py-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5" />
                      {a.notes ? 'Edit notes' : 'Add notes'}
                    </button>
                  </div>
                )}
              </div>

              {/* Status update */}
              {nextStatuses.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <span className="text-xs text-muted">Update status:</span>
                  {nextStatuses.map((ns) => (
                    <button
                      key={ns}
                      onClick={() => handleStatusChange(a, ns)}
                      disabled={busyId === a.id}
                      className="rounded-lg border border-border px-2.5 py-1 text-xs capitalize text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                    >
                      {busyId === a.id ? '…' : ns}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

      {safePagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button type="button" onClick={() => onPageChange(safePagination.page - 1)} disabled={safePagination.page <= 1 || loading} className="btn-secondary px-3 py-2 text-sm" aria-label="Previous appointments page">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted">
            Page {safePagination.page} of {safePagination.totalPages}
          </span>
          <button type="button" onClick={() => onPageChange(safePagination.page + 1)} disabled={safePagination.page >= safePagination.totalPages || loading} className="btn-secondary px-3 py-2 text-sm" aria-label="Next appointments page">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}