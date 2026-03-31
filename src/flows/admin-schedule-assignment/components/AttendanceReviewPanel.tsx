import type { AdminScheduleAttendanceDetail } from "#queries/attendance/types/adminScheduleAttendanceDetail";

interface AttendanceReviewPanelProps {
  detail: AdminScheduleAttendanceDetail;
}

const attendanceStatusLabels = {
  checked_in: "Checked in",
  late: "Late",
  not_checked_in: "Not checked in",
  not_open_yet: "Not open yet",
} as const;

function formatAttendanceTime(value: string | null) {
  if (!value) {
    return "No check-in recorded";
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return value;
  }

  return timestamp.toISOString().slice(11, 16);
}

export function AttendanceReviewPanel({ detail }: AttendanceReviewPanelProps) {
  return (
    <section
      aria-label="Attendance review"
      style={{
        backgroundColor: "#FFFDFC",
        border: "1px solid #E4DACB",
        borderRadius: "24px",
        display: "grid",
        gap: "24px",
        padding: "24px",
      }}
    >
      <div style={{ display: "grid", gap: "8px" }}>
        <h2 style={{ margin: 0 }}>Attendance review</h2>
        <p style={{ fontSize: "28px", fontWeight: 600, lineHeight: 1.2, margin: 0 }}>
          {detail.summary.checkedInCount + detail.summary.lateCount} of {detail.summary.confirmedWorkerCount}{" "}
          confirmed workers checked in
        </p>
        <p style={{ margin: 0 }}>
          Opened at {detail.schedule.opensAt.slice(11, 16)}. Late check-ins use the schedule start
          time cutoff.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        }}
      >
        <div style={{ backgroundColor: "#F6F1E8", borderRadius: "16px", padding: "16px" }}>
          <strong style={{ display: "block" }}>{detail.summary.checkedInCount} checked in</strong>
          <span>On time</span>
        </div>
        <div style={{ backgroundColor: "#FBEAE7", borderRadius: "16px", padding: "16px" }}>
          <strong style={{ display: "block" }}>{detail.summary.lateCount} late</strong>
          <span>Past start time</span>
        </div>
        <div style={{ backgroundColor: "#F6F1E8", borderRadius: "16px", padding: "16px" }}>
          <strong style={{ display: "block" }}>{detail.summary.notCheckedInCount} not checked in</strong>
          <span>Window already open</span>
        </div>
        <div style={{ backgroundColor: "#ECE8E1", borderRadius: "16px", padding: "16px" }}>
          <strong style={{ display: "block" }}>{detail.summary.notOpenYetCount} not open yet</strong>
          <span>Waiting for window</span>
        </div>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        {detail.workers.map((worker) => (
          <article
            key={worker.scheduleAssignmentId}
            style={{
              backgroundColor: "#F6F1E8",
              border: "1px solid #E4DACB",
              borderRadius: "16px",
              display: "grid",
              gap: "8px",
              padding: "16px",
            }}
          >
            <div
              style={{
                alignItems: "center",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "grid", gap: "4px" }}>
                <strong>{worker.workerName ?? worker.workerUserId}</strong>
                <span>{worker.roleCode ?? "Unassigned role"}</span>
              </div>
              <span
                style={{
                  backgroundColor:
                    worker.status === "late"
                      ? "#FBEAE7"
                      : worker.status === "checked_in"
                        ? "#DCEEF4"
                        : "#ECE8E1",
                  borderRadius: "999px",
                  fontWeight: 600,
                  padding: "4px 12px",
                }}
              >
                {attendanceStatusLabels[worker.status]}
              </span>
            </div>
            <p style={{ margin: 0 }}>Check-in time: {formatAttendanceTime(worker.checkedInAt)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}