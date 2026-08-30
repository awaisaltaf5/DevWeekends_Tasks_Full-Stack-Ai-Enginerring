import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, GraduationCap, MapPin, Banknote, Languages, Star, Briefcase, ImageIcon, MessageSquareText, Building2, Clock, CalendarCheck, FileText, ExternalLink, Trash2, Loader2 } from 'lucide-react';
import type { DoctorProfile, VerificationAction } from '../types';
import { adminAPI } from '../services/adminAPI';
import { LoadingState, ErrorState } from '../components/PageStates';
import StatusBadge from '../components/StatusBadge';
import SafeImage from '../components/SafeImage';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackAction, setFeedbackAction] = useState<'reject' | 'request_changes'>('reject');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeReason, setRemoveReason] = useState('');
  const [removing, setRemoving] = useState(false);

  const fetchDoctor = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await adminAPI.getDoctorById(id);
      setDoctor(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load doctor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVerification = async (action: VerificationAction['action'], message?: string) => {
    if (!doctor) return;
    setUpdating(true);
    try {
      const updated = await adminAPI.updateDoctorVerification(doctor.id, action, message);
      setDoctor(updated);
      setConfirmApproveOpen(false);
      setFeedbackOpen(false);
      setFeedbackMessage('');
      const labels = {
        approve: 'Doctor approved and is now visible to patients.',
        reject: 'Doctor rejected with feedback.',
        request_changes: 'Changes requested — the doctor was notified.',
      };
      toast('success', labels[action]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update doctor';
      toast('error', msg);
      setError(msg);
    } finally {
      setUpdating(false);
    }
  };

    const openFeedback = (action: 'reject' | 'request_changes') => {
    setFeedbackAction(action);
    setFeedbackMessage('');
    setFeedbackOpen(true);
  };

  const handleRemoveDoctor = async () => {
    if (!doctor) return;
    setRemoving(true);
    try {
      await adminAPI.removeDoctor(doctor.id, removeReason.trim());
      toast('success', 'Doctor removed successfully.');
      navigate('/doctors');
    } catch (err: any) {
      const status = err?.status;
      if (status === 409) {
        toast('warning', err.message || 'This doctor has already been removed.');
      } else if (status === 404) {
        toast('error', 'Doctor not found.');
      } else if (status === 400) {
        toast('error', err.message || 'A removal reason is required.');
      } else {
        toast('error', err?.message || err?.error || 'Failed to remove doctor. Please try again.');
      }
    } finally {
      setRemoving(false);
      setRemoveOpen(false);
      setRemoveReason('');
    }
  };

  if (loading) {
    return (
      <div className='container-docly'>
        <LoadingState label='Loading doctor profile…' />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className='container-docly pt-8'>
        <ErrorState message={error || 'Doctor not found.'} onRetry={fetchDoctor} />
        <div className='mt-6 text-center'>
          <button type='button' onClick={() => navigate('/doctors')} className='btn-secondary px-4 py-2 text-sm'>
            <ArrowLeft className='h-4 w-4' />
            Back to doctors
          </button>
        </div>
      </div>
    );
  }

  const locationLabel = [doctor.location?.city, doctor.location?.area, doctor.location?.country].filter(Boolean).join(', ');
  const profileImage = adminAPI.resolveAssetUrl(doctor.profileImage);

  return (
    <div className='container-docly py-8'>
      <button type='button' onClick={() => navigate('/doctors')}
        className='mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover'>
        <ArrowLeft className='h-4 w-4' />
        Back to doctors
      </button>

      {error && (
        <div className='mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'>{error}</div>
      )}

      {/* Profile header */}
      <div className='card mb-6 overflow-hidden'>
        <div className='flex flex-col gap-5 border-b border-border bg-gradient-to-br from-primary-bg via-background to-background-alt p-6 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-5'>
            <SafeImage src={profileImage} alt={doctor.user.name} fallbackText={doctor.user.name.charAt(0).toUpperCase()}
              className='h-20 w-20 flex-shrink-0 rounded-full ring-4 ring-white' />
            <div>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-2xl font-bold text-foreground'>{doctor.user.name}</h1>
                <StatusBadge status={doctor.verificationStatus} />
              </div>
              <p className='mt-1 flex items-center gap-1.5 text-sm text-muted'>
                <GraduationCap className='h-4 w-4' />
                {doctor.specialty?.name ?? 'Specialty'}
              </p>
              <p className='mt-1 text-sm text-muted'>{doctor.user.email}</p>
            </div>
          </div>
        </div>

        {doctor.verificationMessage ? (
          <div className='flex items-start gap-3 border-b border-border bg-amber-50 px-6 py-4'>
            <MessageSquareText className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600' />
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-amber-900'>Administrator feedback</p>
              <p className='mt-1 text-sm text-amber-800'>{doctor.verificationMessage}</p>
              {doctor.verificationUpdatedAt && (
                <p className='mt-1 text-xs text-amber-700'>Sent {new Date(doctor.verificationUpdatedAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]'>
        {/* Main column */}
        <div className='space-y-6'>
          <section className='card p-6'>
            <h2 className='mb-4 text-base font-semibold text-foreground'>Professional information</h2>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='flex items-center gap-3 rounded-xl bg-background-alt p-4'>
                <Briefcase className='h-5 w-5 text-primary' />
                <div>
                  <p className='text-xs text-muted'>Experience</p>
                  <p className='font-semibold text-foreground'>{doctor.yearsOfExperience} years</p>
                </div>
              </div>
              <div className='flex items-center gap-3 rounded-xl bg-background-alt p-4'>
                <Banknote className='h-5 w-5 text-primary' />
                <div>
                  <p className='text-xs text-muted'>Consultation fee</p>
                  <p className='font-semibold text-foreground'>${doctor.consultationFee}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 rounded-xl bg-background-alt p-4'>
                <Star className='h-5 w-5 text-primary' />
                <div>
                  <p className='text-xs text-muted'>Rating</p>
                  <p className='font-semibold text-foreground'>{doctor.averageRating.toFixed(1)} / 5 ({doctor.totalRatings} reviews)</p>
                </div>
              </div>
              <div className='flex items-center gap-3 rounded-xl bg-background-alt p-4'>
                <Languages className='h-5 w-5 text-primary' />
                <div>
                  <p className='text-xs text-muted'>Languages</p>
                  <p className='font-semibold text-foreground'>{doctor.languages?.join(', ') || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </section>

          {doctor.bio && (
            <section className='card p-6'>
              <h2 className='mb-2 text-base font-semibold text-foreground'>About</h2>
              <p className='max-w-prose text-sm leading-relaxed text-muted'>{doctor.bio}</p>
            </section>
          )}

          <section className='card p-6'>
            <h2 className='mb-4 text-base font-semibold text-foreground'>Qualifications</h2>
            {doctor.qualifications && doctor.qualifications.length > 0 ? (
              <ul className='space-y-3'>
                {doctor.qualifications.map((q, i) => (
                  <li key={i} className='flex items-start gap-3 rounded-xl bg-background-alt p-4'>
                    <GraduationCap className='mt-0.5 h-5 w-5 flex-shrink-0 text-primary' />
                    <div>
                      <p className='font-medium text-foreground'>{q.degree}</p>
                      <p className='text-sm text-muted'>{q.institution}{q.year ? `  -  ${q.year}` : ''}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-sm text-muted'>No qualifications listed.</p>
            )}
          </section>

          <section className='card p-6'>
            <h2 className='mb-4 text-base font-semibold text-foreground'>Practice / clinic</h2>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='flex items-center gap-3 rounded-xl bg-background-alt p-4'>
                <Building2 className='h-5 w-5 text-primary' />
                <div>
                  <p className='text-xs text-muted'>Clinic</p>
                  <p className='font-semibold text-foreground'>{doctor.clinicName || 'Not specified'}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 rounded-xl bg-background-alt p-4'>
                <MapPin className='h-5 w-5 text-primary' />
                <div>
                  <p className='text-xs text-muted'>Location</p>
                  <p className='font-semibold text-foreground'>{locationLabel || 'Not specified'}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 rounded-xl bg-background-alt p-4 sm:col-span-2'>
                <CalendarCheck className='h-5 w-5 text-primary' />
                <div>
                  <p className='text-xs text-muted'>Clinical address</p>
                  <p className='font-semibold text-foreground'>{doctor.clinicAddress || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </section>

          <section className='card p-6'>
            <h2 className='mb-4 flex items-center gap-2 text-base font-semibold text-foreground'>
              <FileText className='h-4 w-4 text-primary' />
              Verification documents
            </h2>
            {doctor.verificationDocuments && doctor.verificationDocuments.length > 0 ? (
              <ul className='grid gap-3 sm:grid-cols-2'>
                {doctor.verificationDocuments.map((doc, i) => {
                  const docUrl = adminAPI.resolveAssetUrl(doc.url);
                  const isImage = /\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(doc.url);
                  return (
                    <li key={i} className='flex flex-col gap-3 rounded-xl border border-border bg-background-alt p-4'>
                      {isImage && docUrl ? (
                        <SafeImage
                          src={docUrl}
                          alt={doc.label}
                          fallbackText='Doc'
                          className='h-40 w-full rounded-lg object-cover'
                        />
                      ) : (
                        <div className='flex h-40 w-full items-center justify-center rounded-lg border border-dashed border-border bg-background'>
                          <FileText className='h-10 w-10 text-muted' />
                        </div>
                      )}
                      <div className='flex items-center justify-between gap-2'>
                        <p className='min-w-0 truncate text-sm font-medium text-foreground' title={doc.label}>
                          {doc.label}
                        </p>
                        {doc.url && (
                          <a
                            href={docUrl || doc.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex flex-shrink-0 items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover'
                            onClick={!docUrl ? (e) => e.preventDefault() : undefined}
                          >
                            <ExternalLink className='h-3.5 w-3.5' />
                            View
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className='flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background-alt px-6 py-8 text-center'>
                <FileText className='h-8 w-8 text-muted' />
                <p className='text-sm text-muted'>No verification documents uploaded yet.</p>
              </div>
            )}
          </section>

          <section className='card p-6'>
            <h2 className='mb-4 flex items-center gap-2 text-base font-semibold text-foreground'>
              <ImageIcon className='h-4 w-4 text-primary' />
              Uploaded media
            </h2>
            <p className='mb-4 text-sm text-muted'>
              Media is served directly from its CDN URL (e.g. Cloudinary). Missing or unavailable files fall back to a placeholder.
            </p>
            {profileImage ? (
              <SafeImage src={profileImage} alt={`${doctor.user.name} profile`} className='mx-auto max-h-64 rounded-xl object-cover' />
            ) : (
              <div className='flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background-alt px-6 py-10 text-center'>
                <ImageIcon className='h-8 w-8 text-muted' />
                <p className='text-sm text-muted'>No profile image uploaded.</p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          <section className='card p-6'>
            <h2 className='mb-4 text-base font-semibold text-foreground'>Verification status</h2>
            <div className='flex items-center justify-between rounded-xl bg-background-alt p-4'>
              <span className='text-sm text-muted'>Status</span>
              <StatusBadge status={doctor.verificationStatus} />
            </div>
            {doctor.verificationUpdatedAt && (
              <p className='mt-3 flex items-center gap-1.5 text-xs text-muted'>
                <Clock className='h-3.5 w-3.5' />
                Updated {new Date(doctor.verificationUpdatedAt).toLocaleDateString()}
              </p>
            )}
          </section>

                    {doctor.verificationStatus === 'pending' && (
            <section className='card p-6'>
              <h2 className='mb-4 text-base font-semibold text-foreground'>Decision</h2>
              <div className='flex flex-col gap-3'>
                <button type='button' onClick={() => setConfirmApproveOpen(true)} disabled={updating} className='btn-primary px-4 py-2.5 text-sm'>
                  <CheckCircle2 className='h-4 w-4' />
                  Approve doctor
                </button>
                <button type='button' onClick={() => openFeedback('reject')} disabled={updating} className='btn-secondary px-4 py-2.5 text-sm text-red-600'>
                  <XCircle className='h-4 w-4' />
                  Reject doctor
                </button>
                <button type='button' onClick={() => openFeedback('request_changes')} disabled={updating} className='btn-secondary px-4 py-2.5 text-sm'>
                  <MessageSquareText className='h-4 w-4' />
                  Request changes
                </button>
              </div>
            </section>
          )}

          {/* Remove Doctor — available for all verification statuses */}
          <section className='card p-6 border-red-200/50'>
            <h2 className='mb-4 flex items-center gap-2 text-base font-semibold text-red-700'>
              <Trash2 className='h-4 w-4' />
              Remove doctor
            </h2>
            <p className='mb-4 text-sm text-muted'>
              This action removes this doctor's profile and revokes their platform access. A reason is required and will be emailed to the doctor.
            </p>
            <button
              type='button'
              onClick={() => setRemoveOpen(true)}
              disabled={removing}
              className='w-full btn-danger px-4 py-2.5 text-sm'
            >
              <Trash2 className='h-4 w-4' />
              Remove doctor
            </button>
          </section>
        </div>
      </div>

      {/* Approve confirmation */}
      <ConfirmDialog
        open={confirmApproveOpen}
        title='Approve doctor?'
        description={`Approve ${doctor.user.name}? Their profile will become visible to patients and they can accept bookings.`}
        confirmLabel='Approve doctor'
        cancelLabel='Cancel'
        tone='primary'
        loading={updating}
        onConfirm={() => handleVerification('approve')}
        onClose={() => setConfirmApproveOpen(false)}
      />

      {/* Reject / request-changes feedback modal */}
      {feedbackOpen && (
        <div className='fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4' role='dialog' aria-modal='true' aria-label={feedbackAction === 'reject' ? 'Reject doctor' : 'Request changes'}>
          <div className='animate-scale-in w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl'>
            <div className='border-b border-border p-5'>
              <h2 className='text-lg font-semibold text-foreground'>
                {feedbackAction === 'reject' ? 'Reject doctor' : 'Request changes'}
              </h2>
              <p className='mt-1 text-sm text-muted'>
                {feedbackAction === 'reject'
                  ? 'Share the reason for rejection so the doctor understands the decision.'
                  : 'Describe what needs to be updated before the profile can be approved.'}
              </p>
            </div>
            <div className='p-5'>
              <label htmlFor='feedback' className='field-label'>Message to the doctor</label>
              <textarea id='feedback' value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value)}
                rows={5} placeholder='Enter your message or feedback…' className='input min-h-[120px] resize-none' />
            </div>
            <div className='flex flex-col-reverse gap-3 border-t border-border p-5 sm:flex-row sm:justify-end'>
              <button type='button' onClick={() => setFeedbackOpen(false)} disabled={updating} className='btn-secondary px-4 py-2.5 text-sm'>
                Cancel
              </button>
              <button type='button' onClick={() => handleVerification(feedbackAction, feedbackMessage)}
                disabled={updating || !feedbackMessage.trim()}
                className={`px-4 py-2.5 text-sm ${feedbackAction === 'reject' ? 'btn-danger' : 'btn-primary'}`}>
                {feedbackAction === 'reject' ? 'Reject doctor' : 'Request changes'}
              </button>
            </div>
                    </div>
        </div>
      )}

      {/* Remove Doctor confirmation modal */}
      {removeOpen && doctor && (
        <div className='fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4' role='dialog' aria-modal='true' aria-label='Remove doctor'>
          <div className='animate-scale-in w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl'>
            <div className='border-b border-border p-5'>
              <h2 className='text-lg font-semibold text-red-700'>Remove doctor?</h2>
              <p className='mt-1 text-sm text-muted'>
                This action cannot be undone. The doctor profile will be removed and a notification email will be sent.
              </p>
            </div>
            <div className='p-5'>
              <div className='mb-4 rounded-xl bg-background-alt p-4'>
                <p className='text-sm'><span className='font-medium text-foreground'>Doctor:</span> {doctor.user.name}</p>
                <p className='text-sm'><span className='font-medium text-foreground'>Email:</span> {doctor.user.email}</p>
                <p className='text-sm'><span className='font-medium text-foreground'>Status:</span> <StatusBadge status={doctor.verificationStatus} /></p>
              </div>
              <label htmlFor='removal-reason' className='field-label'>Removal reason *</label>
              <textarea
                id='removal-reason'
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                rows={5}
                placeholder='Please provide a reason for removing this doctor profile. This reason will be sent to the doctor by email.'
                className='input min-h-[120px] resize-none'
                disabled={removing}
              />
            </div>
            <div className='flex flex-col-reverse gap-3 border-t border-border p-5 sm:flex-row sm:justify-end'>
              <button
                type='button'
                onClick={() => { setRemoveOpen(false); setRemoveReason(''); }}
                disabled={removing}
                className='btn-secondary px-4 py-2.5 text-sm'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleRemoveDoctor}
                disabled={removing || !removeReason.trim()}
                className='btn-danger px-4 py-2.5 text-sm'
              >
                {removing && <Loader2 className='h-4 w-4 animate-spin' />}
                Remove doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetailPage;
