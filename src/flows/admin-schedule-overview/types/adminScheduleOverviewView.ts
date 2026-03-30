import type { ScheduleRequestNotificationView } from "#queries/schedule-request/types/scheduleRequestNotificationView";

export type AdminScheduleOverviewSummaryCardViewModel = {
  id: "totalRequests" | "approvedAssignments" | "pendingResponse" | "acceptedAssignments";
  title: string;
  valueText: string;
  helperText: string;
};

export type AdminScheduleOverviewAlertViewModel = {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
};

export type AdminScheduleOverviewItemViewModel = {
  id: string;
  employeeId: string;
  workDate: string;
  workTimeLabel: string;
  assignmentPositionLabel: string | null;
  assignedLocation: string | null;
  assignedAtLabel: string | null;
  assignedBy: string | null;
  adminComment: string | null;
  responseStatusLabel: string;
  responseTone: "warning" | "success" | "danger";
  employeeResponseComment: string | null;
  employeeRespondedAtLabel: string | null;
  notifications: ScheduleRequestNotificationView[];
};

export type AdminScheduleOverviewViewProps = {
  isLoading: boolean;
  errorMessage: string | null;
  summaryCards: AdminScheduleOverviewSummaryCardViewModel[];
  pendingReviewAlert: AdminScheduleOverviewAlertViewModel | null;
  items: AdminScheduleOverviewItemViewModel[];
};
