import { z } from "zod";

export const nightWorkResultSchema = z.object({
  status: z.enum(["CONTINUE", "BLOCKED"]),
  reason: z.enum([
    "slice_complete",
    "approval_required",
    "destructive_change",
    "requirement_conflict",
    "external_blocker",
    "scope_exhausted",
  ]),
  summary: z.string().min(1),
  validation: z.string().min(1),
  next_step: z.string().min(1),
});

export function parseNightWorkResult(rawText) {
  try {
    const parsedJson = JSON.parse(rawText);
    return nightWorkResultSchema.parse(parsedJson);
  } catch (error) {
    throw new Error(
      `Invalid night-work result payload: ${
        error instanceof Error ? error.message : "Unknown parse error"
      }`,
    );
  }
}

export function buildNightWorkStatusText(result) {
  return [
    `NIGHT_WORK_STATUS: ${result.status}`,
    `NIGHT_WORK_REASON: ${result.reason}`,
    `NIGHT_WORK_SUMMARY: ${result.summary}`,
    `NIGHT_WORK_VALIDATION: ${result.validation}`,
    `NIGHT_WORK_NEXT_STEP: ${result.next_step}`,
  ].join("\n");
}
