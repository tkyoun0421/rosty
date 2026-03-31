import type { RoleSlotSummary } from "#flows/admin-schedule-assignment/utils/adminScheduleAssignment";

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
  const unfilledSlots = roleSlots.filter((slot) => slot.unfilledCount > 0);

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-assignments-title"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        inset: 0,
        padding: "24px",
        position: "fixed",
      }}
    >
      <div
        style={{
          backgroundColor: "#F6F1E8",
          borderRadius: "16px",
          margin: "48px auto",
          maxWidth: "560px",
          padding: "24px",
        }}
      >
        <h2 id="confirm-assignments-title" style={{ marginTop: 0 }}>
          Confirm assignments
        </h2>
        <p style={{ marginTop: 0 }}>
          Confirming now will publish roles and pay previews to workers. Continue?
        </p>
        <p>
          Filled seats {filledCount} / {totalHeadcount}
        </p>
        <p>Unfilled slots {unfilledSlots.reduce((sum, slot) => sum + slot.unfilledCount, 0)}</p>
        <ul style={{ paddingLeft: "20px" }}>
          {roleSlots.map((slot) => (
            <li key={slot.id}>
              {slot.roleCode}: {slot.assignedCount}/{slot.headcount}
              {slot.unfilledCount > 0 ? `, unfilled ${slot.unfilledCount}` : ""}
            </li>
          ))}
        </ul>
        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}
        >
          <button type="button" onClick={onClose}>
            Close
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting}>
            {submitting ? "Confirming..." : "Confirm assignments"}
          </button>
        </div>
      </div>
    </div>
  );
}
