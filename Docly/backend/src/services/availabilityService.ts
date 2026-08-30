import mongoose from 'mongoose';
import { Appointment, type AvailabilitySlot } from '../models';
import { AppError } from '../utils/AppError';

/** An "HH:MM" 24-hour time helper: minutes since midnight, or -1 when invalid. */
export function timeToMinutes(time: string): number {
  if (typeof time !== 'string') return -1;
  const match = /^(\d{2}):(\d{2})$/.exec(time.trim());
  if (!match) return -1;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return -1;
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const safe = Math.max(0, minutes % 1440);
  const h = String(Math.floor(safe / 60)).padStart(2, '0');
  const m = String(safe % 60).padStart(2, '0');
  return `${h}:${m}`;
}

/** Add N minutes to an "HH:MM" string. */
function addMinutes(time: string, duration: number): string {
  return minutesToTime(timeToMinutes(time) + duration);
}

export interface GeneratedSlot {
  startTime: string;
  endTime: string;
}

/**
 * Validate a working-day availability slot. Ensures times parse, start precedes
 * end, duration is positive, and break ranges are well-formed, inside the
 * working window, and non-overlapping with each other.
 */
export function validateAvailabilitySlot(slot: AvailabilitySlot, index: number): string | null {
  if (typeof slot.day !== 'number' || slot.day < 0 || slot.day > 6) {
    return `Day must be 0..6 at index ${index}`;
  }
  const start = timeToMinutes(slot.startTime);
  const end = timeToMinutes(slot.endTime);
  if (start < 0 || end < 0) {
    return `Invalid time format on day ${slot.day}`;
  }
  if (start >= end) {
    return `Start time must be before end time on day ${slot.day}`;
  }
  if (!slot.slotDuration || slot.slotDuration <= 0) {
    return `Slot duration must be a positive number on day ${slot.day}`;
  }

  const breaks = Array.isArray(slot.breaks) ? slot.breaks : [];
  const seen: Array<[number, number]> = [];
  for (const b of breaks) {
    const bs = timeToMinutes(b.startTime);
    const be = timeToMinutes(b.endTime);
    if (bs < 0 || be < 0) {
      return `Invalid break time on day ${slot.day}`;
    }
    if (bs >= be) {
      return `Break start must be before break end on day ${slot.day}`;
    }
    if (bs < start || be > end) {
      return `Break must be within working hours on day ${slot.day}`;
    }
    for (const [ps, pe] of seen) {
      if (bs < pe && be > ps) {
        return `Breaks overlap on day ${slot.day}`;
      }
    }
    seen.push([bs, be]);
  }
  return null;
}

/** Validate a full set of availability slots, including cross-slot overlap. */
export function validateAvailabilitySet(slots: AvailabilitySlot[]): string | null {
  const byDay = new Map<number, Array<[number, number, boolean]>>();
  slots.forEach((slot, index) => {
    const err = validateAvailabilitySlot(slot, index);
    if (err) throw new AppError(400, err);
    if (!byDay.has(slot.day)) byDay.set(slot.day, []);
    byDay.get(slot.day)!.push([
      timeToMinutes(slot.startTime),
      timeToMinutes(slot.endTime),
      !!slot.isAvailable,
    ]);
  });

  for (const [, ranges] of byDay) {
    const enabled = ranges.filter(([, , active]) => active);
    for (let i = 0; i < enabled.length; i++) {
      for (let j = i + 1; j < enabled.length; j++) {
        const [aStart, aEnd] = enabled[i];
        const [bStart, bEnd] = enabled[j];
        if (aStart < bEnd && bStart < aEnd) {
          return 'Working-hour ranges overlap on the same day.';
        }
      }
    }
  }
  return null;
}

/** Is the given date (local, midnight) before local "today" midnight? */
function isDateBeforeToday(date: Date): boolean {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return date.getTime() < dayStart;
}

