import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, CheckCircle2, XCircle, CalendarDays, ArrowRight, RefreshCw } from 'lucide-react';
import type { AdminDashboardStats } from '../types';
import { adminAPI } from '../services/adminAPI';
import StatCard from '../components/StatCard';
import { LoadingState, ErrorState } from '../components/PageStates';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminAPI.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className='container-docly'>
        <LoadingState label='Loading dashboard statistics…' />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className='container-docly pt-8'>
        <ErrorState message={error || 'Unable to load statistics.'} onRetry={fetchStats} />
      </div>
    );
  }

  const completionRate =
    stats.totalAppointments > 0 ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) : 0;

  return (
    <div className='container-docly py-8'>
      <div className='mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
        <div>
          <p className='page-eyebrow'>Overview</p>
          <h1 className='page-title'>Dashboard</h1>
          <p className='page-subtitle'>Welcome back, Administrator. Here is your platform overview.</p>
        </div>
        <button type='button' onClick={fetchStats} className='btn-secondary px-4 py-2 text-sm'>
          <RefreshCw className='h-4 w-4' />
          Refresh
        </button>
      </div>

      <section className='mb-8'>
        <h2 className='mb-4 text-base font-semibold text-foreground'>Doctor verification</h2>
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <StatCard title='Total doctors' value={stats.totalDoctors} icon={<Users className='h-5 w-5' />} iconClass='bg-primary-bg text-primary' href='/doctors' />
          <StatCard title='Pending verification' value={stats.pendingDoctors} icon={<Clock className='h-5 w-5' />} iconClass='bg-amber-50 text-amber-600' href='/doctors?status=pending' />
          <StatCard title='Approved' value={stats.approvedDoctors} icon={<CheckCircle2 className='h-5 w-5' />} iconClass='bg-emerald-50 text-emerald-600' href='/doctors?status=verified' />
          <StatCard title='Rejected' value={stats.rejectedDoctors} icon={<XCircle className='h-5 w-5' />} iconClass='bg-red-50 text-red-600' href='/doctors?status=rejected' />
        </div>
      </section>

      <section className='mb-8'>
        <h2 className='mb-4 text-base font-semibold text-foreground'>Patients &amp; appointments</h2>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <StatCard title='Total patients' value={stats.totalPatients} icon={<Users className='h-5 w-5' />} iconClass='bg-primary-bg text-primary' />
          <StatCard title='Total appointments' value={stats.totalAppointments} icon={<CalendarDays className='h-5 w-5' />} iconClass='bg-primary-bg text-primary' />

          <div className='card p-5'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-sm text-muted'>Completed</p>
                <p className='mt-2 text-3xl font-bold text-emerald-600'>{stats.completedAppointments}</p>
              </div>
              <div className='text-right'>
                <p className='text-sm text-muted'>Pending</p>
                <p className='mt-2 text-3xl font-bold text-amber-600'>{stats.pendingAppointments}</p>
              </div>
            </div>
            <div className='mt-4 h-2 overflow-hidden rounded-full bg-background-alt'>
              <div className='h-full rounded-full bg-gradient-to-r from-emerald-500 to-primary' style={{ width: `${completionRate}%` }} />
            </div>
            <p className='mt-3 text-xs text-muted'>Completion rate: {completionRate}%</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className='mb-4 text-base font-semibold text-foreground'>Quick actions</h2>
        <div className='grid gap-4 sm:grid-cols-2'>
          <Link to='/doctors?status=pending' className='card card-hover group flex items-center justify-between gap-4 p-5'>
            <div>
              <h3 className='font-semibold text-foreground'>Review pending doctors</h3>
              <p className='mt-1 text-sm text-muted'>{stats.pendingDoctors} {stats.pendingDoctors === 1 ? 'doctor' : 'doctors'} awaiting verification.</p>
            </div>
            <ArrowRight className='h-5 w-5 flex-shrink-0 text-primary transition-transform group-hover:translate-x-1' />
          </Link>
          <Link to='/doctors' className='card card-hover group flex items-center justify-between gap-4 p-5'>
            <div>
              <h3 className='font-semibold text-foreground'>Manage doctors</h3>
              <p className='mt-1 text-sm text-muted'>Search, filter and review {stats.totalDoctors} registered doctors.</p>
            </div>
            <ArrowRight className='h-5 w-5 flex-shrink-0 text-primary transition-transform group-hover:translate-x-1' />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
