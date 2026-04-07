import { listMyScheduleApplicationIds } from "#queries/application/dal/listMyScheduleApplicationIds";
import { getCurrentUser } from "#queries/access/dal/getCurrentUser";
import { listRecruitingSchedules } from "#queries/schedule/dal/listRecruitingSchedules";
import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

import { WorkerScheduleList } from "#flows/worker-schedules/components/WorkerScheduleList";

export async function WorkerSchedulesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "worker") {
    return (
      <main className="min-h-screen bg-secondary/30 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-3xl">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Worker access is required.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="m-0 text-sm text-muted-foreground">
                Sign in with a worker account to review recruiting schedules and application status.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const [schedules, applicationIds] = await Promise.all([
    listRecruitingSchedules(),
    listMyScheduleApplicationIds(currentUser.id),
  ]);
  const appliedScheduleIds = new Set(applicationIds);

  return (
    <main className="min-h-screen bg-secondary/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8">
        <header className="grid gap-3">
          <Badge variant="outline" className="w-fit">
            Worker recruiting
          </Badge>
          <h1 className="text-[28px] font-semibold leading-tight">Recruiting schedules</h1>
          <p className="max-w-3xl text-base text-muted-foreground">
            Review upcoming openings, confirm whether you already applied, and check the roles
            still being staffed.
          </p>
        </header>

        <WorkerScheduleList
          schedules={schedules.map((schedule) => ({
            ...schedule,
            applied: appliedScheduleIds.has(schedule.id),
          }))}
        />
      </div>
    </main>
  );
}
