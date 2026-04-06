import type { RoleSlotSummary } from "#flows/admin-schedule-assignment/utils/adminScheduleAssignment";
import { Alert, AlertDescription, AlertTitle } from "#shared/ui/alert";
import { Button } from "#shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

interface ConfirmAssignmentsDialogProps {
  open: boolean;
  roleSlots: RoleSlotSummary[];
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmAssignmentsDialog({
  open,
  roleSlots,
  submitting,
  onClose,
  onConfirm,
}: ConfirmAssignmentsDialogProps) {
  if (!open) {
    return null;
  }

  const filledCount = roleSlots.reduce((sum, slot) => sum + slot.assignedCount, 0);
  const totalHeadcount = roleSlots.reduce((sum, slot) => sum + slot.headcount, 0);
  const unfilledSeatCount = roleSlots.reduce((sum, slot) => sum + slot.unfilledCount, 0);

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-assignments-title"
      className="fixed inset-0 z-50 grid place-items-start bg-foreground/30 px-4 py-10 sm:place-items-center"
    >
      <Card className="w-full max-w-2xl bg-background shadow-xl">
        <CardHeader className="gap-3">
          <CardTitle id="confirm-assignments-title">Confirm assignments</CardTitle>
          <p className="m-0 text-sm text-muted-foreground">
            Confirming now will publish roles and pay previews to workers. Continue?
          </p>
        </CardHeader>

        <CardContent className="grid gap-4">
          <Alert>
            <AlertTitle>Publishing summary</AlertTitle>
            <AlertDescription>
              Filled seats {filledCount} / {totalHeadcount}. Unfilled slots {unfilledSeatCount}.
              Role slots in this publish {roleSlots.length}.
            </AlertDescription>
          </Alert>

          <ul className="grid gap-3">
            {roleSlots.map((slot) => (
              <li
                key={slot.id}
                className="grid gap-1 rounded-2xl border border-border bg-secondary/20 px-4 py-4"
              >
                <strong className="text-base font-semibold">{slot.roleCode}</strong>
                <p className="m-0 text-sm text-muted-foreground">
                  Filled seats {slot.assignedCount} / {slot.headcount}
                </p>
                <p className="m-0 text-sm text-muted-foreground">Unfilled {slot.unfilledCount}</p>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="button" onClick={onConfirm} disabled={submitting}>
              {submitting ? "Confirming..." : "Confirm assignments"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
