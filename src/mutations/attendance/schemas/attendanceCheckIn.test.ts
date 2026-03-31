import { describe, expect, it } from "vitest";

import {
  parseAttendanceCheckInInput,
  parseSubmitAttendanceCheckInFormData,
} from "#mutations/attendance/schemas/attendanceCheckIn";
import { calculateAttendanceWindow } from "#mutations/attendance/utils/calculateAttendanceWindow";
import { calculateDistanceMeters } from "#mutations/attendance/utils/calculateDistanceMeters";

describe("attendanceCheckIn schema", () => {
  it("parses submit input and normalizes numeric location fields", () => {
    const result = parseAttendanceCheckInInput({
      scheduleAssignmentId: "assignment-1",
      latitude: "37.5001",
      longitude: "127.0351",
      accuracyMeters: "12.5",
    });

    expect(result).toEqual({
      scheduleAssignmentId: "assignment-1",
      latitude: 37.5001,
      longitude: 127.0351,
      accuracyMeters: 12.5,
    });
  });

  it("parses FormData payloads and keeps accuracy optional", () => {
    const formData = new FormData();
    formData.set("scheduleAssignmentId", "assignment-2");
    formData.set("latitude", "37.4999");
    formData.set("longitude", "127.0348");

    const result = parseSubmitAttendanceCheckInFormData(formData);

    expect(result).toEqual({
      scheduleAssignmentId: "assignment-2",
      latitude: 37.4999,
      longitude: 127.0348,
      accuracyMeters: undefined,
    });
  });

  it("rejects invalid coordinate ranges", () => {
    expect(() =>
      parseAttendanceCheckInInput({
        scheduleAssignmentId: "assignment-1",
        latitude: "91",
        longitude: "127.0",
      }),
    ).toThrow();

    expect(() =>
      parseAttendanceCheckInInput({
        scheduleAssignmentId: "assignment-1",
        latitude: "37.5",
        longitude: "-181",
      }),
    ).toThrow();
  });
});

describe("calculateAttendanceWindow", () => {
  it("opens at 08:20 for 10:00 starts", () => {
    const result = calculateAttendanceWindow("2026-04-03T10:00:00+09:00");

    expect(result.startsAt.toISOString()).toBe("2026-04-03T01:00:00.000Z");
    expect(result.opensAt.toISOString()).toBe("2026-04-02T23:20:00.000Z");
  });

  it("opens 1 hour 50 minutes before 11:00 or later starts", () => {
    const result = calculateAttendanceWindow("2026-04-03T11:30:00+09:00");

    expect(result.opensAt.toISOString()).toBe("2026-04-03T00:40:00.000Z");
  });
});

describe("calculateDistanceMeters", () => {
  it("returns zero for identical coordinates", () => {
    expect(
      calculateDistanceMeters({
        originLatitude: 37.5,
        originLongitude: 127.03,
        targetLatitude: 37.5,
        targetLongitude: 127.03,
      }),
    ).toBe(0);
  });
});
