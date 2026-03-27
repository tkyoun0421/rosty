export const queryKeys = {
  scheduleRequests: {
    all: () => ["schedule-requests"] as const,
    list: () => [...queryKeys.scheduleRequests.all(), "list"] as const,
    employeeList: () => [...queryKeys.scheduleRequests.list(), "employee"] as const,
  },
} as const;