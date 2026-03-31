import { describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
const upsertWorkerRateRecord = vi.fn();

vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

vi.mock("#mutations/worker-rate/dal/workerRateDal", () => ({
  upsertWorkerRateRecord,
}));

describe("upsertWorkerRate", () => {
  it("allows admin-only current-value updates", async () => {
    getCurrentUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });

    const { upsertWorkerRate } = await import("#mutations/worker-rate/actions/upsertWorkerRate");
    const result = await upsertWorkerRate({ userId: "worker-1", hourlyRateCents: 20000 });

    expect(upsertWorkerRateRecord).toHaveBeenCalledWith({
      userId: "worker-1",
      hourlyRateCents: 20000,
      updatedBy: "admin-1",
    });
    expect(result).toEqual({ userId: "worker-1", hourlyRateCents: 20000 });
  });
});

