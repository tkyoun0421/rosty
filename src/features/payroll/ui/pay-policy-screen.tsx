import { useEffect, useState } from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { usePayPolicyQuery } from '@/features/payroll/api/fetch-pay-policy';
import { usePayPolicyAdminMutation } from '@/features/payroll/api/use-pay-policy-admin-mutation';
import {
  countMemberRateOverrides,
  createHallPayPolicyFormValues,
  createMemberPayRateDrafts,
  formatHourlyRate,
  formatMemberRole,
  formatMemberStatus,
  formatMultiplier,
  validateHallPayPolicy,
  validateMemberPayRate,
  type HallPayPolicyFieldErrors,
  type PayPolicyMember,
} from '@/features/payroll/model/pay-policy-management';
import { hasSupabaseConfig } from '@/shared/lib/supabase/client';

type PayPolicyScreenProps = {
  session: AuthSession;
  onBackHome: () => void;
  onBackMembers: () => void;
};

type PayPolicyFrameProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

type SummaryCardProps = {
  label: string;
  value: string | number;
};

type MemberRateCardProps = {
  member: PayPolicyMember;
  defaultRate: number | null;
  draftValue: string;
  error: string | null;
  disabled: boolean;
  onChangeValue: (value: string) => void;
  onSave: () => Promise<void>;
  onClear: () => Promise<void>;
};

type ActionNotice = {
  tone: 'notice' | 'error';
  title: string;
  body: string;
};

