import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Pagination as PaginationData } from '../../types';

interface Props {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

/** Simple numeric pager with prev/next buttons. */
export default function Pagination({ pagination, onPageChange }: Props) {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  // Show up to 5 page numbers centered on the current page.
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav
      className="mt-8 flex justify-center"
      aria-label="Pagination"
    >
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary p-2 text-sm disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`px-3 py-1.5 text-sm font-medium ${
              p === page
                ? 'rounded bg-primary text-white'
                : 'rounded text-foreground hover:bg-background-alt'
            }`}
            aria-label={`Page ${p}`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary p-2 text-sm disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
