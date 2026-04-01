import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listAdminOperationsDashboardSchedules = vi.fn();
const requireAdminUser = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("#queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules", () => ({
  listAdminOperationsDashboardSchedules,
}));

vi.mock("#queries/access/dal/requireAdminUser", () => ({
  requireAdminUser,
}));

const dashboardSections = {
  today: [
    {
      scheduleId: "schedule-today-1",
      title: "Morning Service Team",
      dateLabel: "Wed, Apr 1",
      startTimeLabel: "9:00 AM",
      startsAtIso: "2026-04-01T09:00:00+09:00",
      detailHref: "/admin/schedules/schedule-today-1",
      applicantCount: 5,
      totalRoleSlots: 2,
      totalHeadcount: 4,
      confirmedAssignmentCount: 3,
      checkedInCount: 1,
      lateCount: 1,
      missingCheckInCount: 1,
      unfilledSlotCount: 1,
      topAnomaly: {
        kind: "unfilled_slots" as const,
        count: 1,
        label: "Unfilled slots",
      },
    },
    {
      scheduleId: "schedule-today-2",
      title: "Noon Welcome Team",
      dateLabel: "Wed, Apr 1",
      startTimeLabel: "12:00 PM",
      startsAtIso: "2026-04-01T12:00:00+09:00",
      detailHref: "/admin/schedules/schedule-today-2",
      applicantCount: 2,
      totalRoleSlots: 1,
      totalHeadcount: 2,
      confirmedAssignmentCount: 2,
      checkedInCount: 2,
      lateCount: 0,
      missingCheckInCount: 0,
      unfilledSlotCount: 0,
      topAnomaly: {
        kind: "on_track" as const,
        count: 0,
        label: "On track",
      },
    },
  ],
  upcoming: [
    {
      scheduleId: "schedule-upcoming-1",
      title: "Friday Setup Team",
      dateLabel: "Fri, Apr 3",
      startTimeLabel: "8:30 AM",
      startsAtIso: "2026-04-03T08:30:00+09:00",
      detailHref: "/admin/schedules/schedule-upcoming-1",
      applicantCount: 4,
      totalRoleSlots: 2,
      totalHeadcount: 4,
      confirmedAssignmentCount: 4,
      checkedInCount: 0,
      lateCount: 1,
      missingCheckInCount: 0,
      unfilledSlotCount: 0,
      topAnomaly: {
        kind: "late_arrivals" as const,
        count: 1,
        label: "Late arrivals",
      },
    },
  ],
};

describe("Admin operations dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listAdminOperationsDashboardSchedules.mockResolvedValue(dashboardSections);
    requireAdminUser.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
    });
  });

  it("awaits the dashboard query and renders Today before Upcoming", async () => {
    const { AdminOperationsDashboardPage } = await import(
      "#flows/admin-operations-dashboard/components/AdminOperationsDashboardPage"
    );

    render(await AdminOperationsDashboardPage());

    const todayHeading = screen.getByRole("heading", { name: "Today" });
    const upcomingHeading = screen.getByRole("heading", { name: "Upcoming" });

    expect(listAdminOperationsDashboardSchedules).toHaveBeenCalledTimes(1);
    expect(todayHeading.compareDocumentPosition(upcomingHeading)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("renders exact schedule title, date label, and start time label from the card contract", async () => {
    const { AdminOperationsDashboardPage } = await import(
      "#flows/admin-operations-dashboard/components/AdminOperationsDashboardPage"
    );

    render(await AdminOperationsDashboardPage());

    expect(screen.getByText("Morning Service Team")).toBeInTheDocument();
    expect(screen.getAllByText("Wed, Apr 1").length).toBeGreaterThan(0);
    expect(screen.getByText("9:00 AM")).toBeInTheDocument();
  });

  it("shows application, confirmed staffing, and attendance metrics together with the review CTA", async () => {
    const { AdminOperationsDashboardPage } = await import(
      "#flows/admin-operations-dashboard/components/AdminOperationsDashboardPage"
    );

    render(await AdminOperationsDashboardPage());

    expect(screen.getByText("Applicants")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Checked in")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review schedule" })).toHaveAttribute(
      "href",
      "/admin/schedules/schedule-today-1",
    );
  });

  it("renders the top anomaly badge first with the locked labels", async () => {
    const { AdminOperationsDashboardPage } = await import(
      "#flows/admin-operations-dashboard/components/AdminOperationsDashboardPage"
    );

    render(await AdminOperationsDashboardPage());

    const card = screen.getByText("Morning Service Team").closest("article");

    expect(card).not.toBeNull();

    const article = within(card as HTMLElement);
    const labels = article.getAllByText(/Unfilled slots|Missing check-ins|Late arrivals|On track/);

    expect(labels[0]).toHaveTextContent("Unfilled slots");
  });

  it("uses the approved empty state copy when no schedules need attention", async () => {
    listAdminOperationsDashboardSchedules.mockResolvedValue({
      today: [],
      upcoming: [],
    });

    const { AdminOperationsDashboardPage } = await import(
      "#flows/admin-operations-dashboard/components/AdminOperationsDashboardPage"
    );

    render(await AdminOperationsDashboardPage());

    expect(screen.getByText("No schedules need attention right now")).toBeInTheDocument();
  });

  it("keeps admin gating in the thin /admin route", async () => {
    const page = await import("#app/admin/page");

    render(await page.default());

    expect(requireAdminUser).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
  });

  it("shows the admin forbidden copy when access is denied", async () => {
    requireAdminUser.mockRejectedValue(new Error("FORBIDDEN"));

    const page = await import("#app/admin/page");

    render(await page.default());

    expect(screen.getByText("Admin access required.")).toBeInTheDocument();
  });
});
