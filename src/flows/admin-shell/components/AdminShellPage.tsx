import Link from "next/link";

import { getCurrentUser } from "#queries/access/dal/getCurrentUser";
import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

export async function AdminShellPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return (
      <main className="min-h-screen bg-secondary/30 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-3xl">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Admin access is required.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="m-0 text-sm text-muted-foreground">
                Sign in with an admin account to manage schedules, operations, invites, and worker rates.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8">
        <header className="grid gap-3">
          <Badge variant="outline" className="w-fit">
            Admin workspace
          </Badge>
          <h1 className="text-[28px] font-semibold leading-tight">Admin workspace</h1>
          <p className="text-base text-muted-foreground">
            Open the area you need for staffing operations, invite management, and rate updates.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2" aria-label="Admin navigation">
          <Card>
            <CardHeader>
              <CardTitle>Schedules</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="m-0 text-sm text-muted-foreground">
                Create schedules, review saved drafts, and move staffing work forward.
              </p>
              <Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" href="/admin/schedules">
                Open schedules
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operations dashboard</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="m-0 text-sm text-muted-foreground">
                Triage today and upcoming schedules before drilling into detail.
              </p>
              <Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" href="/admin/operations">
                Open operations dashboard
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invites</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="m-0 text-sm text-muted-foreground">
                Manage invite issuance and review access onboarding from one place.
              </p>
              <Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" href="/admin/invites">
                Open invites
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Worker rates</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="m-0 text-sm text-muted-foreground">
                Review and update worker hourly rates without leaving the admin area.
              </p>
              <Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" href="/admin/worker-rates">
                Open worker rates
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
