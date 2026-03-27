export const queryKeys = {
  work: {
    all: () => ["work"] as const,
    current: () => [...queryKeys.work.all(), "current"] as const,
  },
  scheduleRequests: {
    all: () => ["schedule-requests"] as const,
    list: () => [...queryKeys.scheduleRequests.all(), "list"] as const,
    employeeList: () => [...queryKeys.scheduleRequests.list(), "employee"] as const,
    adminList: () => [...queryKeys.scheduleRequests.list(), "admin"] as const,
  },
} as const;
