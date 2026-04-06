import { submitScheduleStatus } from "#mutations/schedule/actions/submitScheduleStatus";
import { inlineScheduleStatuses } from "#mutations/schedule/schemas/updateScheduleStatus";
import { scheduleStatusLabels } from "#flows/admin-schedules/utils/formatSchedule";
import type { AdminScheduleListItem } from "#queries/schedule/types/scheduleList";
import { Button } from "#shared/ui/button";

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
    <form action={submitScheduleStatus} className="grid gap-3 md:min-w-52">
      <input type="hidden" name="scheduleId" value={scheduleId} />
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Move to
        <select
          className="min-h-11 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          name="status"
          defaultValue={nextStatuses[0] ?? currentStatus}
        >
          {nextStatuses.map((status) => (
            <option key={status} value={status}>
              {scheduleStatusLabels[status]}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" variant="outline">
        Update status
      </Button>
    </form>
  );
}
