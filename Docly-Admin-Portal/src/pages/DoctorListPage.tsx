import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, ChevronLeft, ChevronRight, FilterX } from 'lucide-react';
import type { DoctorProfile, Specialty } from '../types';
import { adminAPI } from '../services/adminAPI';
import { LoadingState, ErrorState, EmptyState } from '../components/PageStates';
import StatusBadge from '../components/StatusBadge';
import SafeImage from '../components/SafeImage';

const PAGE_SIZE = 10;

const DoctorListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    adminAPI.getSpecialties().then(setSpecialties).catch(() => { /* optional */ });
  }, []);

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, specialty, location, page]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminAPI.getDoctors({
        status: status !== 'all' ? status : undefined,
        specialty: specialty || undefined,
        location: location || undefined,
        search: search || undefined,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      setDoctors(data.doctors);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setSpecialty('');
    setLocation('');
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(search || status !== 'all' || specialty || location);

  return (
    <div className='container-docly py-8'>
      <div className='mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between'>
        <div>
          <p className='page-eyebrow'>Providers</p>
          <h1 className='page-title'>Doctor Management</h1>
          <p className='page-subtitle'>
            {total > 0
              ? `${total.toLocaleString()} provider${total === 1 ? '' : 's'} ${hasFilters ? 'match your filters' : 'on the platform'}.`
              : 'Review and manage all registered doctors.'}
          </p>
        </div>
        {hasFilters && (
          <button type='button' onClick={clearFilters} className='btn-ghost px-4 py-2 text-sm'>
            <FilterX className='h-4 w-4' />
            Clear filters
          </button>
        )}
      </div>

      <div className='card mb-6 p-5'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <div>
            <label htmlFor='search' className='field-label'>Search</label>
            <div className='relative'>
              <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
              <input id='search' type='text' value={search}
                onChange={(e) => { setSearch(e.target.value); updateFilter('search', e.target.value); }}
                placeholder='Name or email' className='input pl-9' />
            </div>
          </div>

          <div>
            <label htmlFor='status' className='field-label'>Verification status</label>
            <select id='status' value={status}
              onChange={(e) => { setStatus(e.target.value); updateFilter('status', e.target.value); }}
              className='input'>
              <option value='all'>All statuses</option>
              <option value='pending'>Pending</option>
              <option value='verified'>Approved</option>
              <option value='rejected'>Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor='specialty' className='field-label'>Specialty</label>
            <select id='specialty' value={specialty}
              onChange={(e) => { setSpecialty(e.target.value); updateFilter('specialty', e.target.value); }}
              className='input'>
              <option value=''>All specialties</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor='location' className='field-label'>Location</label>
            <div className='relative'>
              <MapPin className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
              <input id='location' type='text' value={location}
                onChange={(e) => { setLocation(e.target.value); updateFilter('location', e.target.value); }}
                placeholder='City, area or country' className='input pl-9' />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState label='Loading doctors…' />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDoctors} />
      ) : doctors.length === 0 ? (
        <EmptyState title='No doctors found' description='Try adjusting your search or filters.' />
      ) : (
        <>
          <div className='grid gap-4 md:grid-cols-2'>
            {doctors.map((doctor) => (
              <button key={doctor.id} type='button'
                onClick={() => navigate(`/doctors/${doctor.id}`)}
                className='card card-hover flex items-center gap-4 p-5 text-left'>
                <SafeImage src={adminAPI.resolveAssetUrl(doctor.profileImage)}
                  alt={doctor.user.name} fallbackText={doctor.user.name.charAt(0).toUpperCase()}
                  className='h-14 w-14 flex-shrink-0 rounded-full' />
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h3 className='truncate font-semibold text-foreground'>{doctor.user.name}</h3>
                    <StatusBadge status={doctor.verificationStatus} />
                  </div>
                  <p className='mt-0.5 text-sm text-muted'>{doctor.specialty?.name ?? 'Specialty'}</p>
                  <p className='mt-1 truncate text-xs text-muted'>
                    {[doctor.location?.city, doctor.location?.country].filter(Boolean).join(', ') || 'Location not listed'}
                    {doctor.yearsOfExperience > 0 ? ` · ${doctor.yearsOfExperience} yrs` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
          {totalPages > 1 && (
            <nav className='mt-8 flex items-center justify-center gap-2' aria-label='Pagination'>
              <button type='button' onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1} className='btn-secondary p-2 text-sm' aria-label='Previous page'>
                <ChevronLeft className='h-4 w-4' />
              </button>
              <span className='px-3 text-sm text-muted'>Page {page} of {totalPages}</span>
              <button type='button' onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages} className='btn-secondary p-2 text-sm' aria-label='Next page'>
                <ChevronRight className='h-4 w-4' />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorListPage;
