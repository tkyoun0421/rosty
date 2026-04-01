export type OperationsDashboardSectionKey = "today" | "upcoming";

export type OperationsDashboardAnomaly =
  | {
      kind: "unfilled_slots";
      count: number;
      label: string;
    }
  | {
      kind: "missing_check_ins";
      count: number;
      label: string;
    }
  | {
      kind: "late_arrivals";
      count: number;
      label: string;
    }
  | {
      kind: "on_track";
      count: 0;
      label: "On track";
    };

export interface OperationsDashboardScheduleCard {
  scheduleId: string;
  title: string;
  dateLabel: string;
  startTimeLabel: string;
  startsAtIso: string;
  detailHref: string;
  applicantCount: number;
  totalRoleSlots: number;
  totalHeadcount: number;
  confirmedAssignmentCount: number;
  checkedInCount: number;
  lateCount: number;
  missingCheckInCount: number;
  unfilledSlotCount: number;
  topAnomaly: OperationsDashboardAnomaly;
}

export interface OperationsDashboardSections {
  today: OperationsDashboardScheduleCard[];
  upcoming: OperationsDashboardScheduleCard[];
}