export function PayPolicyScreen({
  session,
  onBackHome,
  onBackMembers,
}: PayPolicyScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const payPolicyQuery = usePayPolicyQuery();
  const mutation = usePayPolicyAdminMutation(session);
  const [policyForm, setPolicyForm] = useState(createHallPayPolicyFormValues(null));
  const [policyErrors, setPolicyErrors] =
    useState<HallPayPolicyFieldErrors>({});
  const [memberDrafts, setMemberDrafts] = useState<Record<string, string>>({});
  const [memberErrors, setMemberErrors] = useState<
    Record<string, string | null>
  >({});
  const [actionNotice, setActionNotice] = useState<ActionNotice | null>(null);

  useEffect(() => {
    if (!payPolicyQuery.data) {
      return;
    }

    setPolicyForm(createHallPayPolicyFormValues(payPolicyQuery.data.policy));
    setPolicyErrors({});
    setMemberDrafts(createMemberPayRateDrafts(payPolicyQuery.data.members));
    setMemberErrors({});
  }, [payPolicyQuery.dataUpdatedAt, payPolicyQuery.data]);

  if (!hasSupabaseConfig) {
    return (
      <PayPolicyFrame
        title="Pay Policy"
        subtitle="Supabase config is required before the real admin pay-policy workflow can run."
      >
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Pay policy is unavailable</Text>
          <Text style={styles.noticeBody}>
            Configure the Supabase project env and reload the app to manage the
            hall pay settings.
          </Text>
        </View>
        <FooterActions
          onBackHome={onBackHome}
          onBackMembers={onBackMembers}
          onSignOut={signOut}
        />
      </PayPolicyFrame>
    );
  }

  if (payPolicyQuery.isLoading) {
    return (
      <PayPolicyFrame
        title="Pay Policy"
        subtitle="Loading the hall pay settings and member rate overrides from the current Supabase project."
      >
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Loading pay policy</Text>
          <Text style={styles.noticeBody}>
            Pulling the hall default hourly settings and per-member override
            rows.
          </Text>
        </View>
      </PayPolicyFrame>
    );
  }

  if (payPolicyQuery.isError) {
    return (
      <PayPolicyFrame
        title="Pay Policy"
        subtitle="The admin route loaded, but the pay-policy query could not finish."
      >
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Pay policy query failed</Text>
          <Text selectable style={styles.errorBody}>
            {payPolicyQuery.error.message}
          </Text>
        </View>
        <FooterActions
          onBackHome={onBackHome}
          onBackMembers={onBackMembers}
          onSignOut={signOut}
        />
      </PayPolicyFrame>
    );
  }

  const snapshot = payPolicyQuery.data ?? {
    policy: null,
    members: [],
  };
  const hallPolicy = snapshot.policy;
  const memberOverrides = countMemberRateOverrides(snapshot.members);

  async function handleSavePolicy() {
    const validation = validateHallPayPolicy(policyForm);
    setPolicyErrors(validation.errors);

    if (!validation.values) {
      return;
    }

    setActionNotice(null);

    try {
      await mutation.mutateAsync({
        kind: 'save-policy',
        values: validation.values,
      });
      setActionNotice({
        tone: 'notice',
        title: hallPolicy ? 'Pay policy updated' : 'Pay policy created',
        body: 'The hall default hourly settings are saved for the current project.',
      });
    } catch (error) {
      setActionNotice({
        tone: 'error',
        title: 'Pay policy save failed',
        body: formatActionError(error, 'Could not save the hall pay policy.'),
      });
    }
  }

  async function handleSaveMemberRate(member: PayPolicyMember) {
    const validation = validateMemberPayRate(memberDrafts[member.id] ?? '');

    if (validation.error) {
      setMemberErrors((current) => ({
        ...current,
        [member.id]: validation.error,
      }));
      return;
    }

    setMemberErrors((current) => ({
      ...current,
      [member.id]: null,
    }));
    setActionNotice(null);

    try {
      await mutation.mutateAsync({
        kind: 'set-member-rate',
        member,
        hourlyRate: validation.value,
      });
      setActionNotice({
        tone: 'notice',
        title:
          validation.value === null ? 'Member override cleared' : 'Member rate updated',
        body:
          validation.value === null
            ? `${member.fullName} now falls back to the hall default rate.`
            : `${member.fullName} now uses ${formatHourlyRate(validation.value)}.`,
      });
    } catch (error) {
      setActionNotice({
        tone: 'error',
        title: 'Member rate save failed',
        body: formatActionError(error, 'Could not save the member pay rate.'),
      });
    }
  }

  async function handleClearMemberRate(member: PayPolicyMember) {
    setMemberDrafts((current) => ({
      ...current,
      [member.id]: '',
    }));
    setMemberErrors((current) => ({
      ...current,
      [member.id]: null,
    }));

    try {
      await mutation.mutateAsync({
        kind: 'set-member-rate',
        member,
        hourlyRate: null,
      });
      setActionNotice({
        tone: 'notice',
        title: 'Member override cleared',
        body: `${member.fullName} now falls back to the hall default rate.`,
      });
    } catch (error) {
      setActionNotice({
        tone: 'error',
        title: 'Member rate save failed',
        body: formatActionError(error, 'Could not clear the member pay rate.'),
      });
    }
  }

  return (
    <PayPolicyFrame
      title="Pay Policy"
      subtitle="Manage the hall default hourly settings and per-member pay-rate overrides without leaving the admin shell."
    >
      <View style={styles.summaryGrid}>
        <SummaryCard
          label="Hall default"
          value={formatHourlyRate(hallPolicy?.defaultHourlyRate ?? null)}
        />
        <SummaryCard label="Overrides" value={memberOverrides} />
        <SummaryCard
          label="Overtime"
          value={hallPolicy ? `${hallPolicy.overtimeThresholdMinutes} min` : 'Not set'}
        />
        <SummaryCard
          label="Multiplier"
          value={formatMultiplier(hallPolicy?.overtimeMultiplier ?? null)}
        />
      </View>

      {actionNotice ? (
        actionNotice.tone === 'error' ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>{actionNotice.title}</Text>
            <Text selectable style={styles.errorBody}>
              {actionNotice.body}
            </Text>
          </View>
        ) : (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>{actionNotice.title}</Text>
            <Text style={styles.noticeBody}>{actionNotice.body}</Text>
          </View>
        )
      ) : null}

      {mutation.isError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Pay policy update failed</Text>
          <Text selectable style={styles.errorBody}>
            {mutation.error.message}
          </Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hall defaults</Text>
        <Text style={styles.sectionBody}>
          Save the default hourly rate, overtime threshold, and overtime
          multiplier used when a member does not have an override.
        </Text>

        {!hallPolicy ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>No hall pay policy yet</Text>
            <Text style={styles.noticeBody}>
              The first save creates the singleton hall-policy row for this
              project.
            </Text>
          </View>
        ) : null}

        <FieldGroup
          label="Default hourly rate"
          value={policyForm.defaultHourlyRate}
          onChangeText={(value) => {
            setPolicyForm((current) => ({
              ...current,
              defaultHourlyRate: value,
            }));
          }}
          error={policyErrors.defaultHourlyRate}
          helper="Used whenever a member-specific override is empty."
          keyboardType="decimal-pad"
          editable={!mutation.isPending}
          placeholder="12000"
        />

        <FieldGroup
          label="Overtime threshold (minutes)"
          value={policyForm.overtimeThresholdMinutes}
          onChangeText={(value) => {
            setPolicyForm((current) => ({
              ...current,
              overtimeThresholdMinutes: value,
            }));
          }}
          error={policyErrors.overtimeThresholdMinutes}
          helper="Minutes after which overtime pay starts."
          keyboardType="number-pad"
          editable={!mutation.isPending}
          placeholder="480"
        />

        <FieldGroup
          label="Overtime multiplier"
          value={policyForm.overtimeMultiplier}
          onChangeText={(value) => {
            setPolicyForm((current) => ({
              ...current,
              overtimeMultiplier: value,
            }));
          }}
          error={policyErrors.overtimeMultiplier}
          helper="Multiplier applied after the overtime threshold."
          keyboardType="decimal-pad"
          editable={!mutation.isPending}
          placeholder="1.5"
        />

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: mutation.isPending }}
          disabled={mutation.isPending}
          onPress={() => {
            void handleSavePolicy();
          }}
          style={[styles.primaryButton, mutation.isPending ? styles.disabledCard : null]}
        >
          <Text style={styles.primaryButtonLabel}>
            {mutation.isPending ? 'Saving hall policy...' : 'Save hall policy'}
          </Text>
          <Text style={styles.primaryButtonBody}>
            Create or update the singleton hall pay-policy row.
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Member rate overrides</Text>
        <Text style={styles.sectionBody}>
          Leave a member rate blank to fall back to the hall default hourly
          rate. Saving an empty field clears the override row.
        </Text>

        {snapshot.members.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No members available</Text>
            <Text style={styles.emptyBody}>
              Member override rows will appear here once profile rows are ready.
            </Text>
          </View>
        ) : (
          snapshot.members.map((member) => (
            <MemberRateCard
              key={member.id}
              member={member}
              defaultRate={hallPolicy?.defaultHourlyRate ?? null}
              draftValue={memberDrafts[member.id] ?? ''}
              error={memberErrors[member.id] ?? null}
              disabled={mutation.isPending}
              onChangeValue={(value) => {
                setMemberDrafts((current) => ({
                  ...current,
                  [member.id]: value,
                }));
                setMemberErrors((current) => ({
                  ...current,
                  [member.id]: null,
                }));
              }}
              onSave={() => handleSaveMemberRate(member)}
              onClear={() => handleClearMemberRate(member)}
            />
          ))
        )}
      </View>

      <FooterActions
        onBackHome={onBackHome}
        onBackMembers={onBackMembers}
        onSignOut={signOut}
      />
    </PayPolicyFrame>
  );
}

