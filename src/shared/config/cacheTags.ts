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
  attendance: {
    all: "attendance",
    scheduleDetail: (scheduleId: string) => `attendance:schedule:${scheduleId}`,
    worker: (workerUserId: string) => `attendance:worker:${workerUserId}`,
  },
  profile: {
    onboarding: (userId: string) => `profile:onboarding:${userId}`,
  },
} as const;