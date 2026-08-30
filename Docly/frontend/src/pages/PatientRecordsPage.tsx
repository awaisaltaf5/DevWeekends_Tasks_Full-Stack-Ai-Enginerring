import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, FilePlus2, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoadingState, EmptyState } from '../components/ui/States';
import RecordCard from '../components/records/RecordCard';
import UploadReportForm from '../components/records/UploadReportForm';
import PrescriptionCard from '../components/prescriptions/PrescriptionCard';
import {
  fetchMyMedicalRecords,
  uploadMyMedicalRecord,
  deleteMyMedicalRecord,
  fetchMyPrescriptions,
} from '../services/medicalService';
import { apiErrorMessage } from '../services/api';
import type { MedicalRecord, MedicalRecordType, Prescription } from '../types';

type Tab = 'records' | 'prescriptions';

export default function PatientRecordsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('records');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'doctor') {
      navigate('/doctor');
    }
  }, [user, navigate]);

  const loadRecords = useCallback(async () => {
    setRecordsLoading(true);
    setError(null);
    try {
      setRecords(await fetchMyMedicalRecords());
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  const loadPrescriptions = useCallback(async () => {
    setPrescriptionsLoading(true);
    setError(null);
    try {
      setPrescriptions(await fetchMyPrescriptions());
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setPrescriptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'patient') return;
    setLoading(true);
    Promise.all([loadRecords(), loadPrescriptions()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleUpload = async (input: {
    file: File;
    title: string;
    description?: string;
    recordType: MedicalRecordType;
  }) => {
    setUploading(true);
    setError(null);
    try {
      await uploadMyMedicalRecord(input);
      setShowUpload(false);
      await loadRecords();
    } catch (err) {
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this medical record? This cannot be undone.')) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteMyMedicalRecord(id);
      setRecords((r) => r.filter((rec) => rec.id !== id));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <section className="container-docly py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Medical Records</h1>
          <p className="mt-1 text-muted">Your uploaded reports and prescriptions.</p>
        </div>
        {tab === 'records' && (
          <button
            onClick={() => setShowUpload((v) => !v)}
            className="btn-primary px-4 py-2 text-sm"
          >
            <FilePlus2 className="h-4 w-4" />
            {showUpload ? 'Close upload' : 'Upload report'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {showUpload && (
        <div className="card mb-6 p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Upload a document</h2>
          <UploadReportForm onUpload={handleUpload} busy={uploading} />
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setTab('records')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            tab === 'records'
              ? 'bg-primary text-white'
              : 'border border-border bg-card text-muted hover:text-foreground'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          Records ({records.length})
        </button>
        <button
          onClick={() => setTab('prescriptions')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            tab === 'prescriptions'
              ? 'bg-primary text-white'
              : 'border border-border bg-card text-muted hover:text-foreground'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Prescriptions ({prescriptions.length})
        </button>
      </div>

      {tab === 'records' &&
        (recordsLoading ? (
          <LoadingState label="Loading records…" />
        ) : records.length === 0 ? (
          <EmptyState
            title="No medical records yet"
            description="Upload your previous reports, lab results, prescription images or PDFs to keep your history in one place."
          />
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <RecordCard
                key={r.id}
                record={r}
                onDelete={handleDelete}
                deleting={deletingId === r.id}
              />
            ))}
          </div>
        ))}

      {tab === 'prescriptions' &&
        (prescriptionsLoading ? (
          <LoadingState label="Loading prescriptions…" />
        ) : prescriptions.length === 0 ? (
          <EmptyState
            title="No prescriptions yet"
            description="Prescriptions written by your doctors will appear here."
          />
        ) : (
          <div className="space-y-4">
            {prescriptions.map((p) => (
              <PrescriptionCard key={p.id} prescription={p} showLink />
            ))}
          </div>
        ))}
    </section>
  );
}