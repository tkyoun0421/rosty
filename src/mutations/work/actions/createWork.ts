import type { WorkInput } from "#mutations/work/schemas/work";
import { submitWork } from "#mutations/work/dal/submitWork";
import type { CurrentWork } from "#queries/work/types/work";

export async function createWork(values: WorkInput): Promise<CurrentWork> {
  return submitWork(values);
}
