import Link from "next/link";

import { getCurrentUser } from "#queries/access/dal/getCurrentUser";

export async function WorkerShellPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "worker") {
    return <main>Worker access is required.</main>;
  }

  return (
    <main>
      <h1>Worker home</h1>
      <nav aria-label="Worker navigation">
        <ul>
          <li>
            <Link href="/worker/schedules">Open schedules</Link>
          </li>
          <li>
            <Link href="/worker/assignments">Confirmed work</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