/**
 * Generate the concrete appointment slots for a doctor on a specific date.
 *
 * Respects: the doctor's weekly availability, per-slot enable flag, breaks,
 * blocked dates, the slot duration, already-booked appointments, and the
 * current time (past slots are excluded for today).
 */
export async function generateSlots(
  profile: {
    availability: AvailabilitySlot[];
    blockedDates?: Date[] | string[];
    _id: unknown;
  },
  dateStr: string,
): Promise<GeneratedSlot[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new AppError(400, 'Provide a valid date in YYYY-MM-DD format.');
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = date.getDay();

  const blocked = (profile.blockedDates ?? []).map((b) => {
    const dt = b instanceof Date ? b : new Date(b);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  });
  if (blocked.includes(dateStr)) {
    return [];
  }

  const working = (profile.availability ?? []).filter(
    (slot) => slot.day === dayOfWeek && slot.isAvailable,
  );
  if (working.length === 0) {
    return [];
  }

  const dayStart = new Date(y, m - 1, d);
  const dayEnd = new Date(y, m - 1, d + 1);
    const booked = await Appointment.find({
    doctorProfile: profile._id as unknown as mongoose.Types.ObjectId,
    date: { $gte: dayStart, $lt: dayEnd },
        status: { $in: ['scheduled', 'confirmed', 'pending', 'completed'] },
  }).lean();
  const bookedKeys = new Set(booked.map((a) => `${a.startTime}-${a.endTime}`));

  const now = new Date();
  const result: GeneratedSlot[] = [];
  const candidates = new Set<string>();

  for (const slot of working) {
    const duration = slot.slotDuration > 0 ? slot.slotDuration : 30;
    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);
    const breaks = (slot.breaks ?? [])
      .map((b) => [timeToMinutes(b.startTime), timeToMinutes(b.endTime)] as const)
      .filter(([s, e]) => s >= 0 && e >= 0 && s < e);

    let cursor = start;
    while (cursor + duration <= end) {
      const inBreak = breaks.some(([bs, be]) => cursor < be && cursor + duration > bs);
      if (!inBreak) {
        const startTime = minutesToTime(cursor);
        const endTime = minutesToTime(cursor + duration);

        if (!isDateBeforeToday(date)) {
          const slotDate = new Date(y, m - 1, d, Math.floor(cursor / 60), cursor % 60);
          if (slotDate.getTime() <= now.getTime()) {
            cursor += duration;
            continue;
          }
        }

        const key = `${startTime}-${endTime}`;
        if (!bookedKeys.has(key)) {
          candidates.add(key);
        }
      }
      cursor += duration;
    }
  }

  for (const key of candidates) {
    const [s, e] = key.split('-');
    result.push({ startTime: s, endTime: e });
  }
  result.sort((a, b) => a.startTime.localeCompare(b.startTime));
  return result;
}

/**
 * Verify that a request to book `startTime..endTime` on `dateStr` is valid for
 * the given doctor profile. Throws an AppError with a friendly message when the
 * slot is not bookable.
 */
export async function assertBookable(
  profile: {
    availability: AvailabilitySlot[];
    blockedDates?: Date[] | string[];
    _id: unknown;
    isActive: boolean;
  },
  dateStr: string,
  startTime: string,
  endTime: string,
): Promise<void> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new AppError(400, 'Provide a valid date in YYYY-MM-DD format.');
  }
  if (timeToMinutes(startTime) < 0 || timeToMinutes(endTime) < 0) {
    throw new AppError(400, 'Invalid appointment time format.');
  }
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    throw new AppError(400, 'Appointment end time must be after start time.');
  }
  if (!profile.isActive) {
    throw new AppError(400, 'This doctor is not accepting appointments.');
  }

  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (isDateBeforeToday(date)) {
    throw new AppError(400, 'Cannot book an appointment in the past.');
  }

  const slots = await generateSlots(profile, dateStr);
  const match = slots.find((s) => s.startTime === startTime && s.endTime === endTime);
  if (!match) {
    throw new AppError(409, `The requested slot ${startTime}-${endTime} is not available.`);
  }
}