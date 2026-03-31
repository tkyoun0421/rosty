import { updateScheduleStatus } from "#mutations/schedule/actions/updateScheduleStatus";
import type { AdminScheduleListItem } from "#queries/schedule/types/scheduleList";

const scheduleStatuses: AdminScheduleListItem["status"][] = ["recruiting", "assigning", "confirmed"];

const scheduleStatusLabels: Record<AdminScheduleListItem["status"], string> = {
  recruiting: "모집 중",
  assigning: "배정 중",
  confirmed: "확정 완료",
};

interface ScheduleStatusFormProps {
  scheduleId: string;
  currentStatus: AdminScheduleListItem["status"];
}

export function ScheduleStatusForm({ scheduleId, currentStatus }: ScheduleStatusFormProps) {
  const nextStatuses = scheduleStatuses.filter((status) => status !== currentStatus);

  return (
    <form action={updateScheduleStatus}>
      <input type="hidden" name="scheduleId" value={scheduleId} />
      <label>
        <span className="sr-only">다음 상태</span>
        <select name="status" defaultValue={nextStatuses[0] ?? currentStatus}>
          {nextStatuses.map((status) => (
            <option key={status} value={status}>
              {scheduleStatusLabels[status]}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">상태 변경</button>
    </form>
  );
}
