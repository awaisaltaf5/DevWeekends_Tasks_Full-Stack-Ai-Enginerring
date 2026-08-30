import { useRef, useState, type FormEvent } from 'react';
import { UploadCloud, FileText } from 'lucide-react';
import { validateMedicalFile } from '../../services/medicalService';
import type { MedicalRecordType } from '../../types';

const TYPE_OPTIONS: { value: MedicalRecordType; label: string }[] = [
  { value: 'medical-report', label: 'Medical Report' },
  { value: 'lab-report', label: 'Lab Report' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'document', label: 'Document' },
];

interface UploadReportFormProps {
  onUpload: (input: {
    file: File;
    title: string;
    description?: string;
    recordType: MedicalRecordType;
  }) => Promise<void>;
  busy?: boolean;
}

export default function UploadReportForm({ onUpload, busy }: UploadReportFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recordType, setRecordType] = useState<MedicalRecordType>('medical-report');
  const [error, setError] = useState<string | null>(null);

  const pickFile = (f: File | null) => {
    setError(null);
    if (!f) return setFile(null);
    const err = validateMedicalFile(f);
    if (err) {
      setError(err);
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Please choose a file first.');
      return;
    }
    if (title.trim().length < 2) {
      setError('Please provide a title (at least 2 characters).');
      return;
    }
    try {
      await onUpload({ file, title: title.trim(), description: description.trim() || undefined, recordType });
      setFile(null);
      setTitle('');
      setDescription('');
      setRecordType('medical-report');
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Document type</label>
        <select
          value={recordType}
          onChange={(e) => setRecordType(e.target.value as MedicalRecordType)}
          className="input"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Blood test report — June 2025"
          maxLength={120}
          className="input"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Description <span className="text-muted">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Any notes about this document…"
          className="input"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">File</label>
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-primary ${
            file ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <>
              <FileText className="h-8 w-8 text-primary" />
              <span className="font-medium text-foreground">{file.name}</span>
              <span className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB · click to change</span>
            </>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-muted" />
              <span className="text-sm text-muted">
                Drop a report, lab result, prescription image or PDF here
              </span>
              <span className="text-xs text-muted">JPG, PNG, WEBP, PDF · up to 10 MB</span>
            </>
          )}
        </label>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full px-4 py-2.5 text-sm">
        {busy ? 'Uploading…' : 'Upload document'}
      </button>
    </form>
  );
}