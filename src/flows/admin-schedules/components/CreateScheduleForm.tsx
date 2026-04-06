"use client";

import { useState } from "react";

import { submitSchedule } from "#mutations/schedule/actions/submitSchedule";
import { Alert, AlertDescription, AlertTitle } from "#shared/ui/alert";
import { Button } from "#shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#shared/ui/card";

interface RoleSlotDraft {
  id: number;
  roleCode: string;
  headcount: string;
}

function fieldClassName() {
  return "mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
}

export function CreateScheduleForm() {
  const [roleSlots, setRoleSlots] = useState<RoleSlotDraft[]>([
    { id: 1, roleCode: "captain", headcount: "2" },
  ]);

  return (
    <Card className="bg-background">
      <CardHeader className="gap-3">
        <div className="grid gap-2">
          <CardTitle>Create schedule</CardTitle>
          <CardDescription>
            Set the work window and role slots for the next staffing run.
          </CardDescription>
        </div>
        <Alert>
          <AlertTitle>Recruiting starts first</AlertTitle>
          <AlertDescription>
            New schedules start in Recruiting so admins can collect applicants before assignments.
          </AlertDescription>
        </Alert>
      </CardHeader>

      <CardContent>
        <form action={submitSchedule} className="grid gap-6">
          <section className="grid gap-4" aria-labelledby="create-schedule-details">
            <div className="grid gap-1">
              <h3 id="create-schedule-details" className="text-sm font-semibold text-foreground">
                Schedule details
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose the work date and the time window workers should see.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-1 text-sm font-medium text-foreground">
                Work date
                <input className={fieldClassName()} name="date" type="date" required />
              </label>

              <label className="grid gap-1 text-sm font-medium text-foreground">
                Starts at
                <input className={fieldClassName()} name="startTime" type="time" required />
              </label>

              <label className="grid gap-1 text-sm font-medium text-foreground">
                Ends at
                <input className={fieldClassName()} name="endTime" type="time" required />
              </label>
            </div>
          </section>

          <section className="grid gap-4" aria-labelledby="create-schedule-roles">
            <div className="grid gap-1">
              <h3 id="create-schedule-roles" className="text-sm font-semibold text-foreground">
                Role slots
              </h3>
              <p className="text-sm text-muted-foreground">
                Add each role and the headcount needed for that schedule.
              </p>
            </div>

            <div className="grid gap-4">
              {roleSlots.map((roleSlot, index) => (
                <Card key={roleSlot.id} className="border-dashed bg-secondary/20 shadow-none">
                  <CardHeader className="gap-2 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid gap-1">
                        <CardTitle className="text-base">Role slot {index + 1}</CardTitle>
                        <CardDescription>
                          Keep at least one role slot on every schedule.
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRoleSlots((current) =>
                            current.length === 1
                              ? current
                              : current.filter((item) => item.id !== roleSlot.id),
                          );
                        }}
                        disabled={roleSlots.length === 1}
                      >
                        Remove role
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-1 text-sm font-medium text-foreground">
                      Role code
                      <input
                        className={fieldClassName()}
                        name="roleCode"
                        value={roleSlot.roleCode}
                        onChange={(event) => {
                          const nextRoleCode = event.target.value;
                          setRoleSlots((current) =>
                            current.map((item) =>
                              item.id === roleSlot.id ? { ...item, roleCode: nextRoleCode } : item,
                            ),
                          );
                        }}
                        required
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-medium text-foreground">
                      Headcount
                      <input
                        className={fieldClassName()}
                        name="headcount"
                        type="number"
                        min={1}
                        step={1}
                        value={roleSlot.headcount}
                        onChange={(event) => {
                          const nextHeadcount = event.target.value;
                          setRoleSlots((current) =>
                            current.map((item) =>
                              item.id === roleSlot.id ? { ...item, headcount: nextHeadcount } : item,
                            ),
                          );
                        }}
                        required
                      />
                    </label>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRoleSlots((current) => [
                    ...current,
                    { id: Date.now(), roleCode: "", headcount: "1" },
                  ]);
                }}
              >
                Add another role
              </Button>
              <Button type="submit">Save schedule</Button>
            </div>
          </section>
        </form>
      </CardContent>
    </Card>
  );
}
