import { z } from "zod";

const attendanceCoordinateSchema = z.coerce.number().finite();

export const attendanceCheckInSchema = z.object({
  scheduleAssignmentId: z.string().trim().min(1),
  latitude: attendanceCoordinateSchema.gte(-90).lte(90),
  longitude: attendanceCoordinateSchema.gte(-180).lte(180),
  accuracyMeters: z.union([z.coerce.number().finite().nonnegative(), z.nan()]).optional(),
});

export type AttendanceCheckInInput = z.input<typeof attendanceCheckInSchema>;
export type AttendanceCheckInPayload = {
  scheduleAssignmentId: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
};

function normalizeAttendanceCheckInInput(input: AttendanceCheckInInput): AttendanceCheckInInput {
  return {
    scheduleAssignmentId: input.scheduleAssignmentId,
    latitude: input.latitude,
    longitude: input.longitude,
    accuracyMeters: input.accuracyMeters === "" ? undefined : input.accuracyMeters,
  };
}

export function parseAttendanceCheckInInput(input: AttendanceCheckInInput): AttendanceCheckInPayload {
  const parsed = attendanceCheckInSchema.parse(normalizeAttendanceCheckInInput(input));

  return {
    scheduleAssignmentId: parsed.scheduleAssignmentId,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    accuracyMeters: Number.isNaN(parsed.accuracyMeters) ? undefined : parsed.accuracyMeters,
  };
}

export function parseSubmitAttendanceCheckInFormData(formData: FormData): AttendanceCheckInPayload {
  return parseAttendanceCheckInInput({
    scheduleAssignmentId: String(formData.get("scheduleAssignmentId") ?? ""),
    latitude: String(formData.get("latitude") ?? ""),
    longitude: String(formData.get("longitude") ?? ""),
    accuracyMeters: formData.get("accuracyMeters") == null ? undefined : String(formData.get("accuracyMeters")),
  });
}