import { CalendarDays, CheckCircle2, Clock3, RefreshCw, UsersRound, WalletCards } from 'lucide-react';
import { type DashboardStats, type Doctor } from '../../types';

interface OverviewTabProps {
  stats: DashboardStats | null;
  statsLoading: boolean;
  profile: Doctor | null;
  profileLoading: boolean;
  refetchAll: () => void;
}

const statCards = (stats: DashboardStats | null, loading: boolean) => {
  if (loading) {
    return Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="card p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-border"></div>
        <div className="mt-2 h-6 w-1/2 animate-pulse rounded bg-border"></div>
      </div>
    ));
  }
  if (!stats) return null;
  return [
    { label: 'Upcoming visits', value: stats.upcomingAppointments, icon: CalendarDays },
    { label: "Today's visits", value: stats.todayAppointments, icon: Clock3 },
    { label: 'Completed visits', value: stats.completedAppointments, icon: CheckCircle2 },
    { label: 'Total patients', value: stats.uniquePatients, icon: UsersRound },
  ].map((s) => (
    <div key={s.label} className="card card-hover p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{s.label}</p>
        <s.icon className="h-5 w-5 text-primary" />
      </div>
      <p className="mt-3 text-3xl font-bold text-foreground">{s.value}</p>
    </div>
  ));
};

export default function OverviewTab({ stats, statsLoading, profile, profileLoading, refetchAll }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{statCards(stats, statsLoading)}</div>

      {stats && (
        <div className="card flex items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Performance</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Earnings</h2>
            <p className="mt-2 text-3xl font-bold text-primary">Rs. {stats.earnings.toLocaleString()}</p>
          </div>
          <WalletCards className="h-10 w-10 text-primary" />
          <p className="text-sm text-muted">From {stats.completedAppointments} completed visits</p>
        </div>
      )}

      {profileLoading ? (
        <div className="card p-6">
          <div className="h-4 w-1/3 animate-pulse rounded bg-border"></div>
        </div>
      ) : profile ? (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-foreground">Verification</h2>
          <p className="mt-1 text-sm text-muted">
            Status: <span className="font-medium text-foreground">{profile.verificationStatus}</span>
          </p>
          {profile.verificationMessage ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="font-semibold">Administrator feedback:</span> {profile.verificationMessage}
            </div>
          ) : null}
          <p className="mt-3 text-sm text-muted">
            Fee: <span className="font-medium text-foreground">${profile.consultationFee}</span> · Experience:{' '}
            <span className="font-medium text-foreground">{profile.yearsOfExperience} years</span>
          </p>
        </div>
      ) : null}

      <button onClick={refetchAll} className="btn-secondary text-sm">
        <RefreshCw className="h-4 w-4" />
        Refresh
      </button>
    </div>
  );
}
