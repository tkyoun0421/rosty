export type MyAssignmentStatus =
  | 'confirmed'
  | 'cancel_requested'
  | 'cancelled'
  | 'completed';

export type MyAssignmentSource = {
  assignments: {
    id: string;
    scheduleId: string;
    slotId: string;
    status: MyAssignmentStatus;
  }[];
  schedules: {
    id: string;
    eventDate: string;
    memo: string | null;
    packageCount: number;
  }[];
  slots: {
    id: string;
    positionName: string;
  }[];
};

export type MyAssignmentSchedule = {
  scheduleId: string;
  title: string;
  eventDate: string;
  positions: string[];
  assignmentIds: string[];
  status: MyAssignmentStatus;
};

export type MyAssignmentsSnapshot = {
  upcoming: MyAssignmentSchedule[];
  past: MyAssignmentSchedule[];
};

const statusPriority: Record<MyAssignmentStatus, number> = {
  cancel_requested: 4,
  confirmed: 3,
  completed: 2,
  cancelled: 1,
};

function buildScheduleTitle(schedule: {
  eventDate: string;
  memo: string | null;
  packageCount: number;
}): string {
  const packageLabel = `${schedule.packageCount} packages`;

  return schedule.memo && schedule.memo.trim().length > 0
    ? `${schedule.eventDate} · ${schedule.memo.trim()}`
    : `${schedule.eventDate} · ${packageLabel}`;
}

function resolveScheduleStatus(statuses: MyAssignmentStatus[]): MyAssignmentStatus {
  return [...statuses].sort(
    (left, right) => statusPriority[right] - statusPriority[left],
  )[0]!;
}

function compareDateOnly(left: string, right: string): number {
  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
}

export function createMyAssignmentsSnapshot(
  source: MyAssignmentSource,
  today: string,
): MyAssignmentsSnapshot {
  const schedulesById = new Map(
    source.schedules.map((schedule) => [schedule.id, schedule]),
  );
  const slotsById = new Map(source.slots.map((slot) => [slot.id, slot]));
  const grouped = new Map<string, MyAssignmentSchedule>();

  for (const assignment of source.assignments) {
    const schedule = schedulesById.get(assignment.scheduleId);
    const slot = slotsById.get(assignment.slotId);

    if (!schedule || !slot) {
      continue;
    }

    const existing = grouped.get(assignment.scheduleId);

    if (!existing) {
      grouped.set(assignment.scheduleId, {
        scheduleId: assignment.scheduleId,
        title: buildScheduleTitle(schedule),
        eventDate: schedule.eventDate,
        positions: [slot.positionName],
        assignmentIds: [assignment.id],
        status: assignment.status,
      });
      continue;
    }

    if (!existing.positions.includes(slot.positionName)) {
      existing.positions.push(slot.positionName);
      existing.positions.sort((left, right) => left.localeCompare(right));
    }

    existing.assignmentIds.push(assignment.id);
    existing.status = resolveScheduleStatus([existing.status, assignment.status]);
  }

  const groupedSchedules = [...grouped.values()];

  const upcoming = groupedSchedules
    .filter((schedule) => compareDateOnly(schedule.eventDate, today) >= 0)
    .sort((left, right) => compareDateOnly(left.eventDate, right.eventDate));

  const past = groupedSchedules
    .filter((schedule) => compareDateOnly(schedule.eventDate, today) < 0)
    .sort((left, right) => compareDateOnly(right.eventDate, left.eventDate));

  return {
    upcoming,
    past,
  };
}

export function formatAssignmentStatus(status: MyAssignmentStatus): string {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'cancel_requested':
      return 'Cancel requested';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
  }
}
