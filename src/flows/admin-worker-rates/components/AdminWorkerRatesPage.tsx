import { getCurrentUser } from "#queries/access/dal/getCurrentUser";
import { listWorkerRates } from "#queries/worker-rate/dal/listWorkerRates";

import { WorkerRateForm } from "./WorkerRateForm";
import { WorkerRateTable } from "./WorkerRateTable";

export async function AdminWorkerRatesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    return <main>관리자 권한이 필요합니다.</main>;
  }

  const records = await listWorkerRates();
  const selectedUserId = records[0]?.userId ?? "worker-1";

  return (
    <main>
      <h1>근무자 시급 관리</h1>
      <WorkerRateTable records={records} />
      <WorkerRateForm userId={selectedUserId} />
    </main>
  );
}

