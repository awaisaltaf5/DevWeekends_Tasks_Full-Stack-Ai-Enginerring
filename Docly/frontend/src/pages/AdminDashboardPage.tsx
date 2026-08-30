import { useCallback, useEffect, useState } from 'react';
import { Activity, Check, ChevronDown, ClipboardList, Edit3, HeartPulse, Plus, Search, ShieldCheck, Stethoscope, UserCheck, UserX, Users, X } from 'lucide-react';
import { apiErrorMessage } from '../services/api';
import { ErrorState, LoadingState } from '../components/ui/States';
import { useAuth } from '../context/AuthContext';
import type { Appointment, Specialty, User } from '../types';
import {
  createAdminSpecialty, deleteAdminSpecialty, fetchAdminAppointments, fetchAdminDashboard,
  fetchAdminDoctors, fetchAdminSpecialties, fetchAdminUsers, updateAdminAppointmentStatus,
  updateAdminSpecialty, updateDoctorVerification, updateUserStatus, type AdminDoctor, type AdminStats,
} from '../services/adminService';

type Tab = 'overview' | 'doctors' | 'users' | 'appointments' | 'specialties';
const tabs: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'appointments', label: 'Appointments', icon: ClipboardList },
  { id: 'specialties', label: 'Specialties', icon: HeartPulse },
];
const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700', confirmed: 'bg-blue-50 text-blue-700', scheduled: 'bg-indigo-50 text-indigo-700',
  completed: 'bg-emerald-50 text-emerald-700', cancelled: 'bg-red-50 text-red-700', 'no-show': 'bg-slate-100 text-slate-600',
};

function StatusPill({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[status] ?? 'bg-slate-100 text-slate-600'}`}>{status.replace('-', ' ')}</span>;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [specialtyForm, setSpecialtyForm] = useState({ name: '', description: '', icon: 'Stethoscope' });
  const [editingSpecialty, setEditingSpecialty] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      if (tab === 'overview') setStats(await fetchAdminDashboard());
      if (tab === 'doctors') setDoctors(await fetchAdminDoctors(status));
      if (tab === 'users') setUsers((await fetchAdminUsers({ search, role: status || undefined })).users);
      if (tab === 'appointments') setAppointments((await fetchAdminAppointments(status)).appointments);
      if (tab === 'specialties') setSpecialties(await fetchAdminSpecialties());
    } catch (err) { setError(apiErrorMessage(err)); }
    finally { setLoading(false); }
  }, [tab, search, status]);

  useEffect(() => { if (user?.role === 'admin') void load(); }, [user, load]);

  async function action(task: () => Promise<void>, message: string) {
    try { await task(); setNotice(message); await load(); } catch (err) { setError(apiErrorMessage(err)); }
  }

  if (!user || user.role !== 'admin') return null;
  const totalByStatus = stats?.appointmentsByStatus ?? {};

  return (
    <section className="container-docly py-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-wider text-primary">Administration</p><h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Platform control center</h1><p className="mt-1 text-sm text-muted">Monitor care delivery, manage access, and keep the directory healthy.</p></div>
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"><ShieldCheck className="h-4 w-4" /> Admin access</div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 overflow-x-auto rounded-xl border border-border bg-background-alt p-1 sm:flex">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => { setTab(id); setError(null); }} className={`inline-flex min-w-max items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors sm:flex-1 ${tab === id ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-foreground'}`}><Icon className="h-4 w-4" />{label}</button>)}
      </div>

      {notice && <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><span className="inline-flex items-center gap-2"><Check className="h-4 w-4" />{notice}</span><button type="button" aria-label="Dismiss" onClick={() => setNotice(null)}><X className="h-4 w-4" /></button></div>}
      {error && <ErrorState message={error} onRetry={() => void load()} />}
      {loading && !error && <LoadingState label="Loading admin workspace..." />}

      {!loading && !error && tab === 'overview' && stats && <Overview stats={stats} />}
      {!loading && !error && tab === 'doctors' && <Doctors doctors={doctors} status={status} setStatus={setStatus} onAction={action} />}
      {!loading && !error && tab === 'users' && <UsersPanel users={users} search={search} setSearch={setSearch} status={status} setStatus={setStatus} onAction={action} />}
      {!loading && !error && tab === 'appointments' && <Appointments appointments={appointments} status={status} setStatus={setStatus} onAction={action} />}
      {!loading && !error && tab === 'specialties' && <Specialties specialties={specialties} form={specialtyForm} setForm={setSpecialtyForm} editing={editingSpecialty} setEditing={setEditingSpecialty} onAction={action} />}
    </section>
  );
}

