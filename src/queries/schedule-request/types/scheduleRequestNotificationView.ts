export type ScheduleRequestNotificationTone = "neutral" | "success" | "warning" | "danger";

export type ScheduleRequestNotificationView = {
  id: string;
  tone: ScheduleRequestNotificationTone;
  title: string;
  description: string;
  createdAtLabel: string;
};
