import type {
  OperationsDashboardAnomaly,
  OperationsDashboardScheduleCard,
  OperationsDashboardSections,
} from "#queries/operations-dashboard/types/operationsDashboard";

const DASHBOARD_TIME_ZONE = "Asia/Seoul";
const TEN_AM_START_HOUR = 10;
const FIXED_TEN_AM_LEAD_MINUTES = 100;
const LATER_START_LEAD_MINUTES = 110;
const UPCOMING_WINDOW_DAYS = 3;

const dashboardDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: DASHBOARD_TIME_ZONE,
});

const dashboardTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: DASHBOARD_TIME_ZONE,
});

function getDayParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: DASHBOARD_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function getTimeParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: DASHBOARD_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);

  return {
    hour: Number(parts.find((part) => part.type === "hour")?.value),
    minute: Number(parts.find((part) => part.type === "minute")?.value),
  };
}

function formatPluralLabel(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

function getScheduleOpenTime(startsAtIso: string) {
  const startsAt = new Date(startsAtIso);
  const startsAtMs = startsAt.getTime();

  if (Number.isNaN(startsAtMs)) {
    throw new Error("INVALID_SCHEDULE_START");
  }

  const { hour } = getTimeParts(startsAt);
  const leadMinutes =
    hour === TEN_AM_START_HOUR ? FIXED_TEN_AM_LEAD_MINUTES : LATER_START_LEAD_MINUTES;

  return new Date(startsAtMs - leadMinutes * 60 * 1000);
}

function getSectionKeyForSchedule(
  startsAtIso: string,
  window: ReturnType<typeof getOperationsDashboardWindow>,
) {
  const startsAtMs = new Date(startsAtIso).getTime();

  if (Number.isNaN(startsAtMs)) {
    throw new Error("INVALID_SCHEDULE_START");
  }

  if (
    startsAtMs >= Date.parse(window.todayStartIso) &&
    startsAtMs < Date.parse(window.todayEndIso)
  ) {
    return "today" as const;
  }

  if (
    startsAtMs >= Date.parse(window.todayEndIso) &&
    startsAtMs < Date.parse(window.upcomingEndIso)
  ) {
    return "upcoming" as const;
  }

  return null;
}

export function getOperationsDashboardWindow(now: Date) {
  const { year, month, day } = getDayParts(now);
  const todayStartUtc = new Date(Date.UTC(year, month - 1, day, -9, 0, 0, 0));
  const todayEndUtc = new Date(todayStartUtc.getTime() + 24 * 60 * 60 * 1000);
  const upcomingEndUtc = new Date(
    todayEndUtc.getTime() + UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );

  return {
    todayStartIso: todayStartUtc.toISOString(),
    todayEndIso: todayEndUtc.toISOString(),
    upcomingEndIso: upcomingEndUtc.toISOString(),
  };
}

export function getTopOperationsDashboardAnomaly(input: {
  startsAtIso: string;
  totalHeadcount: number;
  confirmedAssignmentCount: number;
  checkedInCount: number;
  lateCount: number;
  now: Date;
}): OperationsDashboardAnomaly {
  const unfilledSlotCount = Math.max(input.totalHeadcount - input.confirmedAssignmentCount, 0);

  if (unfilledSlotCount > 0) {
    return {
      kind: "unfilled_slots",
      count: unfilledSlotCount,
      label: formatPluralLabel(unfilledSlotCount, "unfilled slot"),
    };
  }

  const opensAt = getScheduleOpenTime(input.startsAtIso);

  if (input.now.getTime() >= opensAt.getTime()) {
    const missingCheckInCount = Math.max(input.confirmedAssignmentCount - input.checkedInCount - input.lateCount, 0);

    if (missingCheckInCount > 0) {
      return {
        kind: "missing_check_ins",
        count: missingCheckInCount,
        label: formatPluralLabel(missingCheckInCount, "missing check-in"),
      };
    }
  }

  if (input.lateCount > 0) {
    return {
      kind: "late_arrivals",
      count: input.lateCount,
      label: formatPluralLabel(input.lateCount, "late arrival"),
    };
  }

  return {
    kind: "on_track",
    count: 0,
    label: "On track",
  };
}

export function getOperationsDashboardSections(
  cards: OperationsDashboardScheduleCard[],
  now: Date,
): OperationsDashboardSections {
  const window = getOperationsDashboardWindow(now);

  return cards.reduce<OperationsDashboardSections>(
    (sections, card) => {
      const sectionKey = getSectionKeyForSchedule(card.startsAtIso, window);

      if (!sectionKey) {
        return sections;
      }

      sections[sectionKey].push(card);
      return sections;
    },
    {
      today: [],
      upcoming: [],
    },
  );
}

export function getOperationsDashboardScheduleDisplay(input: {
  scheduleId: string;
  startsAtIso: string;
  title?: string;
}) {
  const startsAt = new Date(input.startsAtIso);

  if (Number.isNaN(startsAt.getTime())) {
    throw new Error("INVALID_SCHEDULE_START");
  }

  return {
    title: input.title ?? `Schedule ${input.scheduleId}`,
    dateLabel: dashboardDateFormatter.format(startsAt),
    startTimeLabel: dashboardTimeFormatter.format(startsAt),
    startsAtIso: input.startsAtIso,
    detailHref: `/admin/schedules/${input.scheduleId}`,
  };
}