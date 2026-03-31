export const cacheTags = {
  schedules: {
    all: "schedules",
    adminList: "schedules:admin-list",
    recruitingList: "schedules:recruiting-list",
  },
  applications: {
    all: "applications",
    workerScheduleIds: "applications:worker-schedule-ids",
  },
  assignments: {
    all: "assignments",
    detail: (scheduleId: string) => `assignments:detail:${scheduleId}`,
    workerConfirmed: (workerUserId: string) => `assignments:worker-confirmed:${workerUserId}`,
    workerPayPreview: (workerUserId: string) => `assignments:worker-pay-preview:${workerUserId}`,
  },
} as const;
