import { requireAdminUser } from "#queries/access/dal/requireAdminUser";
import { listWorkerRates } from "#queries/worker-rate/dal/listWorkerRates";

import { WorkerRateForm } from "#flows/admin-worker-rates/components/WorkerRateForm";
import { WorkerRateTable } from "#flows/admin-worker-rates/components/WorkerRateTable";

export async function AdminWorkerRatesPage() {
  try {
    await requireAdminUser();
  } catch {
    return <main>관리자 권한이 필요합니다.</main>;
  }

  const workerRates = await listWorkerRates();
  const defaultWorkerId = workerRates[0]?.userId;

  return (
    <main>
      <h1>근무자 시급 관리</h1>
      <p>관리자는 근무자별 현재 시급을 설정하고 확인할 수 있습니다.</p>
      {defaultWorkerId ? <WorkerRateForm userId={defaultWorkerId} /> : null}
      <WorkerRateTable records={workerRates} />
    </main>
  );
}