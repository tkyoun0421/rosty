import Link from "next/link";

import type { AdminScheduleListItem } from "#queries/schedule/types/scheduleList";
import { ScheduleStatusForm } from "#flows/admin-schedules/components/ScheduleStatusForm";
import {
  formatRoleSlotSummary,
  formatScheduleDateTime,
  scheduleStatusLabels,
} from "#flows/admin-schedules/utils/formatSchedule";

interface ScheduleTableProps {
  schedules: AdminScheduleListItem[];
}

export function ScheduleTable({ schedules }: ScheduleTableProps) {
  return (
    <section aria-labelledby="saved-schedules">
      <h2 id="saved-schedules">Saved schedules</h2>
      {schedules.length === 0 ? (
        <p>No schedules have been created yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Starts</th>
              <th scope="col">Ends</th>
              <th scope="col">Status</th>
              <th scope="col">Role summary</th>
              <th scope="col">Detail</th>
              <th scope="col">Manage</th>
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
                  <Link href={`/admin/schedules/${schedule.id}`}>Open assignment detail</Link>
                </td>
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
