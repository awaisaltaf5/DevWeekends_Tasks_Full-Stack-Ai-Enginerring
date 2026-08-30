'use client';

import { useState, useEffect } from 'react';

/**
 * Hero background video source.
 * - Local dev: bundled static asset at /videos/docly-hero-background.mp4
 * - Production: set VITE_HERO_VIDEO_URL to a PUBLIC Cloudinary delivery URL.
 *   Only the public URL is exposed to the browser — no Cloudinary secrets.
 */
const HERO_VIDEO_URL =
  import.meta.env.VITE_HERO_VIDEO_URL?.trim() || '/videos/docly-hero-background.mp4';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  ShieldCheck,
  Video,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Sparkles,
  Smile,
  Brain,
  Baby,
  HeartHandshake,
  Bone,
  Eye,
  Ear,
  Activity,
  Ribbon,
  CheckCircle2,
  Users,
  Clock,
} from 'lucide-react';
import { useDoctors } from '../hooks/useDoctors';
import { RatingStars } from '../components/doctors/RatingStars';

// Benefits section data
const benefits = [
  {
    icon: CalendarCheck,
    title: 'Simple booking',
    description:
      'Schedule appointments with just a few taps. Choose your doctor, pick a time that works, and confirm instantly.',
  },
  {
    icon: Video,
    title: 'Online consultations',
    description:
      'Connect with healthcare specialists from the comfort of your home using secure video consultations.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & private',
    description:
      'Your health information is protected with end-to-end encryption, role-based access, and HIPAA-ready security.',
  },
];

// How it works steps
const steps = [
  {
    number: 1,
    title: 'Find a Doctor',
    description: 'Browse specialists by location, specialty, and availability.',
    icon: Stethoscope,
  },
  {
    number: 2,
    title: 'View Details',
    description: 'Check qualifications, experience, ratings, and consultation fees.',
    icon: Eye,
  },
  {
    number: 3,
    title: 'Choose Type',
    description: 'Select between in-clinic visits or online video consultations.',
    icon: Video,
  },
  {
    number: 4,
    title: 'Book Slot',
    description: 'Pick an available time and confirm your appointment instantly.',
    icon: Clock,
  },
];

// Featured specialties
const specialties = [
  { name: 'General Physician', icon: Stethoscope, slug: 'general-physician' },
  { name: 'Cardiologist', icon: HeartPulse, slug: 'cardiologist' },
  { name: 'Dermatologist', icon: Sparkles, slug: 'dermatologist' },
  { name: 'Dentist', icon: Smile, slug: 'dentist' },
  { name: 'Pediatrician', icon: Baby, slug: 'pediatrician' },
  { name: 'Neurologist', icon: Brain, slug: 'neurologist' },
  { name: 'Gynecologist', icon: Ribbon, slug: 'gynecologist' },
  { name: 'Orthopedic', icon: Bone, slug: 'orthopedic-surgeon' },
];

interface FeaturedDoctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  experience: number;
  fee: number;
  rating: number;
  reviews: number;
  slug: string;
}

