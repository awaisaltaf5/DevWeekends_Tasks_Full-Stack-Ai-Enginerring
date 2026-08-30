import { useRef, useState, type KeyboardEvent } from 'react';
import { Building2, Check, MapPin, Search, Stethoscope, X } from 'lucide-react';
import type { Doctor } from '../../types';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  suggestions?: Doctor[];
  loading?: boolean;
}

/** Text search input with an icon and a clear button. */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  ariaLabel = 'Search',
  suggestions = [],
  loading = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleSuggestions = suggestions.slice(0, 5);

  const selectSuggestion = (doctor: Doctor) => {
    onChange(doctor.user?.name ?? doctor.clinicName ?? '');
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && visibleSuggestions.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index + 1) % visibleSuggestions.length);
    } else if (event.key === 'ArrowUp' && visibleSuggestions.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + visibleSuggestions.length) % visibleSuggestions.length);
    } else if (event.key === 'Enter' && open && visibleSuggestions[activeIndex]) {
      event.preventDefault();
      selectSuggestion(visibleSuggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative z-30">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={open && visibleSuggestions.length > 0}
        aria-controls="doctor-search-suggestions"
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="input pl-10 pr-10"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {open && value.trim() && (loading || visibleSuggestions.length > 0 || !loading) && (
        <div id="doctor-search-suggestions" role="listbox" className="absolute mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl animate-scale-in">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
              <Search className="h-4 w-4 animate-pulse" /> Finding relevant care...
            </div>
          ) : visibleSuggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted">No matching doctors yet. Try a name, clinic, or area.</div>
          ) : (
            visibleSuggestions.map((doctor, index) => {
              const name = doctor.user?.name ?? 'Doctor';
              const location = doctor.location?.city || doctor.clinicAddress;
              return (
                <button
                  key={doctor.id}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(doctor)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${index === activeIndex ? 'bg-primary-bg' : 'hover:bg-background-alt'}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-bg text-primary">
                    {doctor.clinicName?.toLowerCase().includes(value.toLowerCase()) ? <Building2 className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
                    <span className="flex items-center gap-1 truncate text-xs text-muted">
                      {doctor.specialty?.name ?? 'Healthcare specialist'}
                      {location && <><span aria-hidden="true">·</span><MapPin className="h-3 w-3 shrink-0" />{location}</>}
                    </span>
                  </span>
                  {index === activeIndex && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
