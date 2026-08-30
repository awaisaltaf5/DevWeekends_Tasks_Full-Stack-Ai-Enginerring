import { useState } from 'react';
import { BadgeCheck, Camera, Save, Stethoscope } from 'lucide-react';
import type { Doctor, DoctorProfileUpdate, Qualification } from '../../types';
import { LANGUAGES } from '../../utils/constants';
import { useSpecialtiesForProfile } from '../../hooks/useSpecialtiesForProfile';
import { apiErrorMessage } from '../../services/api';

interface ProfileTabProps {
  profile: Doctor | null;
  loading: boolean;
  onSave: (update: DoctorProfileUpdate) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
  onUpdated: () => void;
  onProfileSaved: (name: string) => void;
}

const VisitTypeOptions: ('in-person' | 'video')[] = ['in-person', 'video'];

export default function ProfileTab({
  profile,
  loading,
  onSave,
  onUploadImage,
  onUpdated,
  onProfileSaved,
}: ProfileTabProps) {
  const [form, setForm] = useState<Partial<DoctorProfileUpdate>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { specialties, specialtiesLoading } = useSpecialtiesForProfile();

  const updateField = (field: keyof DoctorProfileUpdate, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const name = form.name ?? profile?.user?.name ?? '';
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      setSuccess(null);
      return;
    }

    const qualifications = form.qualifications ?? profile?.qualifications ?? [];
    const invalidQualification = qualifications.find(
      (qualification) => !qualification.degree.trim() || !qualification.institution.trim(),
    );
    if (invalidQualification) {
      setError('Complete each qualification with a degree and institution, or remove the empty row.');
      setSuccess(null);
      return;
    }

    const yearsOfExperience = form.yearsOfExperience ?? profile?.yearsOfExperience ?? 0;
    const consultationFee = form.consultationFee ?? profile?.consultationFee ?? 0;
    const visitTypes = form.visitTypes ?? profile?.visitTypes ?? [];
    if (!Number.isFinite(yearsOfExperience) || yearsOfExperience < 0 || yearsOfExperience > 60) {
      setError('Years of experience must be between 0 and 60.');
      setSuccess(null);
      return;
    }
    if (!Number.isFinite(consultationFee) || consultationFee < 0) {
      setError('Consultation fee cannot be negative.');
      setSuccess(null);
      return;
    }
    if (visitTypes.length === 0) {
      setError('Choose at least one visit type.');
      setSuccess(null);
      return;
    }

    const update: DoctorProfileUpdate = {
      name: name.trim(),
      bio: form.bio ?? profile?.bio,
      clinicName: form.clinicName ?? profile?.clinicName,
      clinicAddress: form.clinicAddress ?? profile?.clinicAddress,
      yearsOfExperience,
      consultationFee,
      languages: form.languages ?? profile?.languages,
      visitTypes,
      qualifications,
      specialty: form.specialty ?? profile?.specialty?.id,
    };
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await onSave(update);
      onProfileSaved(name.trim());
      setSuccess('Profile updated.');
      onUpdated();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await onUploadImage(file);
      setSuccess('Profile image updated.');
      onUpdated();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <p className="text-muted">Loading profile…</p>;
  }

  if (!profile) {
    return <p className="text-muted">No profile found.</p>;
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      {/* Profile image */}
      <div className="card flex flex-wrap items-center gap-4 bg-gradient-to-br from-primary-bg to-background-alt p-5">
        <img
          src={profile.profileImage || ''}
          alt={profile.user?.name ?? 'Doctor'}
          className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-sm"
        />
        <div>
          <label className="block text-sm font-medium text-foreground" htmlFor="doctor-name">Full name</label>
          <div className="mt-1 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 shrink-0 text-primary" />
            <input
              id="doctor-name"
              type="text"
              value={form.name ?? profile.user?.name ?? ''}
              onChange={(event) => updateField('name', event.target.value)}
              maxLength={80}
              className="input py-2 font-semibold"
              aria-label="Full name"
            />
          </div>
          <label className="btn-secondary mt-2 cursor-pointer text-sm">
            <Camera className="h-4 w-4" />
            {uploading ? 'Uploading…' : 'Upload photo'}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          <p className="mt-1 text-xs text-muted">JPG, PNG, max 5MB.</p>
        </div>
      </div>

      {/* Bio */}
      <div className="card p-5">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">Professional details</p>
        <label className="block text-sm font-medium text-foreground">Bio</label>
        <textarea
          value={form.bio ?? profile.bio ?? ''}
          onChange={(e) => updateField('bio', e.target.value)}
          rows={4}
          className="input mt-1"
          maxLength={2000}
        />
      </div>

      {/* Clinic */}
      <div className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Clinic name</label>
          <input
            type="text"
            value={form.clinicName ?? profile.clinicName ?? ''}
            onChange={(e) => updateField('clinicName', e.target.value)}
            className="input mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Clinic address</label>
          <input
            type="text"
            value={form.clinicAddress ?? profile.clinicAddress ?? ''}
            onChange={(e) => updateField('clinicAddress', e.target.value)}
            className="input mt-1"
          />
        </div>
      </div>

      {/* Fee & Experience */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">Consultation fee (Rs.)</label>
          <input
            type="number"
            min={0}
            value={form.consultationFee ?? profile.consultationFee ?? 0}
            onChange={(e) => updateField('consultationFee', Number(e.target.value))}
            className="input mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Years of experience</label>
          <input
            type="number"
            min={0}
            max={60}
            value={form.yearsOfExperience ?? profile.yearsOfExperience ?? 0}
            onChange={(e) => updateField('yearsOfExperience', Number(e.target.value))}
            className="input mt-1"
          />
        </div>
      </div>

      {/* Languages */}
      <div className="card p-5">
        <label className="block text-sm font-medium text-foreground">Languages</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {(form.languages ?? profile.languages ?? ['English']).map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
            >
              {lang}
              <button
                onClick={() =>
                  updateField(
                    'languages',
                    (form.languages ?? profile.languages ?? []).filter((l) => l !== lang),
                  )
                }
                className="hover:text-red-700"
              >
                ×
              </button>
            </span>
          ))}
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (!val) return;
              const current = form.languages ?? profile.languages ?? [];
              if (!current.includes(val)) {
                updateField('languages', [...current, val]);
              }
            }}
            className="input w-36 text-sm"
            defaultValue=""
          >
            <option value="" disabled>Add language</option>
            {LANGUAGES.filter((l) => !(form.languages ?? profile.languages ?? []).includes(l)).map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Visit types */}
      <div className="card p-5">
        <label className="block text-sm font-medium text-foreground">Visit types</label>
        <div className="mt-1 flex gap-4">
          {VisitTypeOptions.map((vt) => {
            const current = form.visitTypes ?? profile.visitTypes ?? [];
            return (
              <label key={vt} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={current.includes(vt)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...current, vt]
                      : current.filter((v) => v !== vt);
                    updateField('visitTypes', updated);
                  }}
                />
                {vt}
              </label>
            );
          })}
        </div>
      </div>

      {/* Specialty */}
      <div className="card p-5">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary"><BadgeCheck className="h-4 w-4" /> Practice details</p>
        <label className="block text-sm font-medium text-foreground">Specialty</label>
        <select
          value={form.specialty ?? profile.specialty?.id ?? ''}
          onChange={(e) => updateField('specialty', e.target.value || undefined)}
          className="input mt-1"
          disabled={specialtiesLoading}
        >
          {specialtiesLoading && <option>Loading…</option>}
          {!specialtiesLoading &&
            specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </select>
      </div>

      {/* Qualifications */}
      <div className="card p-5">
        <label className="block text-sm font-medium text-foreground">Qualifications</label>
        <QualificationsEditor
          qualifications={form.qualifications ?? profile.qualifications ?? []}
          onChange={(q) => updateField('qualifications', q)}
        />
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
        <Save className="h-4 w-4" />
        {saving ? 'Saving…' : 'Save profile'}
      </button>
    </div>
  );
}

