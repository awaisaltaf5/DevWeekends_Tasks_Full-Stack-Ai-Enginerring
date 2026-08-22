import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { User, ShieldCheck, Settings, CheckCircle2 } from 'lucide-react'
import { clearError } from '../features/auth/authSlice'
import ProfileSection from '../components/account/ProfileSection'
import SecuritySection from '../components/account/SecuritySection'
import PreferencesSection from '../components/account/PreferencesSection'

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'preferences', label: 'Preferences', icon: Settings },
]

export default function AccountPage() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((s) => s.auth)
  const [section, setSection] = useState('profile')
  const [flash, setFlash] = useState('')

  const user = currentUser || {}

  const notify = (msg) => {
    setFlash(msg)
    window.setTimeout(() => setFlash(''), 4000)
    dispatch(clearError())
  }

  const avatarLetter = ((user.name || 'U').trim()[0] || 'U').toUpperCase()

  return (
    <section className="container-custom py-10">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Account</h1>
        <p className="text-sm text-muted">
          Manage your profile, security, and preferences.
        </p>
      </div>

      {flash && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 size={16} /> {flash}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-1">
            <div className="mb-2 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-accent/10 text-primary font-medium">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  section === s.id
                    ? 'bg-primary-bg text-primary'
                    : 'text-muted hover:bg-background-alt hover:text-foreground'
                }`}
              >
                <s.icon size={17} /> {s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Mobile section tabs */}
        <div className="lg:hidden">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  section === s.id
                    ? 'bg-primary-bg text-primary'
                    : 'text-muted hover:bg-background-alt'
                }`}
              >
                <s.icon size={16} /> {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div key={section} className="animate-fade-in min-w-0">
          {section === 'profile' && (
            <ProfileSection user={user} avatarLetter={avatarLetter} onSaved={notify} />
          )}
          {section === 'security' && <SecuritySection onSaved={notify} />}
          {section === 'preferences' && (
            <PreferencesSection user={user} onSaved={notify} />
          )}
        </div>
      </div>
    </section>
  )
}


