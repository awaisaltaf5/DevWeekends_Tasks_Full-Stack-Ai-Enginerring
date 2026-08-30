import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchMyAppointments, cancelMyAppointment } from '../services/appointmentService';
import { apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import type { Appointment } from '../types';
import { Calendar, Clock, Video, Building2, CalendarCheck, MapPin, X, ArrowRight } from 'lucide-react';

export const APPT_VIEWS = ['all', 'upcoming', 'completed', 'cancelled'] as const;
export type ApptView = (typeof APPT_VIEWS)[number];

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 8;

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  scheduled: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-gray-200 text-gray-600',
};

function doctorDisplayName(a: Appointment): string {
  return a.doctor?.name ?? a.doctorProfile?.user?.name ?? 'Doctor';
}

function doctorClinic(a: Appointment): string {
  return a.doctorProfile?.clinicName ?? 'Clinic';
}

function formatAppointmentDate(value: string): string {
  const dateOnly = value.slice(0, 10);
  return new Date(`${dateOnly}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Patient "My Appointments" page with Upcoming / Completed / Cancelled tabs,
 * pagination, and a cancellation action with sensible rules.
 */
export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<ApptView>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [pendingCancellation, setPendingCancellation] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'doctor') {
      navigate('/doctor');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const load = useCallback(
    async (targetView: ApptView, targetPage: number) => {
      setLoading(true);
      setError(null);
      setActionError(null);
      try {
        const result = await fetchMyAppointments({
          view: targetView === 'all' ? undefined : targetView,
          page: targetPage,
          limit: PAGE_SIZE,
        });
        setAppointments(result.appointments);
        setPagination(result.pagination);
      } catch (err) {
        setError(apiErrorMessage(err));
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!user || user.role !== 'patient') return;
    load(view, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, page, user]);

  const changeView = (v: ApptView) => {
    setView(v);
    setPage(1);
  };

  const handleCancel = async (a: Appointment) => {
    setCancellingId(a.id);
    setActionError(null);
    try {
      await cancelMyAppointment(a.id);
      await load(view, page);
      setPendingCancellation(null);
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  if (!user || user.role !== 'patient') {
    return null;
  }

  return (
    <section className="container-docly py-8 lg:py-12">
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-primary-bg via-background to-background-alt p-6 sm:p-8">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary"><CalendarCheck className="h-4 w-4" /> Your care timeline</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">My appointments</h1>
        <p className="text-sm text-muted">
          Keep track of consultations, join online visits, and manage your schedule in one place.
        </p>
      </div>

      {/* View tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {APPT_VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => changeView(v)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              view === v
                ? 'bg-primary text-white'
                : 'border border-border bg-card text-muted hover:text-foreground'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {loading && <LoadingState label="Loading your appointments…" />}
      {!loading && error && <ErrorState message={error} onRetry={() => load(view, page)} />}

      {!loading && !error && appointments.length === 0 && (
        <EmptyState
          title={
            view === 'completed'
              ? 'No completed appointments yet'
              : view === 'cancelled'
              ? 'No cancelled appointments'
              : 'No upcoming appointments'
          }
          description="Your list will appear here."
        >
          {(view === 'upcoming' || view === 'all') && (
            <Link to="/doctors" className="btn-primary px-5 py-2 text-sm">
              Find a doctor
            </Link>
          )}
        </EmptyState>
      )}

      {!loading && !error && appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map((a) => {
            const canCancel =
              a.status === 'pending' || a.status === 'confirmed' || a.status === 'scheduled';
            return (
              <div
                key={a.id}
                className="card card-hover flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                    {a.type === 'video' ? <Video className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{doctorDisplayName(a)}</p>
                    <p className="text-sm text-primary">{a.specialty?.name ?? 'Healthcare specialist'}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted"><MapPin className="h-3.5 w-3.5" /> {doctorClinic(a)}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatAppointmentDate(a.date)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {a.startTime} – {a.endTime}
                      </span>
                      <span className="capitalize">{a.type === 'video' ? 'Video' : 'In-person'}</span>
                    </div>
                    {a.reason && (
                      <p className="mt-1 max-w-md truncate text-sm text-muted">“{a.reason}”</p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      STATUS_STYLES[a.status] ?? 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {a.status}
                  </span>
                  <span className="text-sm font-semibold text-foreground">Rs. {a.fee}</span>
                  <Link
                    to={`/appointments/${a.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
                  >
                    View details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {a.type === 'video' &&
                    (a.status === 'confirmed' || a.status === 'scheduled' || a.status === 'pending') && (
                      <Link
                        to={`/video/${a.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join
                      </Link>
                    )}
                  {canCancel && (
                    <button
                      onClick={() => setPendingCancellation(a)}
                      disabled={cancellingId === a.id}
                      className="btn-secondary px-3 py-1.5 text-xs text-red-600 hover:border-red-300 hover:text-red-700"
                    >
                      {cancellingId === a.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary text-sm"
              >
                Prev
              </button>
              <span className="text-sm text-muted">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="btn-secondary text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {pendingCancellation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
          <div className="card w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Cancel appointment</p>
                <h2 id="cancel-title" className="mt-1 text-xl font-semibold text-foreground">Are you sure?</h2>
              </div>
              <button type="button" onClick={() => setPendingCancellation(null)} className="btn-secondary p-2" aria-label="Close cancellation dialog"><X className="h-4 w-4" /></button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              This will cancel your {pendingCancellation.startTime} appointment with {doctorDisplayName(pendingCancellation)}. The appointment record will remain available in your history.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setPendingCancellation(null)} className="btn-secondary px-4 py-2 text-sm">Keep appointment</button>
              <button type="button" onClick={() => handleCancel(pendingCancellation)} disabled={cancellingId === pendingCancellation.id} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                <X className="h-4 w-4" /> {cancellingId === pendingCancellation.id ? 'Cancelling...' : 'Confirm cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}