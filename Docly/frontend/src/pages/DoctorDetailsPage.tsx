import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchDoctor } from '../services/doctorService';
import { apiErrorMessage } from '../services/api';
import { fetchBookableSlots, bookAppointment } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { RatingStars } from '../components/doctors/RatingStars';
import { specialtyIcon } from '../utils/specialtyIcons';
import type { Doctor, BookableSlot } from '../types';
import {
  MapPin,
  Award,
  Languages,
  Video,
  Calendar,
  Clock,
  BadgeCheck,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** Single-doctor detail page fetched by id or slug. */
export default function DoctorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Booking state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<BookableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<BookableSlot | null>(null);
  const [type, setType] = useState<'in-person' | 'video'>('in-person');
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    setError(null);

    fetchDoctor(id)
      .then((doc) => {
        setDoctor(doc);
        setLoading(false);
      })
      .catch((err) => {
        setError(apiErrorMessage(err));
        setLoading(false);
      });
  }, [id, retryKey]);

  // Fetch slots when a date is chosen.
  useEffect(() => {
    if (!doctor?.slug || !date) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }
    setSlotsLoading(true);
    setBookingError(null);
    let active = true;
    fetchBookableSlots(doctor.slug, date)
      .then((result) => {
        if (active) {
          setSlots(result);
          setSelectedSlot(null);
        }
      })
      .catch((err) => {
        if (active) {
          setBookingError(apiErrorMessage(err));
          setSlots([]);
        }
      })
      .finally(() => { if (active) setSlotsLoading(false); });
    return () => { active = false; };
  }, [doctor?.slug, date]);

  const openBooking = () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setBookingSuccess(false);
    setBookingError(null);
    setBookingOpen(true);
  };

  const handleBook = async () => {
    if (!doctor?.slug || !selectedSlot || !date) return;
    setBooking(true);
    setBookingError(null);
    try {
      await bookAppointment({
        doctorRef: doctor.slug,
        date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        type,
        reason: reason || undefined,
      });
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(apiErrorMessage(err));
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading doctor profile…" />;
  }

  if (error) {
    return (
      <div className="container-docly py-12">
        <ErrorState message={error} onRetry={() => setRetryKey((k) => k + 1)} />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container-docly py-12">
        <EmptyState
          title="Doctor not found"
          description="The doctor you are looking for does not exist or the link may have changed."
        />
      </div>
    );
  }

  const Icon = specialtyIcon(doctor.specialty?.slug ?? '');
  const doctorName = doctor.user?.name ?? 'Doctor';
  const avatar =
    doctor.profileImage ||
    doctor.user?.profileImage ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(doctorName)}`;
  const fee = (doctor.consultationFee ?? 0).toLocaleString();

  return (
    <section className="relative overflow-hidden bg-slate-50 py-8 lg:py-12">
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="container-docly relative">
      <Link to="/doctors" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to doctors
      </Link>
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left sidebar — photo + quick stats */}
        <aside className="space-y-6 lg:col-span-4">
          <img
            src={avatar}
            alt={doctorName}
            className="aspect-square w-full rounded-2xl border border-border object-cover"
          />

          <div className="card p-5 text-center">
            <h1 className="text-xl font-semibold text-foreground">{doctorName}</h1>
            {doctor.verificationStatus === 'verified' && (
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                <BadgeCheck className="h-4 w-4" /> Verified profile
              </span>
            )}
            <p className="mt-1 flex items-center justify-center gap-1.5 text-primary">
              <Icon className="h-4 w-4" />
              <span>{doctor.specialty?.name ?? 'General'}</span>
            </p>

            <div className="mt-3">
              <RatingStars
                rating={doctor.averageRating}
                reviews={doctor.totalRatings}
                size={18}
              />
            </div>

            <p className="mt-3 text-2xl font-bold text-foreground">Rs. {fee}</p>
            <p className="text-sm text-muted">Consultation fee</p>
          </div>

          <div className="card p-5 space-y-3 text-sm">
            <div className="flex items-center gap-3 text-foreground">
              <Award className="h-4 w-4 text-primary" />
              <span>{doctor.yearsOfExperience} years of experience</span>
            </div>

            {doctor.clinicName && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-foreground">{doctor.clinicName}</span>
              </div>
            )}

            {doctor.clinicAddress && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted">{doctor.clinicAddress}</span>
              </div>
            )}

            {doctor.location?.city && doctor.location?.country && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted">
                  {doctor.location.city}, {doctor.location.country}
                </span>
              </div>
            )}

            {doctor.languages && doctor.languages.length > 0 && (
              <div className="flex items-center gap-3">
                <Languages className="h-4 w-4 text-primary" />
                <span className="text-muted">{doctor.languages.join(', ')}</span>
              </div>
            )}

            {doctor.visitTypes && doctor.visitTypes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {doctor.visitTypes.includes('video') && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-bg px-2.5 py-1 text-xs font-medium text-primary">
                    <Video className="h-3 w-3" />
                    Video call
                  </span>
                )}
                {doctor.visitTypes.includes('in-person') && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-bg px-2.5 py-1 text-xs font-medium text-primary">
                    <Calendar className="h-3 w-3" />
                    In-person
                  </span>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Bio */}
          <div className="card p-6 transition-shadow hover:shadow-md">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Doctor overview</p>
            <h2 className="mb-3 mt-2 text-2xl font-semibold text-foreground">About {doctorName}</h2>
            <p className="text-muted leading-relaxed">
              {doctor.bio || 'No biography is available for this doctor.'}
            </p>

            {doctor.qualifications && doctor.qualifications.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <h4 className="font-medium text-foreground">Qualifications</h4>
                <ul className="space-y-1 text-sm text-muted">
                  {doctor.qualifications.map((q, i) => (
                    <li key={i} className="flex gap-2">
                      <Award className="h-4 w-4 shrink-0 text-primary" />
                      <span>
                        {q.degree}
                        {q.institution && `, ${q.institution}`}
                        {q.year && `, ${q.year}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Availability */}
          {doctor.availability && doctor.availability.length > 0 && (
            <div className="card p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary">Plan ahead</p>
                  <h2 className="mt-1 font-semibold text-foreground">Weekly availability</h2>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                {doctor.availability
                  .filter((slot) => slot.isAvailable)
                  .sort((a, b) => a.day - b.day)
                  .map((slot) => (
                    <div
                      key={`${slot.day}-${slot.startTime}`}
                      className="flex items-center gap-2 rounded-lg bg-background-alt px-3 py-2"
                    >
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-foreground">
                        {DAY_NAMES[slot.day]}
                      </span>
                      <span className="text-muted">
                        {slot.startTime}–{slot.endTime}
                      </span>
                    </div>
                  ))}
              </div>
              {doctor.availability.filter((s) => s.isAvailable).length === 0 && (
                <p className="text-sm text-muted">No available slots.</p>
              )}
            </div>
          )}

          {/* CTA / Booking */}
          <div className="card border-primary-light bg-gradient-to-br from-primary-bg via-card to-background p-6 transition-shadow hover:shadow-md">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Book your visit</p>
            <p className="mt-2 text-sm text-muted">
              Want to consult with {doctorName}?
            </p>
            <div className="text-center">
              <button
                type="button"
                onClick={openBooking}
                className="btn-primary mt-4 w-full px-6 py-3 text-sm shadow-lg shadow-blue-200/50 sm:w-auto"
                disabled={!doctor.visitTypes || doctor.visitTypes.length === 0}
              >
                Book an appointment
              </button>
            </div>

            {bookingOpen && (
              <div className="mt-6 border-t border-border pt-6">
                {bookingSuccess ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                    <p className="font-medium text-green-800">Appointment booked successfully!</p>
                    <Link to="/appointments" className="btn-primary mt-3 px-4 py-2 text-sm">
                      View my appointments
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground">Select a date</label>
                      <input
                        type="date"
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="input mt-1 w-full sm:w-56"
                      />
                    </div>

                    {slotsLoading && <p className="text-sm text-muted">Loading available slots…</p>}

                    {!slotsLoading && date && slots.length === 0 && (
                      <p className="text-sm text-muted">No slots available for this date.</p>
                    )}

                    {!slotsLoading && slots.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-foreground">Choose a time</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {slots.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setSelectedSlot(s)}
                              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                                selectedSlot?.startTime === s.startTime
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-border bg-card text-foreground hover:border-primary'
                              }`}
                            >
                              {s.startTime} – {s.endTime}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedSlot && (
                      <div>
                        <label className="block text-sm font-medium text-foreground">Visit type</label>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {doctor.visitTypes.filter((visitType) => ['in-person', 'video'].includes(visitType)).map((t) => (
                            <label key={t} className="flex items-center gap-2 text-sm capitalize">
                              <input
                                type="radio"
                                name="visitType"
                                checked={type === t}
                                onChange={() => setType(t as 'in-person' | 'video')}
                                className="h-4 w-4"
                              />
                              {t === 'video' ? <><Video className="h-4 w-4 text-primary" /> Video consultation</> : <><Calendar className="h-4 w-4 text-primary" /> In-person visit</>}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedSlot && (
                      <div>
                        <label className="block text-sm font-medium text-foreground">
                          Reason for visit (optional)
                        </label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={2}
                          maxLength={500}
                          className="input mt-1"
                          placeholder="Tell the doctor why you'd like to consult"
                        />
                      </div>
                    )}

                    {bookingError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {bookingError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleBook}
                        disabled={!selectedSlot || booking}
                        className="btn-primary px-5 py-2 text-sm"
                      >
                        {booking ? 'Booking…' : 'Confirm booking'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingOpen(false)}
                        className="btn-secondary px-5 py-2 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
