import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const getCurrentUser = vi.fn();
const listConfirmedWorkerAssignments = vi.fn();

vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

vi.mock("#queries/assignment/dal/listConfirmedWorkerAssignments", () => ({
  listConfirmedWorkerAssignments,
}));

describe("WorkerAssignmentPreviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders total pay, calculation basis, and confirmed assignments in order", async () => {
    getCurrentUser.mockResolvedValue({ id: "worker-1", email: "worker@example.com", role: "worker" });
    listConfirmedWorkerAssignments.mockResolvedValue([
      {
        assignmentId: "assignment-1",
        scheduleId: "schedule-1",
        scheduleRoleSlotId: "slot-1",
        roleCode: "captain",
        startsAt: "2026-04-10T09:00:00+09:00",
        endsAt: "2026-04-10T20:00:00+09:00",
        hourlyRateCents: 12000,
        regularHours: 9,
        overtimeHours: 2,
        overtimeApplied: true,
        regularPayCents: 108000,
        overtimePayCents: 36000,
        totalPayCents: 144000,
      },
    ]);

    const { WorkerAssignmentPreviewPage } = await import(
      "#flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage"
    );
    render(await WorkerAssignmentPreviewPage());

    const headings = screen.getAllByRole("heading").map((node) => node.textContent);

    expect(listConfirmedWorkerAssignments).toHaveBeenCalledWith("worker-1");
    expect(headings.slice(0, 3)).toEqual([
      "Confirmed work pay preview",
      "Calculation basis",
      "Confirmed assignments",
    ]);
    expect(screen.getByText("144,000 KRW")).toBeInTheDocument();
    expect(screen.getByText("Confirmed assignments: 1")).toBeInTheDocument();
    expect(screen.getByText("Overtime hours: 2")).toBeInTheDocument();
    expect(screen.getByText("Role: captain")).toBeInTheDocument();
    expect(screen.getByText("Overtime applied: Yes")).toBeInTheDocument();
  });

  it("renders an empty state and never shows draft messaging", async () => {
    getCurrentUser.mockResolvedValue({ id: "worker-1", email: "worker@example.com", role: "worker" });
    listConfirmedWorkerAssignments.mockResolvedValue([]);

    const { WorkerAssignmentPreviewPage } = await import(
      "#flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage"
    );
    render(await WorkerAssignmentPreviewPage());

    expect(screen.getByText("No confirmed work yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Confirmed assignments and pay previews will appear here after an admin confirms them.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/draft/i)).not.toBeInTheDocument();
  });
});
