import { getCurrentUser } from "#queries/access/dal/getCurrentUser";

export async function WorkerShellPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "worker") {
    return <main>근무자 권한이 필요합니다.</main>;
  }

  return <main>근무자 홈</main>;
}

