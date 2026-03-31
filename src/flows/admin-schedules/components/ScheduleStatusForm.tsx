import { submitScheduleStatus } from "#mutations/schedule/actions/submitScheduleStatus";
import { inlineScheduleStatuses } from "#mutations/schedule/schemas/updateScheduleStatus";
import type { AdminScheduleListItem } from "#queries/schedule/types/scheduleList";

const scheduleStatusLabels: Record<AdminScheduleListItem["status"], string> = {
  recruiting: "Recruiting",
  assigning: "Assigning",
  confirmed: "Confirmed",
};

interface ScheduleStatusFormProps {
  scheduleId: string;
  currentStatus: AdminScheduleListItem["status"];
}

export function ScheduleStatusForm({ scheduleId, currentStatus }: ScheduleStatusFormProps) {
  if (currentStatus === "confirmed") {
    return null;
  }

  const nextStatuses = inlineScheduleStatuses.filter((status) => status !== currentStatus);

  return (
    <form action={submitScheduleStatus}>
      <input type="hidden" name="scheduleId" value={scheduleId} />
      <label>
        <span className="sr-only">Next status</span>
        <select name="status" defaultValue={nextStatuses[0] ?? currentStatus}>
          {nextStatuses.map((status) => (
            <option key={status} value={status}>
              {scheduleStatusLabels[status]}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Change status</button>
    </form>
  );
}
