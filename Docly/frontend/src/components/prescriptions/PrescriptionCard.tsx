import { Link } from 'react-router-dom';
import { Calendar, Stethoscope, Pill } from 'lucide-react';
import type { Prescription } from '../../types';

function doctorName(p: Prescription): string {
  if (p.doctorProfile?.doctorName) return p.doctorProfile.doctorName;
  return p.doctor?.name ?? 'Doctor';
}

function formatDate(value?: string): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface PrescriptionCardProps {
  prescription: Prescription;
  showLink?: boolean;
}

/** Renders a prescription (diagnosis, notes, medicines table). */
export default function PrescriptionCard({ prescription, showLink = false }: PrescriptionCardProps) {
  const medicines = prescription.medicines ?? [];
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <p className="text-sm text-muted">Prescribed by</p>
          <p className="font-medium text-foreground">{doctorName(prescription)}</p>
          {prescription.doctorProfile?.clinicName && (
            <p className="inline-flex items-center gap-1 text-sm text-muted">
              <Stethoscope className="h-4 w-4" />
              {prescription.doctorProfile.clinicName}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="inline-flex items-center gap-1 text-sm text-muted">
            <Calendar className="h-4 w-4" />
            {formatDate(prescription.createdAt)}
          </p>
          {prescription.appointment && (
            <p className="mt-1 text-xs text-muted">
              Appointment: {new Date(prescription.appointment.date + 'T00:00:00').toLocaleDateString()} at{' '}
              {prescription.appointment.startTime}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        {prescription.diagnosis && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted">Diagnosis</h4>
            <p className="mt-1 text-foreground">{prescription.diagnosis}</p>
          </div>
        )}

        {medicines.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-muted">
              <Pill className="h-4 w-4" />
              Medications
            </h4>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-background-alt text-left">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 font-medium text-muted">Medicine</th>
                    <th className="px-3 py-2 font-medium text-muted">Dosage</th>
                    <th className="px-3 py-2 font-medium text-muted">Instructions</th>
                    <th className="px-3 py-2 font-medium text-muted">Days</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((m, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-medium text-foreground">{m.name}</td>
                      <td className="px-3 py-2 text-muted">{m.dosage || '—'}</td>
                      <td className="px-3 py-2 text-muted">{m.instructions || '—'}</td>
                      <td className="px-3 py-2 text-muted">{m.days ? `${m.days} days` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {prescription.notes && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted">Notes</h4>
            <p className="mt-1 whitespace-pre-line text-foreground">{prescription.notes}</p>
          </div>
        )}

        {medicines.length === 0 && !prescription.diagnosis && !prescription.notes && (
          <p className="text-sm text-muted">This prescription has no medicine entries yet.</p>
        )}

        {showLink && (
          <div className="border-t border-border pt-3">
            <Link to={`/prescriptions/${prescription.id}`} className="btn-secondary px-3 py-1.5 text-xs">
              View details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}