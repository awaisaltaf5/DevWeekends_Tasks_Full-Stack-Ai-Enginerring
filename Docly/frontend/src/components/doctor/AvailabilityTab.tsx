import { useEffect, useState } from 'react';
import { CalendarOff, Clock3, Plus, Save, Trash2 } from 'lucide-react';
import { type Doctor, type AvailabilitySlotForm, type BookableSlot } from '../../types';
import { DAY_NAMES } from '../../utils/constants';
import { apiErrorMessage } from '../../services/api';

interface AvailabilityTabProps {
  profile: Doctor | null;
  slots: BookableSlot[];
  slotsLoading: boolean;
  onSave: (availability: AvailabilitySlotForm[], blockedDates?: string[]) => Promise<void>;
  onLoadSlots: (date: string) => void;
}

const EMPTY_SLOT: AvailabilitySlotForm = {
  day: 0,
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  isAvailable: true,
  breaks: [],
};

export default function AvailabilityTab({
  profile,
  slots,
  slotsLoading,
  onSave,
  onLoadSlots,
}: AvailabilityTabProps) {
  const [availability, setAvailability] = useState<AvailabilitySlotForm[]>(
    profile?.availability && profile.availability.length > 0
      ? profile.availability.map((s) => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          slotDuration: s.slotDuration,
          isAvailable: s.isAvailable,
          breaks: (s.breaks ?? []).map((b) => ({
            startTime: b.startTime,
            endTime: b.endTime,
          })),
        }))
      : [EMPTY_SLOT],
  );
  const [blockedDates, setBlockedDates] = useState<string[]>(
    (profile?.blockedDates ?? []).map((date) => date.slice(0, 10)).sort(),
  );
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewDate, setPreviewDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setAvailability(
      profile.availability?.length
        ? profile.availability.map((slot) => ({ ...slot, breaks: slot.breaks ?? [] }))
        : [EMPTY_SLOT],
    );
    setBlockedDates((profile.blockedDates ?? []).map((date) => date.slice(0, 10)).sort());
  }, [profile]);

  const updateSlot = (index: number, field: keyof AvailabilitySlotForm, value: unknown) => {
    setAvailability((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const addSlot = () => setAvailability((prev) => [...prev, { ...EMPTY_SLOT, day: 0 }]);

  const removeSlot = (index: number) =>
    setAvailability((prev) => prev.filter((_, i) => i !== index));

  const addBreak = (slotIndex: number) => {
    const slot = availability[slotIndex];
    const newBreaks = [
      ...(slot.breaks ?? []),
      { startTime: '13:00', endTime: '14:00' },
    ];
    updateSlot(slotIndex, 'breaks', newBreaks);
  };

  const updateBreak = (slotIndex: number, breakIndex: number, field: string, value: string) => {
    const slot = availability[slotIndex];
    const newBreaks = [...(slot.breaks ?? [])];
    newBreaks[breakIndex] = { ...newBreaks[breakIndex], [field]: value };
    updateSlot(slotIndex, 'breaks', newBreaks);
  };

  const removeBreak = (slotIndex: number, breakIndex: number) => {
    const slot = availability[slotIndex];
    const newBreaks = (slot.breaks ?? []).filter((_, i) => i !== breakIndex);
    updateSlot(slotIndex, 'breaks', newBreaks);
  };

  const addBlockedDate = () => {
    if (newBlockedDate && !blockedDates.includes(newBlockedDate)) {
      setBlockedDates((prev) => [...prev, newBlockedDate].sort());
    }
    setNewBlockedDate('');
  };

  const removeBlockedDate = (date: string) =>
    setBlockedDates((prev) => prev.filter((d) => d !== date));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await onSave(availability, blockedDates);
      setSuccess('Availability updated.');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

    const handlePreview = () => {
    if (previewDate) onLoadSlots(previewDate);
  };

  return (
    <div className="space-y-6">
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Schedule</p>
        <h2 className="mt-1 text-2xl font-semibold text-foreground">Weekly availability</h2>
        <p className="text-sm text-muted">Define your working days, hours, and breaks.</p>
      </div>

      {availability.map((slot, index) => (
        <div key={index} className="card p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-xs font-medium text-foreground">Day</label>
              <select
                value={slot.day}
                onChange={(e) => updateSlot(index, 'day', Number(e.target.value))}
                className="input mt-1"
              >
                {DAY_NAMES.map((day, i) => (
                  <option key={day} value={i}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-foreground">Start</label>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                className="input mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-foreground">End</label>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground">Duration (min)</label>
              <input
                type="number"
                min={15}
                value={slot.slotDuration}
                onChange={(e) => updateSlot(index, 'slotDuration', Number(e.target.value))}
                className="input mt-1"
              />
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={slot.isAvailable}
                onChange={(e) => updateSlot(index, 'isAvailable', e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Active day
            </label>
          </div>

          {/* Breaks */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => addBreak(index)}
              className="btn-secondary text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add break
            </button>
            {(slot.breaks ?? []).map((b, bIndex) => (
              <div key={bIndex} className="mt-2 flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-foreground">Break start</label>
                  <input
                    type="time"
                    value={b.startTime}
                    onChange={(e) => updateBreak(index, bIndex, 'startTime', e.target.value)}
                    className="input mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-foreground">Break end</label>
                  <input
                    type="time"
                    value={b.endTime}
                    onChange={(e) => updateBreak(index, bIndex, 'endTime', e.target.value)}
                    className="input mt-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeBreak(index, bIndex)}
                  className="btn-secondary text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => removeSlot(index)}
            className="mt-4 inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove this day
          </button>
        </div>
      ))}

      <button onClick={addSlot} className="btn-secondary text-sm">
        <Plus className="h-4 w-4" />
        Add working day
      </button>

      {/* Blocked dates */}
      <div className="card p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><CalendarOff className="h-4 w-4 text-primary" /> Blocked dates</h3>
        <p className="mt-1 text-sm text-muted">Mark holidays or days you are temporarily unavailable.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="date"
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            className="input sm:w-48"
          />
          <button onClick={addBlockedDate} className="btn-secondary text-sm" disabled={!newBlockedDate}>
            Add
          </button>
        </div>
        {blockedDates.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {blockedDates.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-700"
              >
                {d}
                <button onClick={() => removeBlockedDate(d)} className="hover:text-red-900">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Slot preview */}
      <div className="card p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Clock3 className="h-4 w-4 text-primary" /> Preview slots</h3>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="date"
            value={previewDate}
            onChange={(e) => setPreviewDate(e.target.value)}
            className="input w-48"
          />
          <button
            onClick={handlePreview}
            disabled={!previewDate || slotsLoading}
            className="btn-secondary text-sm"
          >
            {slotsLoading ? 'Loading…' : 'Preview'}
          </button>
        </div>
        {previewDate && (
          <div className="mt-3">
            {slotsLoading && <p className="text-sm text-muted">Generating slots…</p>}
            {!slotsLoading && slots.length === 0 && <p className="text-sm text-muted">No slots available for this date.</p>}
            {!slotsLoading && slots.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {slots.map((s, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground"
                  >
                    {s.startTime} – {s.endTime}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary text-sm"
      >
        <Save className="h-4 w-4" />
        {saving ? 'Saving…' : 'Save availability'}
      </button>
    </div>
  );
}


