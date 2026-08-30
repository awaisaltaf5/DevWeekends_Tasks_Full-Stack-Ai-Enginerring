import { FileText, Image as ImageIcon, File, Trash2, ScanLine, ClipboardList } from 'lucide-react';
import type { MedicalRecord } from '../../types';

const TYPE_LABELS: Record<MedicalRecord['recordType'], string> = {
  'medical-report': 'Medical Report',
  'lab-report': 'Lab Report',
  prescription: 'Prescription',
  document: 'Document',
};

function typeIcon(t: MedicalRecord['recordType']) {
  switch (t) {
    case 'lab-report':
      return <ScanLine className="h-4 w-4" />;
    case 'prescription':
      return <ClipboardList className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
}

function formatBytes(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value?: string): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isImage(record: MedicalRecord): boolean {
  return (record.mimeType ?? '').startsWith('image/');
}

interface RecordCardProps {
  record: MedicalRecord;
  onDelete?: (id: string) => void;
  deleting?: boolean;
}

export default function RecordCard({ record, onDelete, deleting }: RecordCardProps) {
  const type = record.recordType ?? 'document';
  const doctorName =
    record.uploadedBy === 'doctor' && record.doctor && typeof record.doctor === 'object'
      ? record.doctor.name
      : null;

  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
      <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-background-alt">
        {isImage(record) ? (
          <img
            src={record.fileUrl}
            alt={record.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-primary/5 text-primary">
            <FileText className="h-5 w-5" />
            <span className="mt-1 px-1 text-center text-[8px] font-medium uppercase text-primary">
              PDF
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">{record.title}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {typeIcon(type)}
            {TYPE_LABELS[type]}
          </span>
        </div>
        {record.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{record.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <ImageIcon className="h-3.5 w-3.5" />
            {formatDate(record.createdAt)}
          </span>
          {doctorName && <span>by Dr. {doctorName}</span>}
          {record.fileName && (
            <span className="truncate">
              {record.fileName} · {formatBytes(record.fileSize)}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:flex-col">
        <a
          href={record.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          View
        </a>
        {onDelete && (
          <button
            onClick={() => onDelete(record.id)}
            disabled={deleting}
            className="btn-secondary px-2.5 py-1.5 text-xs text-red-600 hover:border-red-300"
            aria-label="Delete record"
          >
            {deleting ? 'Deleting…' : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}