import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Activity, ShieldCheck, Stethoscope, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminAPI } from '../services/adminAPI';
import BrandLogo from '../components/BrandLogo';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await adminAPI.adminLogin(username, password);
      login(response.token, response.user);
      toast('success', `Welcome back, ${response.user.name}`);
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      setError(message);
      toast('error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-alt px-4 py-10">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl lg:grid lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-slate-800 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative z-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-6 text-3xl font-bold leading-tight">
              Healthcare admin control center
            </h1>
            <p className="mt-3 max-w-sm text-sm text-blue-100">
              Verify clinicians, review doctor profiles and monitor platform performance in one place.
            </p>
          </div>

          <div className="relative z-10 space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-blue-50">
              <Activity className="h-5 w-5 text-cyan-200" />
              Monitor verification pipelines and clinician onboarding.
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-blue-50">
              <Stethoscope className="h-5 w-5 text-cyan-200" />
              Review doctors, patients and appointment throughput.
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col items-center justify-center gap-3">
              <BrandLogo className="h-10" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Admin Portal · Secure access</p>
            </div>

            <h2 className="text-center text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-1 text-center text-sm text-muted">Sign in to manage the healthcare platform.</p>

            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="username" className="field-label">
                  Admin username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="username"
                  className="input"
                  placeholder="Enter your admin username"
                />
              </div>

              <div>
                <label htmlFor="password" className="field-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="current-password"
                  className="input"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !username || !password}
                className="btn-primary w-full py-3 text-sm"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted">
              Restricted to authorized administrators only. No public signup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;