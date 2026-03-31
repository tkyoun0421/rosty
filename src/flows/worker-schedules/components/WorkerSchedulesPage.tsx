import { listMyScheduleApplicationIds } from "#queries/application/dal/listMyScheduleApplicationIds";
import { getCurrentUser } from "#queries/access/dal/getCurrentUser";
import { listRecruitingSchedules } from "#queries/schedule/dal/listRecruitingSchedules";

import { WorkerScheduleList } from "./WorkerScheduleList";

export async function WorkerSchedulesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "worker") {
    return <main>근무자 권한이 필요합니다.</main>;
  }

  const [schedules, applicationIds] = await Promise.all([
    listRecruitingSchedules(),
    listMyScheduleApplicationIds(currentUser.id),
  ]);
  const appliedScheduleIds = new Set(applicationIds);

  return (
    <main>
      <h1>모집 중인 스케줄</h1>
      <p>날짜와 시간을 확인하고 바로 신청할 수 있습니다.</p>
      <WorkerScheduleList
        schedules={schedules.map((schedule) => ({
          ...schedule,
          applied: appliedScheduleIds.has(schedule.id),
        }))}
      />
    </main>
  );
}