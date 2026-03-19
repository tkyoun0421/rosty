import { useMutation } from '@tanstack/react-query';

import type { AuthSession } from '@/features/auth/model/auth-types';
import { payPolicyQueryKey } from '@/features/payroll/api/fetch-pay-policy';
import {
  setMemberPayRate,
  upsertHallPayPolicy,
} from '@/features/payroll/api/manage-pay-policy';
import type {
  HallPayPolicyInput,
  PayPolicyMember,
} from '@/features/payroll/model/pay-policy-management';
import { queryClient } from '@/shared/lib/react-query/query-client';

export type PayPolicyAdminAction =
  | {
      kind: 'save-policy';
      values: HallPayPolicyInput;
    }
  | {
      kind: 'set-member-rate';
      member: PayPolicyMember;
      hourlyRate: number | null;
    };

export function usePayPolicyAdminMutation(adminSession: AuthSession | null) {
  return useMutation({
    mutationFn: async (action: PayPolicyAdminAction) => {
      if (!adminSession || adminSession.role !== 'admin') {
        throw new Error('Only active admins can manage pay policy.');
      }

      switch (action.kind) {
        case 'save-policy': {
          await upsertHallPayPolicy(action.values);
          return;
        }
        case 'set-member-rate': {
          await setMemberPayRate({
            userId: action.member.id,
            hourlyRate: action.hourlyRate,
          });
          return;
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: payPolicyQueryKey });
    },
  });
}
