import type { CurrentWork } from "#queries/work/types/work";

export type CurrentWorkRecord = Omit<CurrentWork, "startAt" | "endAt"> & {
  startAt: string;
  endAt: string;
};

export type CurrentWorkResponse = {
  work: CurrentWorkRecord | null;
};
