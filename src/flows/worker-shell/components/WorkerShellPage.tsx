import Link from "next/link";

import { getCurrentUser } from "#queries/access/dal/getCurrentUser";
import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

export async function WorkerShellPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "worker") {
    return (
      <main className="min-h-screen bg-secondary/30 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-3xl">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Worker access is required.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="m-0 text-sm text-muted-foreground">
                Sign in with a worker account to review schedules and confirmed work.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8">
        <header className="grid gap-3">
          <Badge variant="outline" className="w-fit">
            Worker workspace
          </Badge>
          <h1 className="text-[28px] font-semibold leading-tight">Worker home</h1>
          <p className="text-base text-muted-foreground">
            Review open schedules, track confirmed work, and see where action is needed next.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2" aria-label="Worker navigation">
          <Card>
            <CardHeader>
              <CardTitle>Recruiting schedules</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="m-0 text-sm text-muted-foreground">
                Check upcoming openings and submit applications from one list.
              </p>
              <Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" href="/worker/schedules">
                Open schedules
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Confirmed work</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="m-0 text-sm text-muted-foreground">
                Review confirmed assignments, pay preview, and attendance context.
              </p>
              <Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" href="/worker/assignments">
                Confirmed work
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