export default function HomePage() {
  const { doctors, loading } = useDoctors();
  const [featuredDoctors, setFeaturedDoctors] = useState<FeaturedDoctor[]>([]);
  const [inView, setInView] = useState<Record<string, boolean>>({});

  // Get featured doctors (top 3 by rating)
  useEffect(() => {
    if (doctors && doctors.length > 0) {
      const featured = doctors
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        .slice(0, 3)
        .map((doc) => ({
          id: doc.id || '',
          name: doc.user?.name || 'Doctor',
          specialty: doc.specialty?.name || 'General',
          image:
            doc.profileImage ||
            doc.user?.profileImage ||
            `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
              doc.user?.name || 'Dr'
            )}`,
          experience: doc.yearsOfExperience || 0,
          fee: doc.consultationFee || 0,
          rating: doc.averageRating || 0,
          reviews: doc.totalRatings || 0,
          slug: doc.slug || '',
        }));
      setFeaturedDoctors(featured);
    }
  }, [doctors]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-bg via-background to-background">
        {/* Background video (subtle, behind content). Hidden when prefers-reduced-motion. */}
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover contrast-110 saturate-110 motion-reduce:hidden lg:object-[70%_center]"
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          aria-hidden="true"
        />
        {/* Directional readability overlay: strong on the LEFT (behind hero text), clear on the RIGHT (video visible) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-bg/85 via-background/30 to-background/5 motion-reduce:from-primary-bg motion-reduce:via-background motion-reduce:to-background" />

        {/* Decorative background shapes */}
        <div className="pointer-events-none absolute -right-40 -top-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

        <div className="container-docly relative z-10 mx-auto flex max-w-3xl flex-col items-start justify-center gap-12 py-20 lg:max-w-none lg:py-32">
          {/* Left: Content */}
          <div className="animate-fade-up space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-bg px-3 py-1 text-xs font-medium text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Trusted healthcare platform
              </span>
            </div>

            <div>
              <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                Healthcare made simple, personal, and accessible
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
                Book appointments with top doctors, consult online, and manage your
                health—all in one secure platform. Join thousands of patients and
                doctors using Docly today.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/doctors"
                className="btn-primary px-6 py-3.5 text-base font-medium shadow-lg hover:shadow-xl"
              >
                <Stethoscope className="h-5 w-5" />
                Find a Doctor
              </Link>
              <Link
                to="/register"
                className="btn-secondary px-6 py-3.5 text-base font-medium"
              >
                <ArrowRight className="h-5 w-5" />
                Get Started
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 border-t border-border pt-8">
              <div>
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted">Verified Doctors</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-2xl font-bold text-foreground">1000+</p>
                <p className="text-sm text-muted">Happy Patients</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-2xl font-bold text-foreground">24/7</p>
                <p className="text-sm text-muted">Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Docly Works Section */}
      <section className="bg-background py-20 lg:py-28">
        <div className="container-docly">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-foreground">
              How Docly Works
            </h2>
            <p className="mt-4 text-lg text-muted">
              Book your appointment in four simple steps—it takes less than 2 minutes
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  <div className="card animate-fade-up p-8 text-center transition-all hover:shadow-lg">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-bg text-primary">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted">{step.description}</p>
                  </div>

                  {/* Connection line between steps */}
                  {idx < steps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 hidden h-1 w-8 -translate-y-1/2 transform bg-gradient-to-r from-primary to-transparent lg:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Specialties Section */}
      <section className="bg-background-alt py-20 lg:py-28">
        <div className="container-docly">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-foreground">
              Medical Specialties
            </h2>
            <p className="mt-4 text-lg text-muted">
              Find specialists across all major medical fields
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {specialties.map((spec) => {
              const Icon = spec.icon;
              return (
                <Link
                  key={spec.slug}
                  to={`/doctors?specialty=${spec.slug}`}
                  className="card card-hover group flex items-center gap-4 p-5 transition-all"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary transition-all group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary">
                      {spec.name}
                    </h3>
                    <p className="text-xs text-muted">Browse doctors</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted transition-all group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-20 lg:py-28">
        <div className="container-docly">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-foreground">
                Top Doctors
              </h2>
              <p className="mt-2 text-lg text-muted">
                Meet our highest-rated healthcare professionals
              </p>
            </div>
            <Link
              to="/doctors"
              className="hidden items-center gap-2 text-primary hover:text-primary-hover sm:flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="card h-80 animate-pulse bg-background-alt"
                />
              ))}
            </div>
          ) : featuredDoctors.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredDoctors.map((doctor) => (
                <Link
                  key={doctor.id}
                  to={`/doctors/${doctor.slug}`}
                  className="card card-hover group overflow-hidden transition-all"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary-bg to-background-alt">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                      Dr. {doctor.name}
                    </h3>
                    <p className="mt-1 text-sm text-primary font-medium">
                      {doctor.specialty}
                    </p>

                    <div className="mt-3">
                      <RatingStars
                        rating={doctor.rating}
                        reviews={doctor.reviews}
                      />
                    </div>

                    <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm text-muted">
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {doctor.experience}+ years experience
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        {doctor.reviews} patient reviews
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <span className="font-semibold text-foreground">
                        Rs. {doctor.fee.toLocaleString()}
                      </span>
                      <button className="rounded-lg bg-primary-bg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted">No featured doctors available right now</p>
            </div>
          )}

          <div className="mt-12 text-center sm:hidden">
            <Link to="/doctors" className="btn-primary px-6 py-3">
              View All Doctors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section - Redesigned */}
      <section className="bg-background-alt py-20 lg:py-28">
        <div className="container-docly">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-foreground">
              Why Choose Docly
            </h2>
            <p className="mt-4 text-lg text-muted">
              Built for modern healthcare with patient and doctor at the center
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="card card-hover p-8 transition-all"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-bg text-primary">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary to-accent py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-white blur-2xl" />
          <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-white blur-2xl" />
        </div>

        <div className="container-docly relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Ready to find a doctor?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Join thousands of patients booking appointments with confidence
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-primary hover:bg-gray-50 transition-colors"
            >
              <Stethoscope className="h-5 w-5" />
              Start Booking
            </Link>
            <Link
              to="/register?role=doctor"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <Users className="h-5 w-5" />
              Join as Doctor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}