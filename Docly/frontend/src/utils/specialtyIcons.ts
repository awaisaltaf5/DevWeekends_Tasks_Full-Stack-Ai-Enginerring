import {
  HeartPulse,
  Sparkles,
  Smile,
  Brain,
  Baby,
  HeartHandshake,
  Bone,
  Stethoscope,
  Ribbon,
  Eye,
  Ear,
  Activity,
} from 'lucide-react';

/** Type of any Lucide icon component (all share the same signature). */
type IconComponent = typeof Stethoscope;

/** Maps a specialty slug to its representative Lucide icon. */
const SPECIALTY_ICONS: Record<string, IconComponent> = {
  cardiologist: HeartPulse,
  dermatologist: Sparkles,
  dentist: Smile,
  neurologist: Brain,
  pediatrician: Baby,
  psychiatrist: HeartHandshake,
  'orthopedic-surgeon': Bone,
  'general-physician': Stethoscope,
  gynecologist: Ribbon,
  ophthalmologist: Eye,
  'ent-specialist': Ear,
  endocrinologist: Activity,
};

/**
 * Return the Lucide icon component for a specialty slug.
 * Falls back to `Stethoscope` for unknown slugs.
 */
export function specialtyIcon(slug: string): IconComponent {
  return SPECIALTY_ICONS[slug] ?? Stethoscope;
}