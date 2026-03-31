import { requireAdminUser } from "#queries/access/dal/requireAdminUser";

import { CreateScheduleForm } from "./CreateScheduleForm";

export async function AdminSchedulesPage() {
  try {
    await requireAdminUser();
  } catch {
    return <main>관리자 권한이 필요합니다.</main>;
  }

  return (
    <main>
      <h1>스케줄 관리</h1>
      <p>근무일, 시간, 역할별 모집 인원을 한 번에 등록합니다.</p>
      <CreateScheduleForm />
      <section aria-labelledby="schedule-status-overview">
        <h2 id="schedule-status-overview">운영 상태 안내</h2>
        <p>새 스케줄은 저장 직후 모집 상태로 시작합니다.</p>
        <p>저장된 스케줄과 이후 상태 변경 기록은 이 화면에서 이어서 관리합니다.</p>
      </section>
    </main>
  );
}
