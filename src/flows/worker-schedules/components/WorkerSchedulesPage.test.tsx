import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
    <button type="button">
      {applied ? `Application submitted:${scheduleId}` : `Apply now:${scheduleId}`}
    </button>
  ),
}));

describe("WorkerSchedulesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders recruiting cards with readable schedule windows and application state", async () => {
    getCurrentUser.mockResolvedValue({ id: "worker-1", email: "worker@example.com", role: "worker" });
    listRecruitingSchedules.mockResolvedValue([
      {
        id: "schedule-1",
        startsAt: "2026-04-10T09:00:00+09:00",
        endsAt: "2026-04-10T13:00:00+09:00",
        status: "recruiting",
        roleSlotSummary: [
          { roleCode: "Captain", headcount: 2 },
          { roleCode: "Server", headcount: 4 },
        ],
      },
      {
        id: "schedule-2",
        startsAt: "2026-04-11T10:00:00+09:00",
        endsAt: "2026-04-11T14:00:00+09:00",
        status: "recruiting",
        roleSlotSummary: [{ roleCode: "Barback", headcount: 1 }],
      },
    ]);
    listMyScheduleApplicationIds.mockResolvedValue(["schedule-2"]);

    const { WorkerSchedulesPage } = await import("#flows/worker-schedules/components/WorkerSchedulesPage");
    render(await WorkerSchedulesPage());

    expect(listMyScheduleApplicationIds).toHaveBeenCalledWith("worker-1");
    expect(screen.getByRole("heading", { name: "Recruiting schedules" })).toBeInTheDocument();
    expect(screen.getByText("Fri, Apr 10, 9:00 AM to 1:00 PM")).toBeInTheDocument();
    expect(screen.getAllByText("Open roles")).toHaveLength(2);
    expect(screen.getByText("Captain x2, Server x4")).toBeInTheDocument();
    expect(screen.getByText("Apply now:schedule-1")).toBeInTheDocument();
    expect(screen.getByText("Application submitted:schedule-2")).toBeInTheDocument();
  });

  it("shows the recruiting empty state and confirmed-work CTA when no schedules are open", async () => {
    getCurrentUser.mockResolvedValue({ id: "worker-1", email: "worker@example.com", role: "worker" });
    listRecruitingSchedules.mockResolvedValue([]);
    listMyScheduleApplicationIds.mockResolvedValue([]);

    const { WorkerSchedulesPage } = await import("#flows/worker-schedules/components/WorkerSchedulesPage");
    render(await WorkerSchedulesPage());

    expect(screen.getByText("No recruiting schedule is open right now")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Check back later or open confirmed work to review assignments that are already finalized.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review confirmed work" })).toHaveAttribute(
      "href",
      "/worker/assignments",
    );
  });
});
