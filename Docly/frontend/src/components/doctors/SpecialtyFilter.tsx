import type { Specialty } from '../../types';

interface Props {
  specialties: Specialty[];
  loading: boolean;
  selected: string;
  onSelect: (slug: string) => void;
}

/** Horizontally-scrollable specialty filter pills. */
export default function SpecialtyFilter({
  specialties,
  loading,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 pb-1">
        <button
          type="button"
          onClick={() => onSelect('')}
          aria-pressed={selected === ''}
          className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            selected === ''
              ? 'border-primary bg-primary-bg text-primary'
              : 'border-border bg-card text-muted hover:border-primary hover:text-foreground'
          }`}
        >
          All specialties
        </button>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="h-4 w-4 animate-pulse rounded bg-background-alt" />
            Loading…
          </div>
        ) : (
          specialties.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.slug)}
              aria-pressed={selected === s.slug}
              className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                selected === s.slug
                  ? 'border-primary bg-primary-bg text-primary'
                  : 'border-border bg-card text-muted hover:border-primary hover:text-foreground'
              }`}
            >
              {s.name}
              {s.doctorCount !== undefined && s.doctorCount > 0 && (
                <span className="ml-1.5 text-xs opacity-60">({s.doctorCount})</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
