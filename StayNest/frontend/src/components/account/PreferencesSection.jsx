import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, Loader2 } from 'lucide-react'
import { updateProfile } from '../../features/auth/authSlice'
import {
  currencyOptions,
  getCurrency,
  setCurrency,
} from '../../services/location'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function PreferencesSection({ user, onSaved }) {
  const dispatch = useDispatch()
  const loading = useSelector((s) => s.auth.loading)
  const [currency, setCurrencyState] = useState(
    user.preferences?.currency || getCurrency()
  )
  const [emailNotifications, setEmailNotifications] = useState(
    user.preferences?.emailNotifications ?? true
  )

  const handleCurrency = (code) => {
    setCurrencyState(code)
    setCurrency(code) // persist app-wide display immediately
  }

  const handleSavePreferences = async () => {
    const res = await dispatch(
      updateProfile({
        preferences: { currency, emailNotifications },
      })
    )
    if (updateProfile.fulfilled.match(res))
      onSaved('Preferences saved successfully.')
  }

  return (
    <Card title="Preferences">
      <p className="mb-6 text-sm text-muted">
        Customize how StayNest looks and behaves for you.
      </p>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground">Currency</label>
          <select
            className="input mt-1"
            value={currency}
            onChange={(e) => handleCurrency(e.target.value)}
          >
            {currencyOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol}) — {c.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">
            Prices across the app will be shown in this currency.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background-alt p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-primary">
              <Bell size={18} />
            </span>
            <div>
              <p className="font-medium text-foreground">Email notifications</p>
              <p className="text-sm text-muted">
                Receive booking updates and offers by email.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={emailNotifications}
            onClick={() => setEmailNotifications((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              emailNotifications ? 'bg-primary' : 'bg-background-alt'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                emailNotifications ? 'left-[calc(100%-1.25rem)]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSavePreferences} disabled={loading}>
            {loading ? <Loader2 size={16} className="mr-1 animate-spin" /> : null}
            {loading ? 'Saving…' : 'Save preferences'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
