import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listAdminSchedules = vi.fn();
const requireAdminUser = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("#queries/schedule/dal/listAdminSchedules", () => ({
  listAdminSchedules,
}));

vi.mock("#queries/access/dal/requireAdminUser", () => ({
  requireAdminUser,
}));

vi.mock("#mutations/schedule/actions/submitSchedule", () => ({
  submitSchedule: vi.fn(),
}));

vi.mock("#mutations/schedule/actions/submitScheduleStatus", () => ({
  submitScheduleStatus: vi.fn(),
}));

describe("AdminSchedulesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminUser.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
    });
    listAdminSchedules.mockResolvedValue([
      {
        id: "schedule-1",
        startsAt: "2026-04-01T09:00:00+09:00",
        endsAt: "2026-04-01T13:00:00+09:00",
        status: "recruiting",
        roleSlotSummary: [
          { roleCode: "captain", headcount: 2 },
          { roleCode: "server", headcount: 4 },
        ],
      },
      {
        id: "schedule-2",
        startsAt: "2026-04-02T18:00:00+09:00",
        endsAt: "2026-04-02T21:00:00+09:00",
        status: "confirmed",
        roleSlotSummary: [{ roleCode: "host", headcount: 3 }],
      },
    ]);
  });

  it("renders the admin schedule workspace and saved schedule details", async () => {
    const { AdminSchedulesPage } = await import(
      "#flows/admin-schedules/components/AdminSchedulesPage"
    );

    render(await AdminSchedulesPage());

    expect(listAdminSchedules).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Schedule management" })).toBeInTheDocument();
    expect(screen.getByText("Recruiting")).toBeInTheDocument();
    expect(screen.getByText("captain x2, server x4")).toBeInTheDocument();
    const recruitingCard = screen.getByText("captain x2, server x4").closest("article");

    expect(recruitingCard).not.toBeNull();
    expect(
      within(recruitingCard as HTMLElement).getByRole("link", { name: "Open assignment detail" }),
    ).toHaveAttribute("href", "/admin/schedules/schedule-1");

    const confirmedCard = screen.getByText("Confirmed").closest("article");

    expect(confirmedCard).not.toBeNull();
    expect(
      within(confirmedCard as HTMLElement).queryByRole("button", { name: "Update status" }),
    ).not.toBeInTheDocument();
  });

  it("renders the approved empty state copy when there are no saved schedules", async () => {
    listAdminSchedules.mockResolvedValue([]);

    const { AdminSchedulesPage } = await import(
      "#flows/admin-schedules/components/AdminSchedulesPage"
    );

    render(await AdminSchedulesPage());

    expect(screen.getByText("No schedules created yet.")).toBeInTheDocument();
  });

  it("shows the admin denial card when schedule management is blocked", async () => {
    requireAdminUser.mockRejectedValue(new Error("FORBIDDEN"));

    const { AdminSchedulesPage } = await import(
      "#flows/admin-schedules/components/AdminSchedulesPage"
    );

    render(await AdminSchedulesPage());

    expect(screen.getByRole("heading", { name: "Admin access is required." })).toBeInTheDocument();
  });
});
