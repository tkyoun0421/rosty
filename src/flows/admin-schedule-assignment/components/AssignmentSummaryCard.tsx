import type { RoleSlotSummary } from "#flows/admin-schedule-assignment/utils/adminScheduleAssignment";

interface AssignmentSummaryCardProps {
  roleSlots: RoleSlotSummary[];
}

export function AssignmentSummaryCard({ roleSlots }: AssignmentSummaryCardProps) {
  const filledCount = roleSlots.reduce((sum, slot) => sum + slot.assignedCount, 0);
  const totalHeadcount = roleSlots.reduce((sum, slot) => sum + slot.headcount, 0);
  const unfilledCount = Math.max(totalHeadcount - filledCount, 0);

  return (
    <section
      aria-label="Assignment summary"
      style={{
        backgroundColor: "#E4DACB",
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      <h2 style={{ fontSize: "20px", margin: 0 }}>Assignment summary</h2>
      <p style={{ color: "#1F5A6E", fontSize: "28px", fontWeight: 600, margin: "16px 0 8px" }}>
        {filledCount}/{totalHeadcount} assigned
      </p>
      <p style={{ margin: 0 }}>Unfilled slots: {unfilledCount}</p>
      <ul
        style={{ display: "grid", gap: "12px", listStyle: "none", margin: "24px 0 0", padding: 0 }}
      >
        {roleSlots.map((slot) => (
          <li
            key={slot.id}
            style={{
              backgroundColor: "#F6F1E8",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <strong>{slot.roleCode}</strong>
            <p style={{ margin: "8px 0 0" }}>
              Assigned {slot.assignedCount} / {slot.headcount}
            </p>
            <p style={{ margin: "4px 0 0" }}>Unfilled {slot.unfilledCount}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
