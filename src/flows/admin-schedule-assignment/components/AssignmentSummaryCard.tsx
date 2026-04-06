import type { RoleSlotSummary } from "#flows/admin-schedule-assignment/utils/adminScheduleAssignment";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

interface AssignmentSummaryCardProps {
  roleSlots: RoleSlotSummary[];
}

export function AssignmentSummaryCard({ roleSlots }: AssignmentSummaryCardProps) {
  const filledCount = roleSlots.reduce((sum, slot) => sum + slot.assignedCount, 0);
  const totalHeadcount = roleSlots.reduce((sum, slot) => sum + slot.headcount, 0);
  const unfilledCount = Math.max(totalHeadcount - filledCount, 0);

  return (
    <Card aria-label="Assignment summary" className="bg-background">
      <CardHeader className="gap-2">
        <CardTitle>Assignment summary</CardTitle>
        <p className="m-0 text-[28px] font-semibold leading-tight">
          {filledCount}/{totalHeadcount} assigned
        </p>
        <p className="m-0 text-sm text-muted-foreground">
          {unfilledCount} seats still need assignment before final confirmation.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3">
          {roleSlots.map((slot) => (
            <li
              key={slot.id}
              className="grid gap-1 rounded-2xl border border-border bg-secondary/30 px-4 py-4"
            >
              <strong className="text-base font-semibold">{slot.roleCode}</strong>
              <p className="m-0 text-sm text-muted-foreground">
                Assigned {slot.assignedCount} / {slot.headcount}
              </p>
              <p className="m-0 text-sm text-muted-foreground">Unfilled {slot.unfilledCount}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
