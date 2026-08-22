import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { User, Mail, Image as ImageIcon, Loader2 } from 'lucide-react'
import { updateProfile } from '../../features/auth/authSlice'
import { useSelector } from 'react-redux'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function ProfileSection({ user, avatarLetter, onSaved }) {
  const dispatch = useDispatch()
  const loading = useSelector((s) => s.auth.loading)
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    avatar: user.avatar || '',
  })
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email'
    setErrors(errs)
    if (Object.keys(errs).length) return

    const res = await dispatch(
      updateProfile({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        avatar: form.avatar.trim(),
      })
    )
    if (updateProfile.fulfilled.match(res)) onSaved('Profile updated successfully.')
  }

  const inputClass = (hasError) =>
    `input pl-10 ${hasError ? 'border-red-400' : ''}`

  return (
    <Card title="Profile">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-accent/10 text-xl font-semibold text-primary">
          {form.avatar ? (
            <img
              src={form.avatar}
              alt="Avatar preview"
              className="h-full w-full object-cover"
            />
          ) : (
            avatarLetter
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground">{user.name}</p>
          <p className="text-sm text-muted">Your public profile information.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Name</label>
          <div className="relative mt-1">
            <User size={18} className="pointer-events-none absolute left-3 top-2.5 text-muted" />
            <input
              type="text"
              className={inputClass(errors.name)}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Email</label>
          <div className="relative mt-1">
            <Mail size={18} className="pointer-events-none absolute left-3 top-2.5 text-muted" />
            <input
              type="email"
              className={inputClass(errors.email)}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Avatar URL</label>
          <div className="relative mt-1">
            <ImageIcon size={18} className="pointer-events-none absolute left-3 top-2.5 text-muted" />
            <input
              type="text"
              placeholder="https://…"
              className="input pl-10"
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            />
          </div>
          <p className="mt-1 text-xs text-muted">
            Paste an image URL to use as your profile picture.
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 size={16} className="mr-1 animate-spin" /> : null}
            {loading ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
