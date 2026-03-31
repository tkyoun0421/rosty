import { getCurrentUser } from "#queries/access/dal/getCurrentUser";

export async function AdminShellPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return <main>관리자 권한이 필요합니다.</main>;
  }

  return <main>관리자 홈</main>;
}

