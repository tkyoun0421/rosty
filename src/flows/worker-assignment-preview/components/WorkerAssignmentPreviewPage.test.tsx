import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
const listConfirmedWorkerAssignments = vi.fn();
const listWorkerAttendanceStatuses = vi.fn();
const submitAttendanceCheckIn = vi.fn();

vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

vi.mock("#queries/assignment/dal/listConfirmedWorkerAssignments", () => ({
  listConfirmedWorkerAssignments,
}));

vi.mock("#queries/attendance/dal/listWorkerAttendanceStatuses", () => ({
  listWorkerAttendanceStatuses,
}));

vi.mock("#mutations/attendance/actions/submitAttendanceCheckIn", () => ({
  submitAttendanceCheckIn,
}));

function setSecureContext(value: boolean) {
  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    value,
  });
}

function installGeolocationSuccess() {
  Object.defineProperty(globalThis.navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (success: (position: GeolocationPosition) => void) => {
        success({
          coords: {
            latitude: 37.5001,
            longitude: 127.0301,
            accuracy: 12,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON: () => ({}),
          },
          timestamp: Date.now(),
          toJSON: () => ({}),
        } as GeolocationPosition);
      },
    },
  });
}

function installGeolocationError(code: number) {
  Object.defineProperty(globalThis.navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (
        _success: PositionCallback,
        error?: PositionErrorCallback | null,
      ) => {
        error?.({
          code,
          message: "mocked geolocation error",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError);
      },
    },
  });
}

function mockWorkerAssignmentPage(options?: {
  attendanceStatus?: {
    assignmentId: string;
    scheduleId: string;
    checkInOpensAt: string;
    windowStatus: "not_open_yet" | "open" | "submitted";
    submissionStatus: "not_submitted" | "submitted";
    checkedInAt: string | null;
    isLate: boolean | null;
  };
}) {
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
  listWorkerAttendanceStatuses.mockResolvedValue([
    options?.attendanceStatus ?? {
      assignmentId: "assignment-1",
      scheduleId: "schedule-1",
      checkInOpensAt: "2026-04-10T00:20:00.000Z",
      windowStatus: "open",
      submissionStatus: "not_submitted",
      checkedInAt: null,
      isLate: null,
    },
  ]);
}

describe("WorkerAssignmentPreviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSecureContext(true);
    installGeolocationSuccess();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("renders check-in status first, then calculation basis and confirmed assignments", async () => {
    mockWorkerAssignmentPage();

    const { WorkerAssignmentPreviewPage } = await import(
      "#flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage"
    );
    render(await WorkerAssignmentPreviewPage());

    expect(listConfirmedWorkerAssignments).toHaveBeenCalledWith("worker-1");
    expect(listWorkerAttendanceStatuses).toHaveBeenCalledWith("worker-1");
    expect(screen.getByRole("heading", { name: "Check-in status" })).toBeInTheDocument();
    expect(screen.getAllByText("144,000 KRW").length).toBeGreaterThan(0);
    expect(screen.getByText("Confirmed assignments")).toBeInTheDocument();
    expect(screen.getByText("Expected total")).toBeInTheDocument();
    expect(screen.getByText("Role assignment: captain")).toBeInTheDocument();
    expect(screen.getAllByText("Check-in open").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Check in now" })).toBeEnabled();
  });

  it("renders the ui-spec empty state copy when there is no confirmed shift ready", async () => {
    getCurrentUser.mockResolvedValue({ id: "worker-1", email: "worker@example.com", role: "worker" });
    listConfirmedWorkerAssignments.mockResolvedValue([]);
    listWorkerAttendanceStatuses.mockResolvedValue([]);

    const { WorkerAssignmentPreviewPage } = await import(
      "#flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage"
    );
    render(await WorkerAssignmentPreviewPage());

    expect(screen.getByText("No confirmed shift ready for check-in")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your confirmed assignment will appear here when check-in opens. If you already have a shift, wait for the check-in window or contact an admin.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the recorded state and disables resubmission when attendance is already submitted", async () => {
    mockWorkerAssignmentPage({
      attendanceStatus: {
        assignmentId: "assignment-1",
        scheduleId: "schedule-1",
        checkInOpensAt: "2026-04-10T00:20:00.000Z",
        windowStatus: "submitted",
        submissionStatus: "submitted",
        checkedInAt: "2026-04-10T00:32:00.000Z",
        isLate: false,
      },
    });

    const { WorkerAssignmentPreviewPage } = await import(
      "#flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage"
    );
    render(await WorkerAssignmentPreviewPage());

    expect(screen.getByText("Check-in recorded")).toBeInTheDocument();
    expect(screen.getByText(/Attendance submitted/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check in now" })).toBeDisabled();
  });

  it("shows blocked help when the page is not in a secure context", async () => {
    mockWorkerAssignmentPage();
    setSecureContext(false);

    const { WorkerAssignmentPreviewPage } = await import(
      "#flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage"
    );
    render(await WorkerAssignmentPreviewPage());

    expect(screen.getByRole("button", { name: "Check in now" })).toBeDisabled();
    expect(screen.getByText(/secure connection/i)).toBeInTheDocument();
  });

  it("shows denied-permission helper copy after geolocation rejection", async () => {
    mockWorkerAssignmentPage();
    installGeolocationError(1);

    const { WorkerAssignmentPreviewPage } = await import(
      "#flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage"
    );
    render(await WorkerAssignmentPreviewPage());

    fireEvent.click(screen.getByRole("button", { name: "Check in now" }));

    await waitFor(() => {
      expect(screen.getByText(/Location access was denied/i)).toBeInTheDocument();
    });
    expect(submitAttendanceCheckIn).not.toHaveBeenCalled();
  });

  it("submits one geolocation check-in and updates the card to the recorded state", async () => {
    mockWorkerAssignmentPage();
    submitAttendanceCheckIn.mockResolvedValue({
      status: "success",
      attendance: {
        id: "attendance-1",
        scheduleAssignmentId: "assignment-1",
        scheduleId: "schedule-1",
        workerUserId: "worker-1",
        checkedInAt: "2026-04-10T00:30:00.000Z",
        submittedLatitude: 37.5001,
        submittedLongitude: 127.0301,
        accuracyMeters: 12,
        distanceMeters: 15,
        allowedRadiusMeters: 120,
        withinAllowedRadius: true,
        isLate: false,
        createdAt: "2026-04-10T00:30:00.000Z",
      },
    });

    const { WorkerAssignmentPreviewPage } = await import(
      "#flows/worker-assignment-preview/components/WorkerAssignmentPreviewPage"
    );
    render(await WorkerAssignmentPreviewPage());

    fireEvent.click(screen.getByRole("button", { name: "Check in now" }));

    await waitFor(() => {
      expect(submitAttendanceCheckIn).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByText("Check-in recorded")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Check in now" })).toBeDisabled();
  });
});