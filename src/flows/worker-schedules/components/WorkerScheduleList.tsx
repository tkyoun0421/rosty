import { ApplyToScheduleButton } from "#mutations/application/components/ApplyToScheduleButton";
import type { RecruitingScheduleListItem } from "#queries/schedule/dal/listRecruitingSchedules";

export interface WorkerScheduleListItem extends RecruitingScheduleListItem {
  applied: boolean;
}

interface WorkerScheduleListProps {
  schedules: WorkerScheduleListItem[];
}

function formatScheduleDate(value: string) {
  return value.slice(0, 10);
}

function formatScheduleTime(value: string) {
  return value.slice(11, 16);
}

export function WorkerScheduleList({ schedules }: WorkerScheduleListProps) {
  if (schedules.length === 0) {
    return <p>현재 신청 가능한 스케줄이 없습니다.</p>;
  }

  return (
    <section aria-labelledby="worker-schedule-list">
      <h2 id="worker-schedule-list">목록</h2>
      <ul>
        {schedules.map((schedule) => (
          <li key={schedule.id}>
            <p>{formatScheduleDate(schedule.startsAt)}</p>
            <p>
              {formatScheduleTime(schedule.startsAt)} - {formatScheduleTime(schedule.endsAt)}
            </p>
            <p>모집 중</p>
            <ApplyToScheduleButton scheduleId={schedule.id} applied={schedule.applied} />
          </li>
        ))}
      </ul>
    </section>
  );
}
