import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Copy, Download, Eye, EyeOff, Lock, Mail, ShieldCheck, Stethoscope, UserRound, UserRoundPlus } from 'lucide-react';
import type { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../services/api';
import { hasGoogleClientId, initializeGoogle, promptGoogle, googlePromptFailureMessage } from '../services/googleIdentityService';

const roles: { value: 'patient' | 'doctor'; label: string; description: string; icon: typeof UserRound }[] = [
  { value: 'patient', label: 'I am a patient', description: 'Find care that fits your life', icon: UserRound },
  { value: 'doctor', label: 'I am a doctor', description: 'Build your trusted practice', icon: Stethoscope },
];

function createRecoveryCodes(): string[] {
  const bytes = new Uint8Array(27);
  crypto.getRandomValues(bytes);
  return Array.from({ length: 3 }, (_, index) => {
    const hex = Array.from(bytes.slice(index * 9, index * 9 + 9), (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
    return `DOC-${hex.slice(0, 6)}-${hex.slice(6)}`;
  });
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.26Z" />
      <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5Z" />
      <path fill="#FBBC05" d="M6.54 13.58A5.85 5.85 0 0 1 6.23 12c0-.55.11-1.08.31-1.58V7.89H3.3A9.76 9.76 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.11l3.24-2.53Z" />
      <path fill="#EA4335" d="M12 6.39c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.48 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 8.11 9.46 6.39 12 6.39Z" />
    </svg>
  );
}

export default function RegisterPage() {
  const { register, googleAuthenticate } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [recoveryCodes] = useState(createRecoveryCodes);
  const [codesAcknowledged, setCodesAcknowledged] = useState(false);
  const [codesDownloaded, setCodesDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const destination = searchParams.get('redirect') ?? (role === 'doctor' ? '/doctor' : '/');
  const roleRef = useRef(role);
  const destinationRef = useRef(destination);
  roleRef.current = role;
  destinationRef.current = destination;

  const handleGoogleCredential = async (credential: string) => {
    setError(null);
    setFieldError(null);
    setSubmitting(true);
    try {
      await googleAuthenticate(credential, roleRef.current);
      navigate(destinationRef.current);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!hasGoogleClientId()) return;
    void initializeGoogle((credential) => void handleGoogleCredential(credential))
      .then((ready) => {
        setGoogleReady(ready);
        if (!ready) {
          setError('Google sign-in is unavailable in this browser.');
        }
      })
      .catch(() => setError('Unable to load Google sign-in.'));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    if (password.length < 6) {
      setFieldError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFieldError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password, role, recoveryCodes);
      navigate(destination);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const recoveryText = recoveryCodes.join('\n');
  const downloadRecoveryCodes = () => {
    const blob = new Blob([`Docly Recovery Codes\n\nKeep these codes private. Each code can be used once.\n\n${recoveryText}\n`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'docly-recovery-codes.txt';
    anchor.click();
    URL.revokeObjectURL(url);
    setCodesDownloaded(true);
  };

  const copyRecoveryCodes = async () => {
    await navigator.clipboard.writeText(recoveryText);
    setCopied(true);
  };

  return (
    <section className="relative isolate overflow-hidden bg-slate-50 py-10 sm:py-14 lg:py-20">
      <div className="pointer-events-none absolute -left-24 top-12 -z-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" />
      <div className="container-docly">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-blue-950/5 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="hidden bg-primary p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><ShieldCheck className="h-6 w-6" /></div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">Your care, connected</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">A better way to stay close to your care.</h2>
              <p className="mt-5 max-w-xs text-sm leading-6 text-blue-100">Book trusted doctors, manage appointments, and keep your health journey in one secure place.</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100"><Check className="h-4 w-4" /> Trusted by patients and care teams</div>
          </aside>
          <div className="p-6 sm:p-10">
            <div className="animate-fade-up">
              <p className="text-sm font-semibold text-primary">Welcome to Docly</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Create your account</h1>
              <p className="mt-2 text-sm leading-6 text-muted">Start your more connected healthcare experience today.</p>
            </div>

        {(error || fieldError) && (
          <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {fieldError ?? error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-foreground">Choose your account type</legend>
            <div className="grid gap-3 sm:grid-cols-2">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                aria-pressed={role === r.value}
                className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                  role === r.value
                    ? 'border-primary bg-primary-bg text-primary shadow-sm shadow-blue-100'
                    : 'border-border bg-card text-muted hover:-translate-y-0.5 hover:border-primary-light hover:text-foreground'
                }`}
              >
                <r.icon className="mt-0.5 h-5 w-5 shrink-0" />
                <span><span className="block text-sm font-semibold">{r.label}</span><span className="mt-1 block text-xs text-muted">{r.description}</span></span>
                {role === r.value && <Check className="absolute right-3 top-3 h-4 w-4" />}
              </button>
            ))}
            </div>
          </fieldset>

          <section className="rounded-xl border border-primary-light bg-primary-bg p-4" aria-labelledby="recovery-codes-title">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 id="recovery-codes-title" className="text-sm font-semibold text-foreground">Save your recovery codes</h2>
                <p className="mt-1 text-xs leading-5 text-muted">These one-time codes are required if you forget your password. They cannot be shown again after signup.</p>
              </div>
            </div>
            <p className="mt-3 text-xs font-medium text-primary">Your personal recovery codes are ready to save.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={downloadRecoveryCodes} className="btn-primary flex-1 px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" /> {codesDownloaded ? 'Downloaded' : 'Download Recovery Codes'}</button>
              <button type="button" onClick={copyRecoveryCodes} className="btn-secondary flex-1 px-3 py-2 text-xs"><Copy className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy Recovery Codes'}</button>
            </div>
            <label className="mt-3 flex items-start gap-2 text-xs text-foreground">
              <input type="checkbox" checked={codesAcknowledged} onChange={(event) => setCodesAcknowledged(event.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span>I have downloaded or securely saved these codes.</span>
            </label>
          </section>

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
              Full name
            </label>
            <div className="relative">
              <UserRoundPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'doctor' ? 'Dr. Jane Doe' : 'Jane Doe'}
                aria-describedby="name-hint"
                className="input pl-10 transition-all duration-200"
              />
            </div>
            <p id="name-hint" className="mt-1.5 text-xs text-muted">Use the name you would like shown on your profile.</p>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                aria-describedby="password-hint"
                className="input pl-10 pr-11"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <p id="password-hint" className={`mt-1.5 text-xs ${password.length > 0 && password.length < 6 ? 'text-red-600' : 'text-muted'}`}>{password.length > 0 ? `${password.length}/6 characters minimum` : 'At least 6 characters'}</p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-foreground">Confirm password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter your password" className="input pl-10 pr-11" />
              <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            {confirmPassword && <p className={`mt-1.5 text-xs ${password === confirmPassword ? 'text-emerald-600' : 'text-red-600'}`}>{password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}</p>}
          </div>

          <button type="submit" disabled={submitting || !codesDownloaded || !codesAcknowledged} className="btn-primary w-full px-4 py-3 text-sm shadow-lg shadow-blue-200/60">
            {submitting ? 'Creating account...' : 'Create account'}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="my-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-muted"><span className="h-px flex-1 bg-border" />or continue with<span className="h-px flex-1 bg-border" /></div>
        <button type="button" disabled={!hasGoogleClientId() || !googleReady || submitting} onClick={() => promptGoogle((reason) => setError(googlePromptFailureMessage(reason)))} className="btn-secondary w-full px-4 py-3 text-sm">
          <GoogleIcon />
          {!hasGoogleClientId() ? 'Google sign-in unavailable' : googleReady ? 'Continue with Google' : 'Loading Google sign-in...'}
        </button>
        {!hasGoogleClientId() && <p className="mt-2 text-center text-xs text-muted">Google sign-in will appear once it is configured.</p>}

        <p className="mt-7 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
          </div>
        </div>
      </div>
    </section>
  );
}