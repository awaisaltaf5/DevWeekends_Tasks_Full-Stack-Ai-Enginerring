import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../features/auth/authSlice'
import { Mail, Lock, Eye, EyeOff, Loader2, Building2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email address is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return !e.email && !e.password
  }

  const handleChange = (field) => (ev) => {
    setForm((prev) => ({ ...prev, [field]: ev.target.value }))
    if (errors[field]) setErrors((e) => { const c = { ...e }; delete c[field]; return c })
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (loading || !validate()) return
    const result = await dispatch(login(form))
    if (login.fulfilled.match(result)) navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl">
          {/* Header Strip */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-7 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Building2 size={20} />
              </span>
              <div>
                <h1 className="text-xl font-extrabold">Welcome back</h1>
                <p className="text-xs text-blue-200">Sign in to your StayNest account</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-7">
            {error && (
              <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`input h-11 pl-10 text-sm ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                    value={form.email}
                    onChange={handleChange('email')}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`input h-11 pl-10 pr-11 text-sm ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                    value={form.password}
                    onChange={handleChange('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary h-11 w-full gap-2 rounded-xl text-sm font-bold shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In to StayNest'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted">
              Don&rsquo;t have an account?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline">
                Create account — it&rsquo;s free
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-slate-400">
          Secure login · 256-bit encrypted · No spam
        </p>
      </div>
    </div>
  )
}
