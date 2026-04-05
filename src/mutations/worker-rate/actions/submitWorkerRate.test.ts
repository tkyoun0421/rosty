import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
const upsertWorkerRate = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag,
}));

vi.mock("#mutations/worker-rate/actions/upsertWorkerRate", () => ({
  upsertWorkerRate,
}));

function createFormData() {
  const formData = new FormData();
  formData.set("userId", "worker-1");
  formData.set("hourlyRateCents", "20000");
  return formData;
}

describe("submitWorkerRate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes the parsed payload to the rate write and revalidates only the affected worker pay-preview tag", async () => {
    upsertWorkerRate.mockResolvedValue({
      userId: "worker-1",
      hourlyRateCents: 20000,
    });

    const { submitWorkerRate } = await import("#mutations/worker-rate/actions/submitWorkerRate");

    await submitWorkerRate(createFormData());

    expect(upsertWorkerRate).toHaveBeenCalledWith({
      userId: "worker-1",
      hourlyRateCents: 20000,
    });
    expect(revalidateTag).toHaveBeenCalledTimes(1);
    expect(revalidateTag).toHaveBeenCalledWith("assignments:worker-pay-preview:worker-1", "max");
  });

  it("rethrows FORBIDDEN failures without revalidating tags", async () => {
    upsertWorkerRate.mockRejectedValue(new Error("FORBIDDEN"));

    const { submitWorkerRate } = await import("#mutations/worker-rate/actions/submitWorkerRate");

    await expect(submitWorkerRate(createFormData())).rejects.toThrow("FORBIDDEN");
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
