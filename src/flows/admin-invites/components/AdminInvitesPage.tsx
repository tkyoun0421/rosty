import { createWorkerInvite } from "#mutations/invite/actions/createWorkerInvite";
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";

export async function AdminInvitesPage() {
  try {
    await requireAdminUser();
  } catch {
    return <main>Admin access required.</main>;
  }

  return (
    <main>
      <h1>초대 관리</h1>
      <form action={createWorkerInvite}>
        <button type="submit">근무자 초대 생성</button>
      </form>
    </main>
  );
}
