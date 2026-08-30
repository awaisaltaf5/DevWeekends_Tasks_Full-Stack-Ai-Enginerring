import { api } from './api';
import type { VideoMeeting } from '../types';

/** GET /api/video/:appointmentId — meeting config for the patient/doctor only. */
export async function fetchVideoMeeting(appointmentId: string): Promise<VideoMeeting> {
  const { data } = await api.get<{ success: boolean; meeting: VideoMeeting }>(
    `/video/${encodeURIComponent(appointmentId)}`,
  );
  return data.meeting;
}