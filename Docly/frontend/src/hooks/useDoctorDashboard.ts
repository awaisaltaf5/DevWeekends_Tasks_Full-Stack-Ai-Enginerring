import { useCallback, useEffect, useState } from 'react';
import {
  fetchDashboardStats,
  fetchAppointments,
  fetchPatients,
  fetchSlots,
  setAvailability,
  fetchMyProfile,
  updateMyProfile,
} from '../services/doctorDashboardService';
import { apiErrorMessage } from '../services/api';
import type {
  Appointment,
  DashboardStats,
  Doctor,
  Patient,
  DoctorProfileUpdate,
  AvailabilitySlotForm,
  BookableSlot,
} from '../types';

const PAGE_SIZE = 10;

interface UseDoctorDashboardResult {
  profile: Doctor | null;
  stats: DashboardStats | null;
  appointments: Appointment[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  patients: Patient[];
  slots: BookableSlot[];
  profileLoading: boolean;
  statsLoading: boolean;
  appointmentsLoading: boolean;
  patientsLoading: boolean;
  slotsLoading: boolean;
  error: string | null;
  saveProfile: (update: DoctorProfileUpdate) => Promise<void>;
  saveAvailability: (availability: AvailabilitySlotForm[], blockedDates?: string[]) => Promise<void>;
  loadSlots: (date: string) => void;
  refetchAppointments: (filter?: { status?: string; from?: string; to?: string }) => void;
  setAppointmentPage: (page: number) => void;
  refetchAll: () => void;
}

/** Centralized data hook for the doctor dashboard. */
export function useDoctorDashboard(): UseDoctorDashboardResult {
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [slots, setSlots] = useState<BookableSlot[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [profileLoading, setProfileLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointmentFilter, setAppointmentFilter] = useState<{
    status?: string;
    from?: string;
    to?: string;
  }>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [slotDate, setSlotDate] = useState<string | null>(null);

  const refetchAll = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    setProfileLoading(true);
    setError(null);
    let active = true;
    fetchMyProfile()
      .then((result) => { if (active) setProfile(result); })
      .catch((err) => { if (active) setError(apiErrorMessage(err)); })
      .finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  useEffect(() => {
    setStatsLoading(true);
    let active = true;
    fetchDashboardStats()
      .then((result) => { if (active) setStats(result); })
      .catch((err) => { if (active) setError(apiErrorMessage(err)); })
      .finally(() => { if (active) setStatsLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  const refetchAppointments = useCallback((filter?: { status?: string; from?: string; to?: string }) => {
    setAppointmentFilter(filter ?? {});
    setAppointmentPage(1);
  }, []);

  useEffect(() => {
    setAppointmentsLoading(true);
    let active = true;
    fetchAppointments({ ...appointmentFilter, page: appointmentPage, limit: PAGE_SIZE })
      .then((result) => {
        if (active) {
          setAppointments(result.appointments);
          setPagination(result.pagination);
        }
      })
      .catch((err) => { if (active) setError(apiErrorMessage(err)); })
      .finally(() => { if (active) setAppointmentsLoading(false); });
    return () => { active = false; };
  }, [appointmentFilter, appointmentPage, refreshKey]);

  useEffect(() => {
    setPatientsLoading(true);
    let active = true;
    fetchPatients()
      .then((result) => { if (active) setPatients(result); })
      .catch((err) => { if (active) setError(apiErrorMessage(err)); })
      .finally(() => { if (active) setPatientsLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  useEffect(() => {
    if (!slotDate) return;
    setSlotsLoading(true);
    let active = true;
    fetchSlots(slotDate)
      .then((result) => { if (active) setSlots(result); })
      .catch((err) => { if (active) setError(apiErrorMessage(err)); })
      .finally(() => { if (active) setSlotsLoading(false); });
    return () => { active = false; };
  }, [slotDate, refreshKey]);

  const saveProfile = useCallback(async (update: DoctorProfileUpdate) => {
    const updated = await updateMyProfile(update);
    setProfile(updated);
  }, []);

  const saveAvailability = useCallback(
    async (availability: AvailabilitySlotForm[], blockedDates?: string[]) => {
      await setAvailability(availability, blockedDates);
      refetchAll();
    },
    [refetchAll],
  );

  const loadSlots = useCallback((date: string) => setSlotDate(date), []);

  return {
    profile,
    stats,
    appointments,
    pagination,
    patients,
    slots,
    profileLoading,
    statsLoading,
    appointmentsLoading,
    patientsLoading,
    slotsLoading,
    error,
    saveProfile,
    saveAvailability,
    loadSlots,
    refetchAppointments,
    setAppointmentPage,
    refetchAll,
  };
}
