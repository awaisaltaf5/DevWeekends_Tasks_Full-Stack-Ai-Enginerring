import { Link } from 'react-router-dom'
import { Home, Search, HelpCircle } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <section className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-bg text-primary shadow-inner">
        <HelpCircle size={44} />
      </div>

      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        404 - Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-base text-muted">
        The page you are looking for doesn't exist or has been moved. Let's get you back to discovering great stays.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button className="gap-2">
            <Home size={18} />
            Back to Home
          </Button>
        </Link>
        <Link to="/hotels">
          <Button variant="secondary" className="gap-2">
            <Search size={18} />
            Browse Hotels
          </Button>
        </Link>
      </div>
    </section>
  )
}
