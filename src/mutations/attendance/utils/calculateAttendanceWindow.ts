export interface AttendanceWindow {
  startsAt: Date;
  opensAt: Date;
}

const TEN_AM_START_HOUR = 10;
const FIXED_TEN_AM_LEAD_MINUTES = 100;
const LATER_START_LEAD_MINUTES = 110;

export function calculateAttendanceWindow(scheduleStartsAt: Date | string): AttendanceWindow {
  const startsAt = scheduleStartsAt instanceof Date ? scheduleStartsAt : new Date(scheduleStartsAt);
  const startsAtMs = startsAt.getTime();

  if (Number.isNaN(startsAtMs)) {
    throw new Error("INVALID_SCHEDULE_START");
  }

  const opensAt =
    startsAt.getHours() === TEN_AM_START_HOUR
      ? new Date(startsAtMs - FIXED_TEN_AM_LEAD_MINUTES * 60 * 1000)
      : new Date(startsAtMs - LATER_START_LEAD_MINUTES * 60 * 1000);

  return {
    startsAt,
    opensAt,
  };
}