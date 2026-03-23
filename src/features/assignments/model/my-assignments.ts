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

export type MyAssignmentsTab = 'upcoming' | 'past';
export type MyAssignmentsStatusChip = 'all' | MyAssignmentStatus;
export type MyAssignmentsSortChip = 'event_date' | 'status';

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

function compareScheduleDateForTab(
  tab: MyAssignmentsTab,
  left: MyAssignmentSchedule,
  right: MyAssignmentSchedule,
): number {
  return tab === 'upcoming'
    ? compareDateOnly(left.eventDate, right.eventDate)
    : compareDateOnly(right.eventDate, left.eventDate);
}

function compareAssignmentSchedules(
  tab: MyAssignmentsTab,
  sort: MyAssignmentsSortChip,
  left: MyAssignmentSchedule,
  right: MyAssignmentSchedule,
): number {
  if (sort === 'status') {
    const statusDiff = statusPriority[right.status] - statusPriority[left.status];

    if (statusDiff !== 0) {
      return statusDiff;
    }
  }

  const dateDiff = compareScheduleDateForTab(tab, left, right);

  if (dateDiff !== 0) {
    return dateDiff;
  }

  return left.title.localeCompare(right.title);
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

export function filterMyAssignmentSchedules(input: {
  snapshot: MyAssignmentsSnapshot;
  tab: MyAssignmentsTab;
  status: MyAssignmentsStatusChip;
  query?: string;
  sort?: MyAssignmentsSortChip;
}): MyAssignmentSchedule[] {
  const schedules =
    input.tab === 'upcoming' ? input.snapshot.upcoming : input.snapshot.past;
  const normalizedQuery = input.query?.trim().toLowerCase() ?? '';

  return schedules
    .filter((schedule) => {
      const statusMatch =
        input.status === 'all' ? true : schedule.status === input.status;
      const queryMatch =
        normalizedQuery.length === 0
          ? true
          : `${schedule.title} ${schedule.eventDate} ${schedule.positions.join(' ')} ${formatAssignmentStatus(schedule.status)}`
              .toLowerCase()
              .includes(normalizedQuery);

      return statusMatch && queryMatch;
    })
    .sort((left, right) =>
      compareAssignmentSchedules(
        input.tab,
        input.sort ?? 'event_date',
        left,
        right,
      ),
    );
}
