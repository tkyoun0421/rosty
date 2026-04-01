import { AdminOperationsDashboardSection } from "#flows/admin-operations-dashboard/components/AdminOperationsDashboardSection";
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";
import { listAdminOperationsDashboardSchedules } from "#queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules";
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
    <main className="min-h-screen bg-secondary/40 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8">
        <header className="grid gap-4">
          <div className="grid gap-2">
            <h1 className="text-[28px] font-semibold leading-tight">Operations dashboard</h1>
            <p className="max-w-3xl text-base text-muted-foreground">
              Review today&apos;s schedules first, then scan the nearby upcoming window before
              drilling into schedule detail.
            </p>
          </div>
          <Card className="bg-background">
            <CardHeader className="gap-1">
              <p className="text-sm font-semibold text-muted-foreground">Triage summary</p>
              <CardTitle>{schedulesNeedingAttention} schedules in view</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Staffing anomalies are elevated before attendance cleanup, and detailed edits stay
                in the schedule review flow.
              </p>
            </CardContent>
          </Card>
        </header>
        {schedulesNeedingAttention === 0 ? (
          <Card className="bg-secondary/40">
            <CardHeader>
              <CardTitle>No schedules need attention right now</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                There are no schedules for today or the nearby upcoming window. Check back later or
                open the schedule list to review future staffing.
              </p>
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