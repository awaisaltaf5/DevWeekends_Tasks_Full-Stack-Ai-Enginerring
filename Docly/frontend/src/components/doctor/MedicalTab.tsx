import { useCallback, useEffect, useState } from 'react';
import { Stethoscope, UploadCloud, Pill, FilePlus2, Info } from 'lucide-react';
import type { Patient, MedicalRecord, MedicalRecordType, Medicine } from '../../types';
import { LoadingState, EmptyState } from '../../components/ui/States';
import RecordCard from '../../components/records/RecordCard';
import UploadReportForm from '../../components/records/UploadReportForm';
import {
  fetchPatientRecords,
  doctorUploadRecord,
  createPrescription,
} from '../../services/medicalService';
import { apiErrorMessage } from '../../services/api';

interface MedicalTabProps {
  patients: Patient[];
  patientsLoading: boolean;
}

const EMPTY_MEDICINE: Medicine = { name: '', dosage: '', instructions: '', days: undefined };

export default function MedicalTab({ patients, patientsLoading }: MedicalTabProps) {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([{ ...EMPTY_MEDICINE }]);
  const [saving, setSaving] = useState(false);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null;

  const loadRecords = useCallback(async (patientId: string) => {
    setRecordsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      setRecords(await fetchPatientRecords(patientId));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPatientId) loadRecords(selectedPatientId);
    else setRecords([]);
  }, [selectedPatientId, loadRecords]);

  const handleUpload = async (input: {
    file: File;
    title: string;
    description?: string;
    recordType: MedicalRecordType;
  }) => {
    if (!selectedPatientId) return;
    setUploading(true);
    setError(null);
    try {
      await doctorUploadRecord({ patientId: selectedPatientId, ...input });
      setShowUpload(false);
      setSuccess('Document uploaded.');
      await loadRecords(selectedPatientId);
    } catch (err) {
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const updateMedicine = (index: number, patch: Partial<Medicine>) =>
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));

  const handleCreatePrescription = async () => {
    if (!selectedPatientId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await createPrescription({
        patientId: selectedPatientId,
        diagnosis: diagnosis.trim(),
        notes: notes.trim(),
        medicines: medicines.map((m) => ({
          name: m.name.trim(),
          dosage: m.dosage.trim(),
          instructions: m.instructions.trim(),
          days: m.days && m.days > 0 ? m.days : undefined,
        })),
      });
      setSuccess('Prescription saved.');
      setDiagnosis('');
      setNotes('');
      setMedicines([{ ...EMPTY_MEDICINE }]);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (patientsLoading) return <LoadingState label="Loading patients…" />;

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <label className="mb-1 block text-sm font-medium text-foreground">Select a patient</label>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="input"
        >
          <option value="">— Choose a patient —</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.email})
            </option>
          ))}
        </select>
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted">
          <Info className="h-3.5 w-3.5" /> Access is limited to patients you have consulted with.
        </p>
      </div>

      {!selectedPatient && !patientsLoading && (
        <EmptyState
          title="Select a patient"
          description="Choose a patient to view their records, upload documents, or write a prescription."
        />
      )}

      {selectedPatient && (
        <div className="space-y-6">
          <div className="card flex flex-wrap items-center gap-4 p-5">
            <img
              src={
                selectedPatient.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPatient.name)}&background=2563eb&color=fff`
              }
              alt={selectedPatient.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 font-medium text-foreground">
                <Stethoscope className="h-4 w-4 text-primary" /> {selectedPatient.name}
              </p>
              <p className="text-sm text-muted">{selectedPatient.email}</p>
            </div>
            <button
              onClick={() => setShowUpload((v) => !v)}
              className="btn-secondary px-4 py-2 text-sm"
            >
              <UploadCloud className="h-4 w-4" />
              {showUpload ? 'Close' : 'Upload document'}
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{success}</div>
          )}

          {showUpload && (
            <div className="card p-5">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Upload a record</h3>
              <UploadReportForm onUpload={handleUpload} busy={uploading} />
            </div>
          )}

          <section>
            <h3 className="mb-3 text-lg font-semibold text-foreground">
              Medical records ({records.length})
            </h3>
            {recordsLoading ? (
              <LoadingState label="Loading records…" />
            ) : records.length === 0 ? (
              <p className="text-sm text-muted">No records for this patient yet.</p>
            ) : (
              <div className="space-y-3">
                {records.map((r) => (
                  <RecordCard key={r.id} record={r} />
                ))}
              </div>
            )}
          </section>

          <section className="card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <FilePlus2 className="h-5 w-5 text-primary" /> Consultation & prescription
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Diagnosis</label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={2}
                  maxLength={2000}
                  placeholder="Diagnosis…"
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  maxLength={3000}
                  placeholder="Advice, follow-up…"
                  className="input"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Medicines</label>
                <div className="space-y-2">
                  {medicines.map((m, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <input value={m.name} onChange={(e) => updateMedicine(i, { name: e.target.value })} placeholder="Name" className="input text-sm" />
                      <input value={m.dosage} onChange={(e) => updateMedicine(i, { dosage: e.target.value })} placeholder="Dosage" className="input text-sm" />
                      <input value={m.instructions} onChange={(e) => updateMedicine(i, { instructions: e.target.value })} placeholder="Instructions" className="input text-sm" />
                      <div className="flex items-center gap-2">
                        <input type="number" value={m.days ?? ''} onChange={(e) => updateMedicine(i, { days: e.target.value ? Number(e.target.value) : undefined })} placeholder="Days" min={1} max={365} className="input text-sm" />
                        {medicines.length > 1 && (
                          <button onClick={() => setMedicines((prev) => prev.filter((_, x) => x !== i))} className="btn-secondary px-2 py-1.5 text-xs text-red-600">✕</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setMedicines((prev) => [...prev, { ...EMPTY_MEDICINE }])} className="btn-secondary mt-2 px-3 py-1.5 text-xs">
                  + Add medicine
                </button>
              </div>
              <button onClick={handleCreatePrescription} disabled={saving} className="btn-primary px-4 py-2 text-sm">
                {saving ? 'Saving…' : 'Save prescription'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}