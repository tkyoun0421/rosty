import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const getCurrentUser = vi.fn();
const listWorkerRates = vi.fn();

vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

vi.mock("#queries/worker-rate/dal/listWorkerRates", () => ({
  listWorkerRates,
}));

describe("AdminWorkerRatesPage", () => {
  it("shows current worker rates to admins", async () => {
    getCurrentUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });
    listWorkerRates.mockResolvedValue([
      {
        userId: "worker-1",
        hourlyRateCents: 18000,
        updatedBy: "admin-1",
        updatedAt: "2026-03-31T00:00:00.000Z",
      },
    ]);

    const { AdminWorkerRatesPage } = await import("#flows/admin-worker-rates/components/AdminWorkerRatesPage");
    render(await AdminWorkerRatesPage());

    expect(screen.getByText("근무자 시급 관리")).toBeInTheDocument();
    expect(screen.getByText("18000")).toBeInTheDocument();
    expect(screen.queryByText("이력")).not.toBeInTheDocument();
  });
});

