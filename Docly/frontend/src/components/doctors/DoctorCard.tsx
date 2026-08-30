import { Link } from 'react-router-dom';
import {
  MapPin,
  BriefcaseMedical,
  Banknote,
  Video,
  Building2,
  Award,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react';
import type { Doctor } from '../../types';
import { RatingStars } from './RatingStars';
import { specialtyIcon } from '../../utils/specialtyIcons';

interface Props {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: Props) {
  const name = doctor.user?.name ?? 'Doctor';
  const avatar =
    doctor.profileImage ||
    doctor.user?.profileImage ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;
  const Icon = specialtyIcon(doctor.specialty?.slug ?? '');

  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <Link to={`/doctors/${doctor.slug}`} className="p-5 pb-0" aria-label={`View profile of ${name}`}>
      <div className="flex items-start gap-4">
        <img
          src={avatar}
          alt={name}
          loading="lazy"
          className="h-14 w-14 rounded-full border border-border object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-foreground group-hover:text-primary">
            {name}
            {doctor.verificationStatus === 'verified' && (
              <BadgeCheck className="ml-1 inline h-4 w-4 text-primary" aria-label="Verified doctor" />
            )}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-primary">
            <Icon className="h-3.5 w-3.5" />
            <span className="truncate">{doctor.specialty?.name ?? 'General'}</span>
          </p>
          <div className="mt-1">
            <RatingStars rating={doctor.averageRating} reviews={doctor.totalRatings} />
          </div>
        </div>
      </div>
      </Link>

      <div className="mt-4 space-y-1.5 px-5 text-sm text-muted">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {doctor.location?.city || doctor.clinicAddress || 'Location unavailable'}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <BriefcaseMedical className="h-4 w-4 shrink-0" />
          {doctor.yearsOfExperience} years experience
        </p>
        <p className="flex items-center gap-2">
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{doctor.clinicName || 'Independent'}</span>
        </p>
      </div>

      {doctor.bio && (
        <p className="mt-4 line-clamp-2 px-5 text-sm leading-relaxed text-muted">{doctor.bio}</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border px-5 pt-4">
        <span className="flex items-center gap-1.5 font-semibold text-foreground">
          <Banknote className="h-4 w-4 text-primary" />
          Rs. {doctor.consultationFee.toLocaleString()}
        </span>
        {doctor.visitTypes?.some((t) => t === 'video') && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-bg px-2 py-1 text-xs font-medium text-primary">
            <Video className="h-3 w-3" />
            Online
          </span>
        )}
      </div>

      {doctor.qualifications?.length > 0 && (
        <p className="mt-3 flex items-center gap-1.5 px-5 text-xs text-muted">
          <Award className="h-3.5 w-3.5" />
          <span className="truncate">{doctor.qualifications[0].degree}</span>
        </p>
      )}

      <div className="mt-5 flex gap-2 border-t border-border p-5">
        <Link to={`/doctors/${doctor.slug}`} className="btn-secondary flex-1 px-3 py-2 text-xs">
          View profile
        </Link>
        <Link to={`/doctors/${doctor.slug}`} className="btn-primary flex-1 px-3 py-2 text-xs">
          Book appointment
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}