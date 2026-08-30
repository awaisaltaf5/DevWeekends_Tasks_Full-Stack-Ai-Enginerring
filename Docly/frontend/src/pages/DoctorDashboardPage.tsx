import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, CalendarDays, Clock3, FileText, LayoutDashboard, Settings2, UsersRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDoctorDashboard } from '../hooks/useDoctorDashboard';
import OverviewTab from '../components/doctor/OverviewTab';
import AppointmentsTab from '../components/doctor/AppointmentsTab';
import AvailabilityTab from '../components/doctor/AvailabilityTab';
import PatientsTab from '../components/doctor/PatientsTab';
import ProfileTab from '../components/doctor/ProfileTab';
import MedicalTab from '../components/doctor/MedicalTab';
import type { AppointmentFilter } from '../components/doctor/AppointmentsTab';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'availability', label: 'Availability' },
  { id: 'patients', label: 'Patients' },
  { id: 'medical', label: 'Medical Records' },
  { id: 'profile', label: 'Profile' },
] as const;

export default function DoctorDashboardPage() {
  const { updateUser } = useAuth();
  const {
    profile,
    stats,
    appointments,
    pagination,
    patients,
    slots,
    profileLoading,
    statsLoading,
    appointmentsLoading,
    patientsLoading,
    slotsLoading,
    error,
    saveProfile,
    saveAvailability,
    loadSlots,
    refetchAppointments,
    setAppointmentPage,
    refetchAll,
  } = useDoctorDashboard();

  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabs.some((tab) => tab.id === requestedTab) ? requestedTab! : 'overview',
  );
  const [appointmentFilter, setAppointmentFilter] = useState<AppointmentFilter>({});

  return (
    <section className="container-docly py-8">
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-primary-bg via-background to-background-alt p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
              <Activity className="h-4 w-4" /> Clinical workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Doctor Dashboard</h1>
        {profile?.user?.name && (
          <p className="mt-1 text-muted">Welcome back, {profile.user.name}</p>
        )}
          </div>
          <div className="rounded-xl border border-primary-light bg-white/70 px-4 py-3 text-sm text-muted">
            <span className="block text-xs uppercase tracking-wide">Today</span>
            <span className="font-semibold text-foreground">Stay ahead of your schedule</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-border pb-px" aria-label="Doctor dashboard sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-primary bg-primary-bg text-primary'
                : 'text-muted hover:bg-background-alt hover:text-foreground'
            }`}
          >
            {tab.id === 'overview' && <LayoutDashboard className="h-4 w-4" />}
            {tab.id === 'appointments' && <CalendarDays className="h-4 w-4" />}
            {tab.id === 'availability' && <Clock3 className="h-4 w-4" />}
            {tab.id === 'patients' && <UsersRound className="h-4 w-4" />}
            {tab.id === 'medical' && <FileText className="h-4 w-4" />}
            {tab.id === 'profile' && <Settings2 className="h-4 w-4" />}
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <OverviewTab stats={stats} statsLoading={statsLoading} profile={profile} profileLoading={profileLoading} refetchAll={refetchAll} />
      )}

      {activeTab === 'appointments' && (
        <AppointmentsTab
          appointments={appointments}
          pagination={pagination}
          loading={appointmentsLoading}
          filter={appointmentFilter}
          setFilter={setAppointmentFilter}
          onFilterApply={(f: AppointmentFilter) => {
            setAppointmentFilter(f);
            refetchAppointments(f);
          }}
          onUpdated={() => {
            refetchAll();
            refetchAppointments(appointmentFilter);
          }}
          onPageChange={setAppointmentPage}
        />
      )}

      {activeTab === 'availability' && (
        <AvailabilityTab
          profile={profile}
          slots={slots}
          slotsLoading={slotsLoading}
          onSave={saveAvailability}
          onLoadSlots={loadSlots}
        />
      )}

      {activeTab === 'patients' && (
        <PatientsTab patients={patients} loading={patientsLoading} />
      )}

      {activeTab === 'medical' && (
        <MedicalTab patients={patients} patientsLoading={patientsLoading} />
      )}

      {activeTab === 'profile' && (
        <ProfileTab
          profile={profile}
          loading={profileLoading}
          onSave={saveProfile}
          onUploadImage={async (file: File) => {
            // Imported lazily to avoid SSR issues
            const { uploadProfileImage } = await import('../services/doctorDashboardService');
            return await uploadProfileImage(file);
          }}
          onUpdated={refetchAll}
          onProfileSaved={(updatedName) => updateUser({ name: updatedName })}
        />
      )}
    </section>
  );
}
