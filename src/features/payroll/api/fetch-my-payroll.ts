import { useQuery } from '@tanstack/react-query';

import {
  fetchTeamPayrollSnapshot,
  teamPayrollQueryKey,
  type TeamPayrollSnapshotResult,
} from '@/features/payroll/api/fetch-team-payroll';
import {
  createMyPayrollSnapshot,
  type MyPayrollSnapshot,
} from '@/features/payroll/model/my-payroll';

export function myPayrollQueryKey(userId: string) {
  return [...teamPayrollQueryKey, 'me', userId] as const;
}

export async function fetchMyPayrollSnapshot(
  userId: string,
): Promise<MyPayrollSnapshot> {
  const snapshot: TeamPayrollSnapshotResult = await fetchTeamPayrollSnapshot();
  return createMyPayrollSnapshot(snapshot, userId);
}

export function useMyPayrollQuery(userId: string | null) {
  return useQuery({
    queryKey: userId ? myPayrollQueryKey(userId) : [...teamPayrollQueryKey, 'me'],
    queryFn: () => fetchMyPayrollSnapshot(userId ?? ''),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
