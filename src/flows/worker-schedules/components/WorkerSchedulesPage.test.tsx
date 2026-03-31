import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const getCurrentUser = vi.fn();
const listRecruitingSchedules = vi.fn();
const listMyScheduleApplicationIds = vi.fn();

vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

vi.mock("#queries/schedule/dal/listRecruitingSchedules", () => ({
  listRecruitingSchedules,
}));

vi.mock("#queries/application/dal/listMyScheduleApplicationIds", () => ({
  listMyScheduleApplicationIds,
}));

vi.mock("#mutations/application/components/ApplyToScheduleButton", () => ({
  ApplyToScheduleButton: ({ scheduleId, applied }: { scheduleId: string; applied: boolean }) => (
    <span>{applied ? `applied:${scheduleId}` : `apply:${scheduleId}`}</span>
  ),
}));

describe("WorkerSchedulesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a lightweight recruiting schedule list for worker users", async () => {
    getCurrentUser.mockResolvedValue({ id: "worker-1", email: "worker@example.com", role: "worker" });
    listRecruitingSchedules.mockResolvedValue([
      {
        id: "schedule-1",
        startsAt: "2026-04-10T09:00:00+09:00",
        endsAt: "2026-04-10T13:00:00+09:00",
        status: "recruiting",
      },
    ]);
    listMyScheduleApplicationIds.mockResolvedValue([]);

    const { WorkerSchedulesPage } = await import("#flows/worker-schedules/components/WorkerSchedulesPage");
    render(await WorkerSchedulesPage());

    expect(listMyScheduleApplicationIds).toHaveBeenCalledWith("worker-1");
    expect(screen.getByRole("heading", { name: "모집 중인 스케줄" })).toBeInTheDocument();
    expect(screen.getByText("2026-04-10")).toBeInTheDocument();
    expect(screen.getByText("09:00 - 13:00")).toBeInTheDocument();
    expect(screen.getByText("모집 중")).toBeInTheDocument();
    expect(screen.getByText("apply:schedule-1")).toBeInTheDocument();
  });

  it("shows applied state for schedules the current worker already submitted", async () => {
    getCurrentUser.mockResolvedValue({ id: "worker-1", email: "worker@example.com", role: "worker" });
    listRecruitingSchedules.mockResolvedValue([
      {
        id: "schedule-1",
        startsAt: "2026-04-10T09:00:00+09:00",
        endsAt: "2026-04-10T13:00:00+09:00",
        status: "recruiting",
      },
    ]);
    listMyScheduleApplicationIds.mockResolvedValue(["schedule-1"]);

    const { WorkerSchedulesPage } = await import("#flows/worker-schedules/components/WorkerSchedulesPage");
    render(await WorkerSchedulesPage());

    expect(screen.getByText("applied:schedule-1")).toBeInTheDocument();
  });
});