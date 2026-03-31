interface PayPreviewTotalCardProps {
  totalPayCents: number;
  assignmentCount: number;
}

export function PayPreviewTotalCard({
  totalPayCents,
  assignmentCount,
}: PayPreviewTotalCardProps) {
  return (
    <section aria-label="Total pay preview">
      <h1>Confirmed work pay preview</h1>
      <p>Total expected pay</p>
      <p>{totalPayCents.toLocaleString()} KRW</p>
      <p>
        Based on {assignmentCount} confirmed assignment{assignmentCount === 1 ? "" : "s"}.
      </p>
    </section>
  );
}
