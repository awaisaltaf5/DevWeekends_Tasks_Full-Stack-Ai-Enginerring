import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '../features/auth/authSlice'
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Building2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name) e.name = 'Full name is required'
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email) e.email = 'Email address is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return !e.name && !e.email && !e.password && !e.confirmPassword
  }

  const handleChange = (field) => (ev) => {
    setForm((prev) => ({ ...prev, [field]: ev.target.value }))
    if (errors[field]) setErrors((e) => { const c = { ...e }; delete c[field]; return c })
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (loading || !validate()) return
    const result = await dispatch(register({ name: form.name, email: form.email, password: form.password }))
    if (register.fulfilled.match(result)) navigate('/', { replace: true })
  }

  const passwordStrength = () => {
    const pw = form.password
    if (!pw) return null
    if (pw.length >= 10 && /[A-Z]/.test(pw) && /\d/.test(pw)) return { label: 'Strong', color: 'text-green-600', bar: 'w-full bg-green-500' }
    if (pw.length >= 6) return { label: 'Moderate', color: 'text-amber-600', bar: 'w-2/3 bg-amber-400' }
    return { label: 'Weak', color: 'text-red-500', bar: 'w-1/3 bg-red-400' }
  }

  const strength = passwordStrength()

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl">
          {/* Header Strip */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-7 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Building2 size={20} />
              </span>
              <div>
                <h1 className="text-xl font-extrabold">Create your account</h1>
                <p className="text-xs text-blue-200">Join StayNest and start exploring premium stays</p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="reg-name" className="mb-1.5 block text-xs font-bold text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon size={16} className="pointer-events-none absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    className={`input h-11 pl-10 text-sm ${errors.name ? 'border-red-400' : ''}`}
                    value={form.name}
                    onChange={handleChange('name')}
                  />
                </div>
                {errors.name && <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="mb-1.5 block text-xs font-bold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`input h-11 pl-10 text-sm ${errors.email ? 'border-red-400' : ''}`}
                    value={form.email}
                    onChange={handleChange('email')}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="mb-1.5 block text-xs font-bold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    className={`input h-11 pl-10 pr-11 text-sm ${errors.password ? 'border-red-400' : ''}`}
                    value={form.password}
                    onChange={handleChange('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 rounded-lg p-1 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {strength && (
                  <div className="mt-1.5">
                    <div className="h-1 w-full rounded-full bg-slate-200">
                      <div className={`h-1 rounded-full transition-all duration-300 ${strength.bar}`} />
                    </div>
                    <p className={`mt-1 text-[11px] font-semibold ${strength.color}`}>{strength.label} password</p>
                  </div>
                )}
                {errors.password && <p className="mt-1 text-[11px] font-medium text-red-500">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="reg-confirm" className="mb-1.5 block text-xs font-bold text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-type your password"
                    className={`input h-11 pl-10 pr-11 text-sm ${errors.confirmPassword ? 'border-red-400' : form.confirmPassword && form.password === form.confirmPassword ? 'border-green-500' : ''}`}
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 rounded-lg p-1 text-slate-400 hover:text-slate-700"
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <CheckCircle2 size={16} className="absolute right-10 top-3 text-green-500" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-2 h-11 w-full gap-2 rounded-xl text-sm font-bold shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create My Account'
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-slate-400">
          By creating an account you agree to our Terms of Service
        </p>
      </div>
    </div>
  )
}
