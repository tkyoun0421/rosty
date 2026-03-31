import "server-only";

import type { PayPreviewBreakdown } from "#queries/assignment/types/workerAssignmentPreview";

const REGULAR_HOUR_LIMIT = 9;
const OVERTIME_MULTIPLIER = 1.5;
const MS_PER_HOUR = 60 * 60 * 1000;

interface CalculatePayPreviewInput {
  startsAt: string;
  endsAt: string;
  hourlyRateCents: number;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculatePayPreview(input: CalculatePayPreviewInput): PayPreviewBreakdown {
  const startsAtMs = new Date(input.startsAt).getTime();
  const endsAtMs = new Date(input.endsAt).getTime();

  if (!Number.isFinite(startsAtMs) || !Number.isFinite(endsAtMs) || endsAtMs <= startsAtMs) {
    throw new Error("INVALID_SCHEDULE_WINDOW");
  }

  const totalHours = (endsAtMs - startsAtMs) / MS_PER_HOUR;
  const regularHours = roundToTwoDecimals(Math.min(totalHours, REGULAR_HOUR_LIMIT));
  const overtimeHours = roundToTwoDecimals(Math.max(totalHours - REGULAR_HOUR_LIMIT, 0));
  const regularPayCents = Math.round(regularHours * input.hourlyRateCents);
  const overtimePayCents = Math.round(overtimeHours * input.hourlyRateCents * OVERTIME_MULTIPLIER);

  return {
    regularHours,
    overtimeHours,
    overtimeApplied: overtimeHours > 0,
    hourlyRateCents: input.hourlyRateCents,
    regularPayCents,
    overtimePayCents,
    totalPayCents: regularPayCents + overtimePayCents,
  };
}