function PayPolicyFrame({ title, subtitle, children }: PayPolicyFrameProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeLabel}>ADMIN</Text>
          </View>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function FieldGroup({
  label,
  value,
  onChangeText,
  error,
  helper,
  keyboardType,
  editable,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  helper: string;
  keyboardType: 'decimal-pad' | 'number-pad';
  editable: boolean;
  placeholder: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        autoCorrect={false}
        editable={editable}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8f8a80"
        style={styles.textInput}
        value={value}
      />
      <Text style={styles.helperText}>{helper}</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function MemberRateCard({
  member,
  defaultRate,
  draftValue,
  error,
  disabled,
  onChangeValue,
  onSave,
  onClear,
}: MemberRateCardProps) {
  const effectiveRate = member.hourlyRate ?? defaultRate;

  return (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <View style={styles.memberHeading}>
          <Text style={styles.memberName}>{member.fullName}</Text>
          <Text style={styles.memberMeta}>
            {formatMemberRole(member.role)} - {formatMemberStatus(member.status)}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeLabel}>
            {member.hourlyRate === null ? 'Default' : 'Override'}
          </Text>
        </View>
      </View>

      <View style={styles.memberFacts}>
        <Text style={styles.memberFactLabel}>
          Current override: {formatHourlyRate(member.hourlyRate)}
        </Text>
        <Text style={styles.memberFactLabel}>
          Effective rate: {formatHourlyRate(effectiveRate)}
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>Member hourly rate</Text>
        <TextInput
          autoCorrect={false}
          editable={!disabled}
          keyboardType="decimal-pad"
          onChangeText={onChangeValue}
          placeholder="Leave blank to use the hall default"
          placeholderTextColor="#8f8a80"
          style={styles.textInput}
          value={draftValue}
        />
        <Text style={styles.helperText}>
          Empty value clears the override and falls back to the hall default.
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.inlineActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => {
            void onSave();
          }}
          style={[styles.inlinePrimaryButton, disabled ? styles.disabledCard : null]}
        >
          <Text style={styles.inlinePrimaryButtonLabel}>Save rate</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => {
            void onClear();
          }}
          style={[styles.inlineSecondaryButton, disabled ? styles.disabledCard : null]}
        >
          <Text style={styles.inlineSecondaryButtonLabel}>Clear override</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FooterActions({
  onBackHome,
  onBackMembers,
  onSignOut,
}: {
  onBackHome: () => void;
  onBackMembers: () => void;
  onSignOut: () => Promise<void>;
}) {
  return (
    <View style={styles.footerActions}>
      <Pressable
        accessibilityRole="button"
        onPress={onBackMembers}
        style={styles.footerButtonSecondary}
      >
        <Text style={styles.footerButtonSecondaryLabel}>Back to members</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onBackHome}
        style={styles.footerButtonSecondary}
      >
        <Text style={styles.footerButtonSecondaryLabel}>Back to home</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void onSignOut();
        }}
        style={styles.footerButtonPrimary}
      >
        <Text style={styles.footerButtonPrimaryLabel}>Sign out</Text>
      </Pressable>
    </View>
  );
}

