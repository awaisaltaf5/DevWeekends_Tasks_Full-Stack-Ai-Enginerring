import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../services/api';
import { hasGoogleClientId, initializeGoogle, promptGoogle, googlePromptFailureMessage } from '../services/googleIdentityService';
import logoMark from '../assets/logo-mark.svg';

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

export default function LoginPage() {
  const { login, googleAuthenticate, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleGoogleCredential = async (credential: string) => {
    setLocalError(null);
    setSubmitting(true);
    try {
      await googleAuthenticate(credential, 'patient');
      navigate(searchParams.get('redirect') ?? '/');
    } catch (err) {
      setLocalError(apiErrorMessage(err));
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
          setLocalError('Google sign-in is unavailable in this browser.');
        }
      })
      .catch(() => setLocalError('Unable to load Google sign-in.'));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      const redirect = searchParams.get('redirect');
      navigate(redirect ?? '/');
    } catch (err) {
      setLocalError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-docly flex justify-center py-14 lg:py-20">
      <div className="card w-full max-w-md p-8">
        <img src={logoMark} alt="Docly" className="mb-6 h-12 w-12" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">Sign in to access your Docly account.</p>

        {(localError || error) && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {localError ?? error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input pl-10"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full px-4 py-2.5 text-sm">
            {submitting ? 'Signing in…' : 'Sign in'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-3 text-right">
          <Link to="/forgot-password" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            <KeyRound className="h-3.5 w-3.5" /> Forgot password?
          </Link>
        </div>

        <div className="my-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-muted"><span className="h-px flex-1 bg-border" />or continue with<span className="h-px flex-1 bg-border" /></div>
        <button type="button" disabled={!hasGoogleClientId() || !googleReady || submitting} onClick={() => promptGoogle((reason) => setLocalError(googlePromptFailureMessage(reason)))} className="btn-secondary w-full px-4 py-3 text-sm">
          <GoogleIcon />
          {!hasGoogleClientId() ? 'Google sign-in unavailable' : googleReady ? 'Continue with Google' : 'Loading Google sign-in...'}
        </button>
        {!hasGoogleClientId() && <p className="mt-2 text-center text-xs text-muted">Google sign-in will appear once it is configured.</p>}

        <p className="mt-6 text-center text-sm text-muted">
          New to Docly?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}