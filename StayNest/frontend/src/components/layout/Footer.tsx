import { Link } from 'react-router-dom'
import { Building2, Mail, Phone, MapPin, Shield, Star, BadgeCheck } from 'lucide-react'

const NAV_COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'Browse Hotels', to: '/hotels' },
      { label: 'Islamabad Stays', to: '/hotels?city=islamabad' },
      { label: 'Lahore Stays', to: '/hotels?city=lahore' },
      { label: 'Murree Retreats', to: '/hotels?city=murree' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My Bookings', to: '/bookings' },
      { label: 'Saved Hotels', to: '/saved' },
      { label: 'Account Settings', to: '/account' },
      { label: 'Sign In', to: '/login' },
    ],
  },
]

const TRUST_BADGES = [
  { icon: Shield, label: 'Secure Payments' },
  { icon: Star, label: 'Verified Reviews' },
  { icon: BadgeCheck, label: 'Genuine Listings' },
]

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="container-custom pt-12 pb-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md">
                <Building2 size={18} />
              </span>
              Stay<span className="text-blue-400">Nest</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Hand-picked hotels and verified stays across Pakistan and beyond.
              Premium hospitality at honest prices.
            </p>

            {/* Trust Badges */}
            <div className="mt-5 flex flex-wrap gap-2">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300"
                >
                  <Icon size={12} className="text-blue-400" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {NAV_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Get in Touch</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="shrink-0 text-blue-400" />
                <span>support@staynest.example</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="shrink-0 text-blue-400" />
                <span>+92 300 000 0000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin size={14} className="shrink-0 text-blue-400" />
                <span>Islamabad, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} StayNest. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