function Overview({ stats }: { stats: AdminStats }) {
  const cards = [{ label: 'Total patients', value: stats.totalPatients, icon: Users, tone: 'text-blue-600 bg-blue-50' }, { label: 'Total doctors', value: stats.totalDoctors, icon: Stethoscope, tone: 'text-indigo-600 bg-indigo-50' }, { label: 'Pending approvals', value: stats.pendingDoctorApprovals, icon: UserCheck, tone: 'text-amber-600 bg-amber-50' }, { label: 'Appointments', value: stats.totalAppointments, icon: ClipboardList, tone: 'text-emerald-600 bg-emerald-50' }];
  return <div className="space-y-6 animate-fade-up"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(({ label, value, icon: Icon, tone }) => <div key={label} className="card p-4 sm:p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-muted">{label}</p><p className="mt-2 text-3xl font-bold text-foreground">{value}</p></div><span className={`rounded-xl p-2.5 ${tone}`}><Icon className="h-5 w-5" /></span></div></div>)}</div><div className="card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-foreground">Appointment statistics</h2><p className="text-sm text-muted">Current lifecycle distribution</p></div><Activity className="h-5 w-5 text-primary" /></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'no-show'].map(key => <div key={key} className="flex items-center justify-between rounded-lg bg-background-alt px-3 py-3"><StatusPill status={key} /><span className="font-semibold text-foreground">{stats.appointmentsByStatus[key] ?? 0}</span></div>)}</div></div></div>;
}

