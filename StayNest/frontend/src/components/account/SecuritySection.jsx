import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { KeyRound, Loader2 } from 'lucide-react'
import { changePassword } from '../../features/auth/authSlice'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function SecuritySection({ onSaved }) {
  const dispatch = useDispatch()
  const loading = useSelector((s) => s.auth.loading)
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.currentPassword) errs.currentPassword = 'Enter your current password'
    if (!form.newPassword || form.newPassword.length < 6)
      errs.newPassword = 'New password must be at least 6 characters'
    if (form.confirmPassword !== form.newPassword)
      errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    if (Object.keys(errs).length) return

    const res = await dispatch(
      changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
    )
    if (changePassword.fulfilled.match(res)) {
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      onSaved('Password changed successfully.')
    }
  }

  const inputClass = (hasError) =>
    `input pl-10 ${hasError ? 'border-red-400' : ''}`

  return (
    <Card title="Security">
      <p className="mb-6 text-sm text-muted">
        Update your password. We recommend using a strong, unique password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Current password</label>
          <div className="relative mt-1">
            <KeyRound size={18} className="pointer-events-none absolute left-3 top-2.5 text-muted" />
            <input
              type="password"
              className={inputClass(errors.currentPassword)}
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.currentPassword}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">New password</label>
          <div className="relative mt-1">
            <KeyRound size={18} className="pointer-events-none absolute left-3 top-2.5 text-muted" />
            <input
              type="password"
              className={inputClass(errors.newPassword)}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Confirm new password</label>
          <div className="relative mt-1">
            <KeyRound size={18} className="pointer-events-none absolute left-3 top-2.5 text-muted" />
            <input
              type="password"
              className={inputClass(errors.confirmPassword)}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 size={16} className="mr-1 animate-spin" /> : null}
            {loading ? 'Updating…' : 'Update password'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
