import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchPrescription } from '../services/medicalService';
import { apiErrorMessage } from '../services/api';
import { LoadingState, ErrorState } from '../components/ui/States';
import PrescriptionCard from '../components/prescriptions/PrescriptionCard';
import type { Prescription } from '../types';

export default function PrescriptionViewPage() {
  const { id } = useParams<{ id: string }>();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchPrescription(id)
      .then(setPrescription)
      .catch((err: unknown) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <section className="container-docly py-8">
      <Link
        to="/records"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my records
      </Link>

      <h1 className="mb-6 text-3xl font-bold text-foreground">Prescription</h1>

      {loading ? (
        <LoadingState label="Loading prescription…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : prescription ? (
        <div className="max-w-3xl">
          <PrescriptionCard prescription={prescription} />
        </div>
      ) : (
        <ErrorState message="Prescription not found." />
      )}
    </section>
  );
}