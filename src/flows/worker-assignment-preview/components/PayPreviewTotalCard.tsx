import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

interface PayPreviewTotalCardProps {
  totalPayCents: number;
  assignmentCount: number;
}

export function PayPreviewTotalCard({
  totalPayCents,
  assignmentCount,
}: PayPreviewTotalCardProps) {
  return (
    <Card aria-label="Total pay preview" className="bg-secondary/70">
      <CardHeader>
        <CardTitle>Confirmed work pay preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="m-0 text-sm font-semibold text-muted-foreground">Total expected pay</p>
        <p className="m-0 text-3xl font-semibold leading-none">{totalPayCents.toLocaleString()} KRW</p>
        <p className="m-0 text-sm text-muted-foreground">
          Based on {assignmentCount} confirmed assignment{assignmentCount === 1 ? "" : "s"}.
        </p>
      </CardContent>
    </Card>
  );
}