function QualificationsEditor({
  qualifications,
  onChange,
}: {
  qualifications: Qualification[];
  onChange: (q: Qualification[]) => void;
}) {
  const update = (index: number, field: keyof Qualification, value: string | number | undefined) => {
    onChange(qualifications.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  };
  const add = () => onChange([...qualifications, { degree: '', institution: '', year: undefined }]);
  const remove = (index: number) => onChange(qualifications.filter((_, i) => i !== index));

  return (
    <div className="mt-2 space-y-3">
      {qualifications.map((q, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <input
            type="text"
            placeholder="Degree"
            value={q.degree}
            onChange={(e) => update(i, 'degree', e.target.value)}
            className="input text-sm"
          />
          <input
            type="text"
            placeholder="Institution"
            value={q.institution}
            onChange={(e) => update(i, 'institution', e.target.value)}
            className="input text-sm"
          />
          <input
            type="number"
            placeholder="Year"
            value={q.year ?? ''}
            onChange={(e) => update(i, 'year', e.target.value ? Number(e.target.value) : undefined)}
            className="input text-sm sm:col-span-1"
          />
          <button onClick={() => remove(i)} className="text-xs text-red-600 hover:underline">
            Remove
          </button>
        </div>
      ))}
      <button onClick={add} className="btn-secondary text-xs">
        + Add qualification
      </button>
    </div>
  );
}
