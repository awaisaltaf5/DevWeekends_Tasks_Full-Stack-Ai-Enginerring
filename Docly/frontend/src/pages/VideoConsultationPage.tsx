import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchVideoMeeting } from '../services/videoService';
import { apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingState, ErrorState } from '../components/ui/States';
import { Video, ShieldCheck } from 'lucide-react';
import type { VideoMeeting } from '../types';

/**
 * Join a video consultation (Jitsi) for an appointment.
 * Access is enforced server-side (patient + doctor only) and mirrored here.
 */
export default function VideoConsultationPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<VideoMeeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const load = useCallback(async () => {
    if (!appointmentId) return;
    setLoading(true);
    setError(null);
    try {
      const m = await fetchVideoMeeting(appointmentId);
      setMeeting(m);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    load();
  }, [user, navigate, appointmentId, load, retryKey]);

  if (loading) {
    return (
      <section className="container-docly py-8">
        <LoadingState label="Preparing your video consultation…" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="container-docly py-8">
        <ErrorState message={error} onRetry={() => setRetryKey((k) => k + 1)} />
        <div className="mt-4 text-center">
          <button onClick={() => navigate('/appointments')} className="btn-secondary px-4 py-2 text-sm">
            Back to appointments
          </button>
        </div>
      </section>
    );
  }

  if (!meeting) {
    return <LoadingState label="Loading meeting…" />;
  }

  // Build the Jitsi iframe URL (token-based auth when configured).
  const tokenParam = meeting.token ? `?jwt=${encodeURIComponent(meeting.token)}` : '';
  const iframeSrc = meeting.url
    ? `${meeting.url}${tokenParam ? `${meeting.url.includes('?') ? '&' : '?'}${tokenParam.slice(1)}` : ''}`
    : '';

  return (
    <section className="container-docly py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Video Consultation</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <Video className="h-4 w-4 text-primary" />
            Room: {meeting.room} · Joining as {meeting.displayName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Private consultation
          </span>
          <button onClick={() => navigate('/appointments')} className="btn-secondary px-3 py-1.5 text-sm">
            Exit
          </button>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {/* Jitsi embedded meeting room */}
        <iframe
          src={iframeSrc}
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write; speaker"
          title="Jitsi video consultation"
          className="h-[70vh] w-full border-0"
        />
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm text-muted">
        <span className="inline-flex items-center gap-1 font-medium text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Secure meeting
        </span>
        <p className="mt-1">
          Only you and the attending doctor can join this consultation. Do not share the room name with others.
          If your doctor hasn't joined yet, please wait a moment.
        </p>
      </div>
    </section>
  );
}