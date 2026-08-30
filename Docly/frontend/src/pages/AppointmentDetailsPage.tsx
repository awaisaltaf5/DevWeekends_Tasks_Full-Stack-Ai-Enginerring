import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  ShieldCheck,
  UserRound,
  Video,
  X,
} from 'lucide-react';
import { fetchAppointment, cancelMyAppointment } from '../services/appointmentService';
import { apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import type { Appointment } from '../types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  scheduled: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-slate-200 text-slate-700',
};

function formatDate(value: string): string {
  const dateOnly = value.slice(0, 10);
  return new Date(`${dateOnly}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function displayName(appointment: Appointment, role: string): string {
  if (role === 'doctor') return appointment.patient?.name ?? 'Patient';
  return appointment.doctor?.name ?? appointment.doctorProfile?.user?.name ?? 'Doctor';
}

function canCancel(appointment: Appointment, role: string): boolean {
  return role === 'patient' && ['pending', 'confirmed', 'scheduled'].includes(appointment.status);
}

export default function AppointmentDetailsPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!appointmentId || !user) return;
    setLoading(true);
    setError(null);
    fetchAppointment(appointmentId)
      .then(setAppointment)
      .catch((err) => {
        console.error('[Docly] Failed to load appointment details:', err);
        setError(apiErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [appointmentId, user, retryKey]);

  const handleCancel = async () => {
    if (!appointment) return;
    setCancelling(true);
    setActionError(null);
    try {
      const updated = await cancelMyAppointment(appointment.id);
      setAppointment(updated);
      setCancelOpen(false);
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <section className="container-docly py-12"><LoadingState label="Loading appointment details..." /></section>;
  }

  if (error) {
    return (
      <section className="container-docly py-12">
        <ErrorState message={error} onRetry={() => setRetryKey((key) => key + 1)} />
        <div className="mt-4 text-center"><button type="button" onClick={() => navigate(-1)} className="btn-secondary px-4 py-2 text-sm"><ArrowLeft className="h-4 w-4" /> Go back</button></div>
      </section>
    );
  }

  if (!appointment || !user) {
    return <section className="container-docly py-12"><EmptyState title="Appointment not found" description="This appointment may no longer exist or the link may be invalid." /></section>;
  }

  const isDoctor = user.role === 'doctor';
  const otherPerson = displayName(appointment, user.role);
  const image = isDoctor
    ? appointment.patient?.profileImage
    : appointment.doctor?.profileImage ?? appointment.doctorProfile?.user?.profileImage;
  const clinic = appointment.doctorProfile?.clinicName || appointment.doctorProfile?.clinicAddress;
  const videoAvailable = appointment.type === 'video' && ['pending', 'confirmed', 'scheduled'].includes(appointment.status);

  return (
    <section className="container-docly py-8 lg:py-12">
      <Link to={isDoctor ? '/doctor?tab=appointments' : '/appointments'} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to appointments
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-gradient-to-br from-primary-bg via-background to-background-alt p-6 sm:p-8">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary"><CalendarDays className="h-4 w-4" /> Appointment details</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Your consultation</h1>
          <p className="mt-2 text-sm text-muted">Reference: <span className="font-mono text-foreground">{appointment.id}</span></p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${STATUS_STYLES[appointment.status] ?? STATUS_STYLES.pending}`}>
          {appointment.status}
        </span>
      </div>

      {actionError && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-foreground">Appointment information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <DetailItem icon={CalendarDays} label="Date" value={formatDate(appointment.date)} />
              <DetailItem icon={Clock3} label="Time" value={`${appointment.startTime} - ${appointment.endTime}`} />
              <DetailItem icon={appointment.type === 'video' ? Video : Building2} label="Consultation type" value={appointment.type === 'video' ? 'Video consultation' : 'In-person consultation'} />
              <DetailItem icon={ShieldCheck} label="Consultation fee" value={`Rs. ${appointment.fee.toLocaleString()}`} />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3">
              {image ? <img src={image} alt={otherPerson} className="h-14 w-14 rounded-xl object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-bg text-primary"><UserRound className="h-6 w-6" /></div>}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{isDoctor ? 'Patient' : 'Doctor'}</p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">{otherPerson}</h2>
                {!isDoctor && appointment.specialty?.name && <p className="text-sm text-muted">{appointment.specialty.name}</p>}
                {isDoctor && appointment.patient?.email && <p className="text-sm text-muted">{appointment.patient.email}</p>}
              </div>
              {!isDoctor && <BadgeCheck className="ml-auto h-5 w-5 text-primary" aria-label="Verified appointment provider" />}
            </div>
            {!isDoctor && clinic && <p className="mt-5 flex items-start gap-2 text-sm text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{clinic}{appointment.doctorProfile?.clinicAddress && appointment.doctorProfile.clinicName ? `, ${appointment.doctorProfile.clinicAddress}` : ''}</p>}
          </div>

          {(appointment.reason || appointment.notes) && (
            <div className="card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground"><FileText className="h-5 w-5 text-primary" /> Consultation notes</h2>
              {appointment.reason && <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted">Reason for visit</p><p className="mt-1 leading-relaxed text-foreground">{appointment.reason}</p></div>}
              {appointment.notes && <div className="mt-4 border-t border-border pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted">Doctor notes</p><p className="mt-1 whitespace-pre-wrap leading-relaxed text-foreground">{appointment.notes}</p></div>}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card border-primary-light bg-gradient-to-br from-primary-bg via-card to-background p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Next step</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{videoAvailable ? 'Ready to join?' : appointment.status === 'completed' ? 'Consultation completed' : 'Appointment scheduled'}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{videoAvailable ? 'Join the private video room when your consultation is ready.' : appointment.status === 'completed' ? 'Your appointment record and available notes are shown here.' : 'Keep this reference available when contacting the clinic.'}</p>
            <div className="mt-5 space-y-2">
              {videoAvailable && <Link to={`/video/${appointment.id}`} className="btn-primary w-full px-4 py-3 text-sm"><Video className="h-4 w-4" /> Join consultation</Link>}
              {canCancel(appointment, user.role) && <button type="button" onClick={() => setCancelOpen(true)} className="btn-secondary w-full px-4 py-3 text-sm text-red-600 hover:border-red-300"><X className="h-4 w-4" /> Cancel appointment</button>}
              {isDoctor && <Link to="/doctor?tab=appointments" className="btn-secondary w-full px-4 py-3 text-sm">Manage in dashboard</Link>}
            </div>
            {appointment.status === 'cancelled' && <p className="mt-5 flex items-start gap-2 text-sm text-red-700"><X className="mt-0.5 h-4 w-4 shrink-0" />This appointment has been cancelled. The record remains in your history.</p>}
            {appointment.type === 'in-person' && clinic && <p className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-sm text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{appointment.doctorProfile?.clinicAddress || clinic}</p>}
          </div>
        </aside>
      </div>

      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="details-cancel-title">
          <div className="card w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wide text-red-600">Cancel appointment</p><h2 id="details-cancel-title" className="mt-1 text-xl font-semibold text-foreground">Confirm cancellation</h2></div><button type="button" onClick={() => setCancelOpen(false)} className="btn-secondary p-2" aria-label="Close cancellation dialog"><X className="h-4 w-4" /></button></div>
            <p className="mt-4 text-sm leading-relaxed text-muted">Are you sure you want to cancel this appointment? This action follows Docly's cancellation rules and keeps the appointment in your history.</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setCancelOpen(false)} className="btn-secondary px-4 py-2 text-sm">Keep appointment</button><button type="button" onClick={handleCancel} disabled={cancelling} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"><X className="h-4 w-4" />{cancelling ? 'Cancelling...' : 'Confirm cancellation'}</button></div>
          </div>
        </div>
      )}
    </section>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return <div className="flex items-start gap-3 rounded-xl bg-background-alt p-4"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p><p className="mt-1 text-sm font-medium text-foreground">{value}</p></div></div>;
}
