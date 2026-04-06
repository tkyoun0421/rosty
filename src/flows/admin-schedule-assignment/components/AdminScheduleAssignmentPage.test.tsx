import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const notFound = vi.fn();
const requireAdminUser = vi.fn();
const getAdminScheduleAssignmentDetail = vi.fn();
const getAdminScheduleAttendanceDetail = vi.fn();
const submitScheduleAssignmentDraft = vi.fn();
const submitScheduleAssignmentConfirm = vi.fn();

vi.mock("next/navigation", () => ({
  notFound,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("#queries/access/dal/requireAdminUser", () => ({
  requireAdminUser,
}));

vi.mock("#queries/assignment/dal/getAdminScheduleAssignmentDetail", () => ({
  getAdminScheduleAssignmentDetail,
}));

vi.mock("#queries/attendance/dal/getAdminScheduleAttendanceDetail", () => ({
  getAdminScheduleAttendanceDetail,
}));

vi.mock("#mutations/assignment/actions/submitScheduleAssignmentDraft", () => ({
  submitScheduleAssignmentDraft,
}));

vi.mock("#mutations/assignment/actions/submitScheduleAssignmentConfirm", () => ({
  submitScheduleAssignmentConfirm,
}));

vi.mock("#flows/admin-schedules/components/ScheduleStatusForm", () => ({
  ScheduleStatusForm: () => <span>status-form</span>,
}));

const assignmentDetail = {
  schedule: {
    id: "schedule-1",
    startsAt: "2026-04-10T09:00:00+09:00",
    endsAt: "2026-04-10T18:00:00+09:00",
    status: "assigning" as const,
  },
  roleSlots: [
    {
      id: "slot-1",
      roleCode: "captain",
      headcount: 1,
      assignedCount: 0,
    },
    {
      id: "slot-2",
      roleCode: "service",
      headcount: 1,
      assignedCount: 0,
    },
  ],
  applicants: [
    {
      workerUserId: "worker-1",
      workerName: "Kim Hana",
      appliedAt: "2026-04-01T10:00:00+09:00",
      assignmentStatus: "unassigned" as const,
      assignedRoleSlotId: null,
      assignedRoleCode: null,
    },
    {
      workerUserId: "worker-2",
      workerName: "Lee Min",
      appliedAt: "2026-04-01T10:05:00+09:00",
      assignmentStatus: "unassigned" as const,
      assignedRoleSlotId: null,
      assignedRoleCode: null,
    },
  ],
};

const attendanceDetail = {
  schedule: {
    id: "schedule-1",
    startsAt: "2026-04-10T09:00:00+09:00",
    endsAt: "2026-04-10T18:00:00+09:00",
    opensAt: "2026-04-10T07:10:00+09:00",
  },
  summary: {
    confirmedWorkerCount: 4,
    checkedInCount: 1,
    lateCount: 1,
    notCheckedInCount: 1,
    notOpenYetCount: 1,
  },
  workers: [
    {
      scheduleAssignmentId: "assignment-1",
      workerUserId: "worker-1",
      workerName: "Kim Hana",
      roleSlotId: "slot-1",
      roleCode: "captain",
      status: "checked_in" as const,
      checkedInAt: "2026-04-10T08:20:00+09:00",
      isLate: false,
    },
    {
      scheduleAssignmentId: "assignment-2",
      workerUserId: "worker-2",
      workerName: "Lee Min",
      roleSlotId: "slot-2",
      roleCode: "service",
      status: "late" as const,
      checkedInAt: "2026-04-10T09:05:00+09:00",
      isLate: true,
    },
    {
      scheduleAssignmentId: "assignment-3",
      workerUserId: "worker-3",
      workerName: "Park Jun",
      roleSlotId: "slot-3",
      roleCode: "setup",
      status: "not_checked_in" as const,
      checkedInAt: null,
      isLate: false,
    },
    {
      scheduleAssignmentId: "assignment-4",
      workerUserId: "worker-4",
      workerName: "Choi Ara",
      roleSlotId: "slot-4",
      roleCode: "guide",
      status: "not_open_yet" as const,
      checkedInAt: null,
      isLate: false,
    },
  ],
};

describe("AdminScheduleAssignmentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminUser.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
    });
    getAdminScheduleAssignmentDetail.mockResolvedValue(assignmentDetail);
    getAdminScheduleAttendanceDetail.mockResolvedValue(attendanceDetail);
    submitScheduleAssignmentDraft.mockResolvedValue(undefined);
    submitScheduleAssignmentConfirm.mockResolvedValue(undefined);
  });

  it("renders attendance review before applicant controls inside the existing schedule detail flow", async () => {
    const { AdminScheduleAssignmentPage } =
      await import("#flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage");

    render(await AdminScheduleAssignmentPage({ scheduleId: "schedule-1" }));

    expect(screen.getByRole("heading", { name: "Schedule assignment detail" })).toBeInTheDocument();
    expect(screen.getByText("Schedule detail")).toBeInTheDocument();
    expect(screen.getByText("Current status")).toBeInTheDocument();
    expect(screen.getByText("Assigning")).toBeInTheDocument();
    const attendance = screen.getByRole("heading", { name: "Attendance review" });
    const applicants = screen.getByRole("heading", { name: "Applicant assignment controls" });
    const actions = screen.getByRole("heading", { name: "Assignment actions" });

    expect(attendance.compareDocumentPosition(applicants)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(applicants.compareDocumentPosition(actions)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(getAdminScheduleAssignmentDetail).toHaveBeenCalledWith("schedule-1");
    expect(getAdminScheduleAttendanceDetail).toHaveBeenCalledWith("schedule-1");
    expect(screen.getAllByText("Checked in").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Late").length).toBeGreaterThan(0);
  });

  it("shows the approved admin attendance status labels", async () => {
    const { AdminScheduleAssignmentPage } =
      await import("#flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage");

    render(await AdminScheduleAssignmentPage({ scheduleId: "schedule-1" }));

    expect(screen.getAllByText("Checked in").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Late").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Not checked in").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Not open yet").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Kim Hana").length).toBeGreaterThan(0);
    expect(screen.getAllByText("captain").length).toBeGreaterThan(0);
  });

  it("saves a draft in place and shows inline feedback without leaving the page", async () => {
    const { AdminScheduleAssignmentPage } =
      await import("#flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage");

    render(await AdminScheduleAssignmentPage({ scheduleId: "schedule-1" }));

    fireEvent.change(screen.getByLabelText("Kim Hana role slot"), {
      target: { value: "slot-1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() => expect(submitScheduleAssignmentDraft).toHaveBeenCalledTimes(1));

    const formData = submitScheduleAssignmentDraft.mock.calls[0][0] as FormData;

    expect(formData.get("scheduleId")).toBe("schedule-1");
    expect(formData.get("assignments")).toBe(
      JSON.stringify([{ scheduleRoleSlotId: "slot-1", workerUserId: "worker-1" }]),
    );
    expect(
      screen.getByText("Draft saved. You can keep reviewing assignments on this page."),
    ).toBeInTheDocument();
    expect(screen.getByText("Status: Draft saved")).toBeInTheDocument();
  });

  it("opens a separate confirm dialog and submits the dedicated confirm action", async () => {
    const { AdminScheduleAssignmentPage } =
      await import("#flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage");

    render(await AdminScheduleAssignmentPage({ scheduleId: "schedule-1" }));

    fireEvent.change(screen.getByLabelText("Kim Hana role slot"), {
      target: { value: "slot-1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm assignments" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText("Confirming now will publish roles and pay previews to workers. Continue?"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Confirm assignments" })[1]);

    await waitFor(() => expect(submitScheduleAssignmentConfirm).toHaveBeenCalledTimes(1));

    const formData = submitScheduleAssignmentConfirm.mock.calls[0][0] as FormData;

    expect(formData.get("scheduleId")).toBe("schedule-1");
    expect(
      screen.getByText("Assignments confirmed. Workers can now see final roles and pay previews."),
    ).toBeInTheDocument();
    expect(screen.getByText("Status: Confirmed")).toBeInTheDocument();
  });

  it("exposes a schedule-detail link from the admin schedule list", async () => {
    const { ScheduleTable } = await import("#flows/admin-schedules/components/ScheduleTable");

    render(
      <ScheduleTable
        schedules={[
          {
            id: "schedule-1",
            startsAt: "2026-04-10T09:00:00+09:00",
            endsAt: "2026-04-10T18:00:00+09:00",
            status: "assigning",
            roleSlotSummary: [{ roleCode: "captain", headcount: 1 }],
          },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Open assignment detail" })).toHaveAttribute(
      "href",
      "/admin/schedules/schedule-1",
    );
  });
});
