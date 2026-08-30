import { type FormEvent, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, KeyRound, Lock, Mail } from 'lucide-react';
import { apiErrorMessage } from '../services/api';
import { resetPassword } from '../services/authService';
import logoMark from '../assets/logo-mark.svg';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email, recoveryCode, password);
      setSuccess(true);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative isolate flex min-h-[65vh] items-center overflow-hidden bg-slate-50 py-10 sm:py-14 lg:py-20">
      <div className="pointer-events-none absolute -right-24 top-8 -z-10 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="container-docly">
        <div className="card animate-fade-up mx-auto w-full max-w-lg p-6 sm:p-10">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
          <img src={logoMark} alt="Docly" className="mt-8 h-12 w-12" />
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-primary">Account recovery</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Reset your password</h1>
          <p className="mt-3 text-sm leading-6 text-muted">Use one unused recovery code from your Docly signup. Each code works once.</p>

          {error && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success ? (
            <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-semibold">Password reset successfully.</p>
              <p className="mt-1">You can now sign in with your new password.</p>
              <button type="button" onClick={() => navigate('/login')} className="btn-primary mt-4 px-4 py-2.5 text-sm">Go to sign in <ArrowRight className="h-4 w-4" /></button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <Field label="Account email" htmlFor="recovery-email" icon={Mail}>
                <input id="recovery-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="input pl-10" />
              </Field>
              <Field label="Recovery code" htmlFor="recovery-code" icon={KeyRound}>
                <input id="recovery-code" type="text" required value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value.toUpperCase())} placeholder="DOC-XXXXXX-XXXXXXXX" autoComplete="one-time-code" className="input pl-10 font-mono uppercase" />
              </Field>
              <Field label="New password" htmlFor="new-password" icon={Lock}>
                <input id="new-password" type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="input pl-10" />
              </Field>
              <Field label="Confirm new password" htmlFor="confirm-new-password" icon={Lock}>
                <input id="confirm-new-password" type="password" required minLength={6} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Re-enter your new password" className="input pl-10" />
              </Field>
              <button type="submit" disabled={submitting} className="btn-primary w-full px-4 py-3 text-sm">{submitting ? 'Resetting password...' : 'Reset password'} {!submitting && <ArrowRight className="h-4 w-4" />}</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, htmlFor, icon: Icon, children }: { label: string; htmlFor: string; icon: typeof Mail; children: ReactNode }) {
  return <div><label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">{label}</label><div className="relative"><Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />{children}</div></div>;
}
