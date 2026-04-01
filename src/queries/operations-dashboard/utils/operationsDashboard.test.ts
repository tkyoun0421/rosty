import { describe, expect, it } from "vitest";

import type { OperationsDashboardScheduleCard } from "#queries/operations-dashboard/types/operationsDashboard";
import {
  getOperationsDashboardScheduleDisplay,
  getOperationsDashboardWindow,
  getOperationsDashboardSections,
  getTopOperationsDashboardAnomaly,
} from "#queries/operations-dashboard/utils/operationsDashboard";

function createCard(
  overrides: Partial<OperationsDashboardScheduleCard> = {},
): OperationsDashboardScheduleCard {
  return {
    scheduleId: "schedule-1",
    title: "Morning Ceremony",
    dateLabel: "Tue, Apr 7",
    startTimeLabel: "10:00 AM",
    startsAtIso: "2026-04-07T10:00:00+09:00",
    detailHref: "/admin/schedules/schedule-1",
    applicantCount: 4,
    totalRoleSlots: 3,
    totalHeadcount: 4,
    confirmedAssignmentCount: 4,
    checkedInCount: 3,
    lateCount: 0,
    missingCheckInCount: 1,
    unfilledSlotCount: 0,
    topAnomaly: {
      kind: "missing_check_ins",
      count: 1,
      label: "1 missing check-in",
    },
    ...overrides,
  };
}

describe("operationsDashboard utils", () => {
  it("prioritizes unfilled slots before missing check-ins before late arrivals and falls back to on_track", () => {
    expect(
      getTopOperationsDashboardAnomaly({
        startsAtIso: "2026-04-07T11:00:00+09:00",
        totalHeadcount: 4,
        confirmedAssignmentCount: 2,
        checkedInCount: 2,
        lateCount: 1,
        now: new Date("2026-04-07T09:30:00+09:00"),
      }),
    ).toMatchObject({
      kind: "unfilled_slots",
      count: 2,
    });

    expect(
      getTopOperationsDashboardAnomaly({
        startsAtIso: "2026-04-07T11:00:00+09:00",
        totalHeadcount: 4,
        confirmedAssignmentCount: 4,
        checkedInCount: 2,
        lateCount: 1,
        now: new Date("2026-04-07T09:30:00+09:00"),
      }),
    ).toMatchObject({
      kind: "missing_check_ins",
      count: 2,
    });

    expect(
      getTopOperationsDashboardAnomaly({
        startsAtIso: "2026-04-07T11:00:00+09:00",
        totalHeadcount: 4,
        confirmedAssignmentCount: 4,
        checkedInCount: 4,
        lateCount: 2,
        now: new Date("2026-04-07T09:30:00+09:00"),
      }),
    ).toMatchObject({
      kind: "late_arrivals",
      count: 2,
    });

    expect(
      getTopOperationsDashboardAnomaly({
        startsAtIso: "2026-04-07T11:00:00+09:00",
        totalHeadcount: 4,
        confirmedAssignmentCount: 4,
        checkedInCount: 4,
        lateCount: 0,
        now: new Date("2026-04-07T09:30:00+09:00"),
      }),
    ).toEqual({
      kind: "on_track",
      count: 0,
      label: "On track",
    });
  });

  it("does not emit missing check-ins before the attendance window opens", () => {
    expect(
      getTopOperationsDashboardAnomaly({
        startsAtIso: "2026-04-07T10:00:00+09:00",
        totalHeadcount: 2,
        confirmedAssignmentCount: 2,
        checkedInCount: 0,
        lateCount: 1,
        now: new Date("2026-04-07T08:19:00+09:00"),
      }),
    ).toMatchObject({
      kind: "late_arrivals",
      count: 1,
    });

    expect(
      getTopOperationsDashboardAnomaly({
        startsAtIso: "2026-04-07T10:00:00+09:00",
        totalHeadcount: 2,
        confirmedAssignmentCount: 2,
        checkedInCount: 0,
        lateCount: 1,
        now: new Date("2026-04-07T08:20:00+09:00"),
      }),
    ).toMatchObject({
      kind: "missing_check_ins",
      count: 2,
    });
  });

  it("returns today and nearby upcoming boundaries for the dashboard window", () => {
    expect(getOperationsDashboardWindow(new Date("2026-04-07T14:35:00+09:00"))).toEqual({
      todayStartIso: "2026-04-06T15:00:00.000Z",
      todayEndIso: "2026-04-07T15:00:00.000Z",
      upcomingEndIso: "2026-04-10T15:00:00.000Z",
    });
  });

  it("groups schedule cards into today and upcoming without creating weekly or worker summaries", () => {
    const sections = getOperationsDashboardSections(
      [
        createCard({
          scheduleId: "schedule-today",
          startsAtIso: "2026-04-07T16:00:00+09:00",
        }),
        createCard({
          scheduleId: "schedule-upcoming",
          startsAtIso: "2026-04-08T09:00:00+09:00",
        }),
      ],
      new Date("2026-04-07T14:35:00+09:00"),
    );

    expect(sections.today.map((card) => card.scheduleId)).toEqual(["schedule-today"]);
    expect(sections.upcoming.map((card) => card.scheduleId)).toEqual(["schedule-upcoming"]);
  });

  it("derives render-ready schedule context fields for the card contract", () => {
    expect(
      getOperationsDashboardScheduleDisplay({
        scheduleId: "schedule-1",
        startsAtIso: "2026-04-07T10:00:00+09:00",
      }),
    ).toEqual({
      title: "Schedule schedule-1",
      dateLabel: "Tue, Apr 7",
      startTimeLabel: "10:00 AM",
      startsAtIso: "2026-04-07T10:00:00+09:00",
      detailHref: "/admin/schedules/schedule-1",
    });
  });
});
