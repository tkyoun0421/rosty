import type { TeamPayrollMemberEstimate } from '@/features/payroll/model/team-payroll';
import type { TeamPayrollSnapshotResult } from '@/features/payroll/api/fetch-team-payroll';

export type MyPayrollSnapshot = {
  source: TeamPayrollSnapshotResult['source'];
  sourceMessage: string | null;
  member: TeamPayrollMemberEstimate | null;
};

export function createMyPayrollSnapshot(
  snapshot: TeamPayrollSnapshotResult,
  userId: string,
): MyPayrollSnapshot {
  return {
    source: snapshot.source,
    sourceMessage: snapshot.sourceMessage,
    member:
      snapshot.members.find((member) => member.memberId === userId) ?? null,
  };
}