function formatActionError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return fallback;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6efe5',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 18,
  },
  hero: {
    borderRadius: 30,
    backgroundColor: '#14342b',
    padding: 24,
    gap: 12,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#f4bb65',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroBadgeLabel: {
    color: '#14342b',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: '#fff8ef',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  heroSubtitle: {
    color: '#d7d4ce',
    fontSize: 16,
    lineHeight: 23,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    width: '48%',
    borderRadius: 22,
    backgroundColor: '#fff8ef',
    padding: 18,
    gap: 6,
  },
  summaryLabel: {
    color: '#56635d',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryValue: {
    color: '#14342b',
    fontSize: 22,
    fontWeight: '800',
  },
  section: {
    borderRadius: 24,
    backgroundColor: '#fff8ef',
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    color: '#14342b',
    fontSize: 19,
    fontWeight: '800',
  },
  sectionBody: {
    color: '#56635d',
    fontSize: 14,
    lineHeight: 20,
  },
  noticeCard: {
    borderRadius: 18,
    backgroundColor: '#d8e5de',
    padding: 14,
    gap: 4,
  },  noticeTitle: {
    color: '#14342b',
    fontSize: 14,
    fontWeight: '800',
  },
  noticeBody: {
    color: '#44514c',
    fontSize: 13,
    lineHeight: 18,
  },
  errorCard: {
    borderRadius: 20,
    backgroundColor: '#f3d2cb',
    padding: 16,
    gap: 6,
  },
  errorTitle: {
    color: '#7a2e1f',
    fontSize: 14,
    fontWeight: '800',
  },
  errorBody: {
    color: '#5b3329',
    fontSize: 14,
    lineHeight: 20,
  },
  inputGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: '#14342b',
    fontSize: 14,
    fontWeight: '700',
  },
  textInput: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d0c2ae',
    backgroundColor: '#fff8ef',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#14342b',
    fontSize: 15,
  },
  helperText: {
    color: '#56635d',
    fontSize: 12,
    lineHeight: 18,
  },
  errorText: {
    color: '#7a2e1f',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  primaryButton: {
    borderRadius: 22,
    backgroundColor: '#7a2e1f',
    padding: 18,
    gap: 6,
  },
  primaryButtonLabel: {
    color: '#fff8ef',
    fontSize: 15,
    fontWeight: '800',
  },
  primaryButtonBody: {
    color: '#f0d8cf',
    fontSize: 13,
    lineHeight: 18,
  },
  memberCard: {
    borderRadius: 20,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  memberHeading: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    color: '#14342b',
    fontSize: 16,
    fontWeight: '800',
  },
  memberMeta: {
    color: '#495550',
    fontSize: 13,
    lineHeight: 18,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#d8e5de',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeLabel: {
    color: '#14342b',
    fontSize: 12,
    fontWeight: '800',
  },
  memberFacts: {
    gap: 4,
  },
  memberFactLabel: {
    color: '#14342b',
    fontSize: 13,
    fontWeight: '700',
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 10,
  },  inlinePrimaryButton: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#7a2e1f',
    paddingVertical: 14,
    alignItems: 'center',
  },
  inlinePrimaryButtonLabel: {
    color: '#fff8ef',
    fontSize: 14,
    fontWeight: '800',
  },
  inlineSecondaryButton: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#dfcfb8',
    paddingVertical: 14,
    alignItems: 'center',
  },
  inlineSecondaryButtonLabel: {
    color: '#14342b',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyCard: {
    borderRadius: 20,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 6,
  },
  emptyTitle: {
    color: '#14342b',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyBody: {
    color: '#495550',
    fontSize: 14,
    lineHeight: 20,
  },
  disabledCard: {
    opacity: 0.45,
  },
  footerActions: {
    gap: 12,
  },
  footerButtonPrimary: {
    borderRadius: 999,
    backgroundColor: '#7a2e1f',
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerButtonSecondary: {
    borderRadius: 999,
    backgroundColor: '#dfcfb8',
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerButtonPrimaryLabel: {
    color: '#fff8ef',
    fontSize: 16,
    fontWeight: '800',
  },
  footerButtonSecondaryLabel: {
    color: '#14342b',
    fontSize: 16,
    fontWeight: '800',
  },
});