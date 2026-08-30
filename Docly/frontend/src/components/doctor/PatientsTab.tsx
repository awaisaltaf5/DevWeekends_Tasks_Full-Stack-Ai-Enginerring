import type { Patient } from '../../types';

interface PatientsTabProps {
  patients: Patient[];
  loading: boolean;
}

export default function PatientsTab({ patients, loading }: PatientsTabProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-border"></div>
              <div className="h-4 w-3/4 animate-pulse rounded bg-border"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return <p className="text-muted">No patients found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-2 text-xs font-medium uppercase text-muted">Patient</th>
            <th className="pb-2 text-xs font-medium uppercase text-muted">Email</th>
            <th className="pb-2 text-xs font-medium uppercase text-muted">Completed Visits</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id} className="border-b border-border">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={p.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=2563eb&color=fff`}
                    alt={p.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="font-medium text-foreground">{p.name}</span>
                </div>
              </td>
              <td className="py-3 text-muted">{p.email}</td>
              <td className="py-3 font-medium text-foreground">{p.completedVisits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
