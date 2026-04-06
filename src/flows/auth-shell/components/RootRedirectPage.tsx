import Link from "next/link";
import { redirect } from "next/navigation";

import { ONBOARDING_PATH, SIGN_IN_PATH, UNAUTHORIZED_PATH } from "#shared/config/authConfig";
import { getCurrentUserProfile } from "#queries/access/dal/getCurrentUserProfile";
import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

export async function RootRedirectPage() {
  const user = await getCurrentUserProfile();

  if (!user) {
    return redirect(SIGN_IN_PATH);
  }

  if (!user.isProfileComplete) {
    return redirect(ONBOARDING_PATH);
  }

  if (user.role !== "admin" && user.role !== "worker") {
    return redirect(UNAUTHORIZED_PATH);
  }

  const roleSummary =
    user.role === "worker"
      ? "Review recruiting schedules or jump back into confirmed work from your worker workspace."
      : "Open the admin workspace to manage schedules, operations, invites, and worker rates.";

  const signedInAs = user.fullName ?? user.email;

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8">
        <header className="grid gap-3">
          <Badge variant="outline" className="w-fit">
            Common home
          </Badge>
          <h1 className="text-[28px] font-semibold leading-tight">Welcome back</h1>
          <p className="text-base text-muted-foreground">
            Signed in as {signedInAs}. {roleSummary}
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2" aria-label="Home navigation">
          {user.role === "worker" ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Recruiting schedules</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <p className="m-0 text-sm text-muted-foreground">
                    Review open schedules and submit applications.
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
                    Check your confirmed assignments, pay preview, and attendance window.
                  </p>
                  <Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" href="/worker/assignments">
                    Open confirmed work
                  </Link>
                </CardContent>
              </Card>
            </>
          ) : null}

          {user.role === "admin" ? (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Admin tools</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="m-0 text-sm text-muted-foreground">
                  Open the admin workspace for schedules, assignments, invites, attendance, and worker rates.
                </p>
                <Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" href="/admin">
                  Open admin workspace
                </Link>
              </CardContent>
            </Card>
          ) : null}
        </section>
      </div>
    </main>
  );
}
