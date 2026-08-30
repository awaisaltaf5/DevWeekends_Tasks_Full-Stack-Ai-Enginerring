import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <section className="container-docly flex flex-col items-center justify-center py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-bg text-primary">
        <Compass className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-8 px-5 py-2.5 text-sm">
        Back to home
      </Link>
    </section>
  );
}