function Toolbar({ children }: { children: React.ReactNode }) { return <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">{children}</div>; }
function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) { return <label className="relative"><span className="sr-only">Filter</span><select value={value} onChange={e => onChange(e.target.value)} className="input appearance-none py-2 pr-9 sm:w-48">{children}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted" /></label>; }

function Doctors({ doctors, status, setStatus, onAction }: { doctors: AdminDoctor[]; status: string; setStatus: (s: string) => void; onAction: (t: () => Promise<void>, m: string) => Promise<void> }) { return <div className="card overflow-hidden animate-fade-up"><Toolbar><h2 className="font-semibold text-foreground">Doctor verification</h2><Select value={status} onChange={setStatus}><option value="">All statuses</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option></Select></Toolbar><div className="overflow-x-auto"><table className="min-w-[680px] w-full text-left text-sm"><thead className="bg-background-alt text-xs uppercase text-muted"><tr><th className="px-5 py-3">Doctor</th><th className="px-5 py-3">Specialty</th><th className="px-5 py-3">Verification</th><th className="px-5 py-3">Access</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-border">{doctors.map(d => <tr key={d.id}><td className="px-5 py-4 font-medium text-foreground">{d.user?.name ?? 'Doctor'}<span className="block text-xs font-normal text-muted">{d.user?.email}</span></td><td className="px-5 py-4 text-muted">{d.specialty?.name ?? 'Not set'}</td><td className="px-5 py-4"><StatusPill status={d.verificationStatus} /></td><td className="px-5 py-4">{d.isActive ? <span className="text-emerald-700">Active</span> : <span className="text-muted">Inactive</span>}</td><td className="px-5 py-4"><div className="flex gap-2">{d.verificationStatus !== 'verified' && <button type="button" className="btn-primary px-3 py-1.5 text-xs" onClick={() => void onAction(() => updateDoctorVerification(d.id, 'verified'), 'Doctor approved')}>Approve</button>}{d.verificationStatus !== 'rejected' && <button type="button" className="btn-secondary px-3 py-1.5 text-xs text-red-600" onClick={() => { if (window.confirm('Reject this doctor?')) void onAction(() => updateDoctorVerification(d.id, 'rejected'), 'Doctor rejected'); }}>Reject</button>}</div></td></tr>)}</tbody></table>{doctors.length === 0 && <p className="p-10 text-center text-sm text-muted">No doctors match this filter.</p>}</div></div>; }

function UsersPanel({ users, search, setSearch, status, setStatus, onAction }: { users: User[]; search: string; setSearch: (s: string) => void; status: string; setStatus: (s: string) => void; onAction: (t: () => Promise<void>, m: string) => Promise<void> }) { return <div className="card overflow-hidden animate-fade-up"><Toolbar><h2 className="font-semibold text-foreground">User access</h2><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email" className="input py-2 pl-9 sm:w-64" /></label><Select value={status} onChange={setStatus}><option value="">All users</option><option value="patient">Patients</option><option value="doctor">Doctors</option></Select></div></Toolbar><div className="overflow-x-auto"><table className="min-w-[620px] w-full text-left text-sm"><thead className="bg-background-alt text-xs uppercase text-muted"><tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr></thead><tbody className="divide-y divide-border">{users.map(u => <tr key={u.id}><td className="px-5 py-4 font-medium text-foreground">{u.name}<span className="block text-xs font-normal text-muted">{u.email}</span></td><td className="px-5 py-4 capitalize text-muted">{u.role}</td><td className="px-5 py-4">{u.isActive ? <span className="text-emerald-700">Active</span> : <span className="text-red-600">Inactive</span>}</td><td className="px-5 py-4">{u.role !== 'admin' && <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => { if (window.confirm(`${u.isActive ? 'Deactivate' : 'Activate'} ${u.name}?`)) void onAction(() => updateUserStatus(u.id, !u.isActive), `User ${u.isActive ? 'deactivated' : 'activated'}`); }}>{u.isActive ? <><UserX className="h-3.5 w-3.5" /> Deactivate</> : <><UserCheck className="h-3.5 w-3.5" /> Activate</>}</button>}</td></tr>)}</tbody></table>{users.length === 0 && <p className="p-10 text-center text-sm text-muted">No users match this search.</p>}</div></div>; }

function Appointments({ appointments, status, setStatus, onAction }: { appointments: Appointment[]; status: string; setStatus: (s: string) => void; onAction: (t: () => Promise<void>, m: string) => Promise<void> }) { return <div className="card overflow-hidden animate-fade-up"><Toolbar><h2 className="font-semibold text-foreground">Appointment operations</h2><Select value={status} onChange={setStatus}><option value="">All statuses</option>{['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'no-show'].map(s => <option key={s} value={s}>{s}</option>)}</Select></Toolbar><div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left text-sm"><thead className="bg-background-alt text-xs uppercase text-muted"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Patient</th><th className="px-5 py-3">Doctor</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Update</th></tr></thead><tbody className="divide-y divide-border">{appointments.map(a => <tr key={a.id}><td className="px-5 py-4 text-muted">{new Date(a.date).toLocaleDateString()}<span className="block text-xs">{a.startTime} - {a.endTime}</span></td><td className="px-5 py-4 font-medium text-foreground">{a.patient?.name ?? 'Patient'}<span className="block text-xs font-normal text-muted">{a.patient?.email}</span></td><td className="px-5 py-4 text-muted">{a.doctor?.name ?? 'Doctor'}</td><td className="px-5 py-4 capitalize text-muted">{a.type}</td><td className="px-5 py-4"><StatusPill status={a.status} /></td><td className="px-5 py-4"><Select value="" onChange={next => { if (window.confirm(`Change appointment status to ${next}?`)) void onAction(() => updateAdminAppointmentStatus(a.id, next as Appointment['status']), 'Appointment status updated'); }}><option value="">Change...</option>{['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'no-show'].filter(s => s !== a.status).map(s => <option key={s} value={s}>{s}</option>)}</Select></td></tr>)}</tbody></table>{appointments.length === 0 && <p className="p-10 text-center text-sm text-muted">No appointments match this filter.</p>}</div></div>; }

function Specialties({ specialties, form, setForm, editing, setEditing, onAction }: { specialties: Specialty[]; form: { name: string; description: string; icon: string }; setForm: (f: { name: string; description: string; icon: string }) => void; editing: string | null; setEditing: (id: string | null) => void; onAction: (t: () => Promise<void>, m: string) => Promise<void> }) { return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] animate-fade-up"><div className="card overflow-hidden"><div className="border-b border-border p-5"><h2 className="font-semibold text-foreground">Specialty directory</h2><p className="mt-1 text-sm text-muted">Deactivate specialties instead of removing historical references.</p></div><div className="divide-y divide-border">{specialties.map(s => <div key={s.id} className="flex items-center justify-between gap-3 p-4"><div><p className="font-medium text-foreground">{s.name}</p><p className="text-xs text-muted">{s.slug} · {s.isActive ? 'Active' : 'Inactive'}</p></div><div className="flex gap-2"><button type="button" aria-label={`Edit ${s.name}`} className="btn-secondary p-2" onClick={() => { setEditing(s.id); setForm({ name: s.name, description: s.description, icon: s.icon }); }}><Edit3 className="h-4 w-4" /></button>{s.isActive && <button type="button" aria-label={`Deactivate ${s.name}`} className="btn-secondary p-2 text-red-600" onClick={() => { if (window.confirm(`Deactivate ${s.name}?`)) void onAction(() => deleteAdminSpecialty(s.id), 'Specialty deactivated'); }}><X className="h-4 w-4" /></button>}</div></div>)}{specialties.length === 0 && <p className="p-10 text-center text-sm text-muted">No specialties found.</p>}</div></div><form className="card h-fit space-y-4 p-5" onSubmit={e => { e.preventDefault(); if (editing) void onAction(() => updateAdminSpecialty(editing, form), 'Specialty updated'); else void onAction(() => createAdminSpecialty(form), 'Specialty created'); setForm({ name: '', description: '', icon: 'Stethoscope' }); setEditing(null); }}><h2 className="font-semibold text-foreground">{editing ? 'Edit specialty' : 'Add specialty'}</h2><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Specialty name" className="input" /><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" rows={4} className="input" /><input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="Lucide icon name" className="input" /><div className="flex gap-2"><button className="btn-primary flex-1 px-4 py-2 text-sm"><Plus className="h-4 w-4" />{editing ? 'Save changes' : 'Create specialty'}</button>{editing && <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={() => { setEditing(null); setForm({ name: '', description: '', icon: 'Stethoscope' }); }}>Cancel</button>}</div></form></div>; }
