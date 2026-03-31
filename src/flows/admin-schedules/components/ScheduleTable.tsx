import type { AdminScheduleListItem } from "#queries/schedule/types/scheduleList";

import {
  formatRoleSlotSummary,
  formatScheduleDateTime,
  scheduleStatusLabels,
} from "#flows/admin-schedules/utils/formatSchedule";
import { ScheduleStatusForm } from "#flows/admin-schedules/components/ScheduleStatusForm";

interface ScheduleTableProps {
  schedules: AdminScheduleListItem[];
}

export function ScheduleTable({ schedules }: ScheduleTableProps) {
  return (
    <section aria-labelledby="saved-schedules">
      <h2 id="saved-schedules">등록한 스케줄</h2>
      {schedules.length === 0 ? (
        <p>아직 등록한 스케줄이 없습니다.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">시작</th>
              <th scope="col">종료</th>
              <th scope="col">상태</th>
              <th scope="col">모집 요약</th>
              <th scope="col">관리</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td>{formatScheduleDateTime(schedule.startsAt)}</td>
                <td>{formatScheduleDateTime(schedule.endsAt)}</td>
                <td>{scheduleStatusLabels[schedule.status]}</td>
                <td>{formatRoleSlotSummary(schedule)}</td>
                <td>
                  <ScheduleStatusForm scheduleId={schedule.id} currentStatus={schedule.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}