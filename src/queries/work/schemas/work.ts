import { z } from "zod";

import type { CurrentWorkRecord, CurrentWorkResponse } from "#queries/work/dal/work";
import type { CurrentWork } from "#queries/work/types/work";

export const currentWorkRecordSchema = z.object({
  id: z.string().min(1),
  workDate: z.string().min(1),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

export const currentWorkResponseSchema = z.object({
  work: currentWorkRecordSchema.nullable(),
});

export function parseCurrentWorkResponse(payload: unknown): CurrentWorkResponse {
  return currentWorkResponseSchema.parse(payload);
}

export function toCurrentWork(record: CurrentWorkRecord): CurrentWork {
  return {
    ...record,
    startAt: new Date(record.startAt),
    endAt: new Date(record.endAt),
  };
}
