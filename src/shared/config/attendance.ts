import { z } from "zod";

const attendanceVenueConfigSchema = z.object({
  venueLatitude: z.coerce.number().gte(-90).lte(90),
  venueLongitude: z.coerce.number().gte(-180).lte(180),
  allowedRadiusMeters: z.coerce.number().positive(),
});

export type AttendanceVenueConfig = z.output<typeof attendanceVenueConfigSchema>;

function getRequiredEnv(name: "ATTENDANCE_VENUE_LATITUDE" | "ATTENDANCE_VENUE_LONGITUDE" | "ATTENDANCE_ALLOWED_RADIUS_METERS") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required attendance env: ${name}`);
  }

  return value;
}

export function getAttendanceVenueConfig(): AttendanceVenueConfig {
  return attendanceVenueConfigSchema.parse({
    venueLatitude: getRequiredEnv("ATTENDANCE_VENUE_LATITUDE"),
    venueLongitude: getRequiredEnv("ATTENDANCE_VENUE_LONGITUDE"),
    allowedRadiusMeters: getRequiredEnv("ATTENDANCE_ALLOWED_RADIUS_METERS"),
  });
}