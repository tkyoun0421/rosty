import { CreateScheduleForm } from "#flows/admin-schedules/components/CreateScheduleForm";
import { ScheduleTable } from "#flows/admin-schedules/components/ScheduleTable";
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";
import { listAdminSchedules } from "#queries/schedule/dal/listAdminSchedules";
import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

export async function AdminSchedulesPage() {
  try {
    await requireAdminUser();
  } catch {
    return (
      <main className="min-h-screen bg-secondary/30 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-3xl">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Admin access is required.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="m-0 text-sm text-muted-foreground">
                Sign in with an admin account to create schedules, review staffing status, and open
                assignment detail.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const schedules = await listAdminSchedules();

  return (
    <main className="min-h-screen bg-secondary/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8">
        <header className="grid gap-3">
          <Badge variant="outline" className="w-fit">
            Admin scheduling
          </Badge>
          <h1 className="text-[28px] font-semibold leading-tight">Schedule management</h1>
          <p className="max-w-3xl text-base text-muted-foreground">
            Create new staffing runs, review saved schedules, and move approved work into
            assignment detail without leaving the admin workspace.
          </p>
        </header>

        <section className="grid gap-4" aria-labelledby="schedule-creation-surface">
          <div className="grid gap-1">
            <h2 id="schedule-creation-surface" className="text-xl font-semibold leading-tight">
              Create and queue schedules
            </h2>
            <p className="text-sm text-muted-foreground">
              Every new schedule starts in Recruiting so you can gather applicants before
              assignment work begins.
            </p>
          </div>
          <CreateScheduleForm />
        </section>

        <section className="grid gap-4" aria-labelledby="saved-schedules">
          <div className="grid gap-1">
            <h2 id="saved-schedules" className="text-xl font-semibold leading-tight">
              Saved schedules
            </h2>
            <p className="text-sm text-muted-foreground">
              Scan timing, staffing summary, and current status before opening assignment detail.
            </p>
          </div>
          <ScheduleTable schedules={schedules} />
        </section>
      </div>
    </main>
  );
}
