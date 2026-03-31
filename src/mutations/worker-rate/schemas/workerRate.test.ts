import { describe, expect, it } from "vitest";

import { workerRateSchema } from "#mutations/worker-rate/schemas/workerRate";

describe("workerRateSchema", () => {
  it("accepts positive integer-cent rates", () => {
    const result = workerRateSchema.safeParse({ userId: "worker-1", hourlyRateCents: 15000 });

    expect(result.success).toBe(true);
  });

  it("rejects zero, negative, and decimal values", () => {
    expect(workerRateSchema.safeParse({ userId: "worker-1", hourlyRateCents: 0 }).success).toBe(false);
    expect(workerRateSchema.safeParse({ userId: "worker-1", hourlyRateCents: -10 }).success).toBe(false);
    expect(workerRateSchema.safeParse({ userId: "worker-1", hourlyRateCents: 10.5 }).success).toBe(false);
  });
});

