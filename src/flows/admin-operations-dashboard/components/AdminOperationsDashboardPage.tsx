import Link from "next/link";

import { AdminOperationsDashboardSection } from "#flows/admin-operations-dashboard/components/AdminOperationsDashboardSection";
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";
import { listAdminOperationsDashboardSchedules } from "#queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules";
import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

export async function AdminOperationsDashboardPage() {
  try {
    await requireAdminUser();
  } catch {
    return <main>Admin access required.</main>;
  }

  const sections = await listAdminOperationsDashboardSchedules();
  const schedulesNeedingAttention = sections.today.length + sections.upcoming.length;

  return (
    <main className="min-h-screen bg-secondary/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8">
        <header className="grid gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="grid gap-3">
              <Badge variant="outline" className="w-fit">
                Scheduling triage
              </Badge>
              <div className="grid gap-2">
                <h1 className="text-[28px] font-semibold leading-tight">Operations dashboard</h1>
                <p className="max-w-3xl text-base text-muted-foreground">
                  Start with schedules needing attention here, then move into schedule detail or
                  schedule management for the next staffing step.
                </p>
              </div>
            </div>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              href="/admin/schedules"
            >
              Open schedule management
            </Link>
          </div>

          <Card className="bg-background">
            <CardHeader className="gap-1">
              <p className="text-sm font-semibold text-muted-foreground">Triage summary</p>
              <CardTitle>{schedulesNeedingAttention} schedules in view</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-sm text-muted-foreground">
                Review today first, then check the nearby upcoming window. Broader schedule edits
                and new schedule creation stay in schedule management.
              </p>
              <div>
                <Link
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  href="/admin/schedules"
                >
                  Open schedule management
                </Link>
              </div>
            </CardContent>
          </Card>
        </header>
        {schedulesNeedingAttention === 0 ? (
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>No schedules need attention right now</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-sm text-muted-foreground">
                There are no schedules for today or the nearby upcoming window. Open schedule
                management to review future staffing or create the next schedule.
              </p>
              <div>
                <Link
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  href="/admin/schedules"
                >
                  Open schedule management
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <AdminOperationsDashboardSection title="Today" schedules={sections.today} />
            <AdminOperationsDashboardSection title="Upcoming" schedules={sections.upcoming} />
          </>
        )}
      </div>
    </main>
  );
}
