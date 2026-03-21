import { useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useTeamPayrollQuery } from '@/features/payroll/api/fetch-team-payroll';
import {
  filterTeamPayrollSnapshot,
  formatEstimatedPay,
  type PayrollShiftTab,
  type TeamPayrollMemberEstimate,
} from '@/features/payroll/model/team-payroll';

type TeamPayrollScreenProps = {
  session: AuthSession;
  onBackHome: () => void;
  onOpenPayPolicy?: () => void;
};

export function TeamPayrollScreen({
  session,
  onBackHome,
  onOpenPayPolicy,
}: TeamPayrollScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const payrollQuery = useTeamPayrollQuery();
  const [tab, setTab] = useState<PayrollShiftTab>('all');

  if (payrollQuery.isLoading || !payrollQuery.data) {
    return (
      <PayrollFrame
        session={session}
        title="Team Payroll"
        subtitle="Loading the payroll estimate snapshot for the current team."
      >
        <NoticeCard
          title="Loading payroll estimates"
          body="Preparing the current estimate view for members with confirmed or completed assignments."
        />
      </PayrollFrame>
    );
  }

  if (payrollQuery.isError) {
    return (
      <PayrollFrame
        session={session}
        title="Team Payroll"
        subtitle="The payroll route loaded, but the estimate query could not finish."
      >
        <ErrorCard
          title="Payroll query failed"
          body={payrollQuery.error.message}
        />
      </PayrollFrame>
    );
  }

  const snapshot = payrollQuery.data;
  const visibleSnapshot = filterTeamPayrollSnapshot(snapshot, tab);

  return (
    <PayrollFrame
      session={session}
      title="Team Payroll"
      subtitle="Read the current team payroll estimate with the shared overtime and member-rate rules."
    >
      <NoticeCard
        title={
          snapshot.source === 'supabase'
            ? 'Live payroll snapshot'
            : 'Seeded fallback snapshot'
        }
        body={
          snapshot.sourceMessage ??
          'Team Payroll is reading the current Supabase-backed payroll snapshot.'
        }
      />

      <View style={styles.tabRow}>
        <TabButton
          active={tab === 'all'}
          label={`All (${snapshot.summary.scheduleCount})`}
          onPress={() => setTab('all')}
        />
        <TabButton
          active={tab === 'estimated'}
          label={`Estimated (${snapshot.summary.scheduleCount - snapshot.summary.missingActualTimeCount})`}
          onPress={() => setTab('estimated')}
        />
        <TabButton
          active={tab === 'pending'}
          label={`Pending (${snapshot.summary.missingActualTimeCount})`}
          onPress={() => setTab('pending')}
        />
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard
          label="Estimated payout"
          value={formatEstimatedPay(visibleSnapshot.summary.totalEstimatedPay)}
        />
        <SummaryCard
          label="Regular pay"
          value={formatEstimatedPay(visibleSnapshot.summary.regularPayTotal)}
        />
        <SummaryCard
          label="Overtime pay"
          value={formatEstimatedPay(visibleSnapshot.summary.overtimePayTotal)}
        />
        <SummaryCard
          label="Members"
          value={String(visibleSnapshot.summary.estimatedMemberCount)}
        />
        <SummaryCard
          label="Missing time"
          value={String(visibleSnapshot.summary.missingActualTimeCount)}
        />
        <SummaryCard
          label="Overtime shifts"
          value={String(visibleSnapshot.summary.overtimeShiftCount)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Policy snapshot</Text>
        <Text style={styles.sectionBody}>
          Default hourly rate {formatEstimatedPay(snapshot.policy.defaultHourlyRate)}.
          Overtime starts after {snapshot.policy.overtimeThresholdMinutes} minutes
          at {snapshot.policy.overtimeMultiplier.toFixed(2)}x.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Member estimates</Text>
        <Text style={styles.sectionBody}>
          Duplicate assignments inside the same schedule are counted once for time,
          cancelled assignments are excluded, and schedules without actual time stay pending.
        </Text>
        {visibleSnapshot.members.length === 0 ? (
          <NoticeCard
            title="No payroll items in this view"
            body="Switch the payroll tab to see a different subset of shifts."
          />
        ) : (
          visibleSnapshot.members.map((member) => (
            <MemberEstimateCard key={member.memberId} member={member} />
          ))
        )}
      </View>

      <View style={styles.footerActions}>
        {onOpenPayPolicy ? (
          <Pressable
            accessibilityRole="button"
            onPress={onOpenPayPolicy}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonLabel}>Open pay policy</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={onBackHome}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonLabel}>Back home</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void signOut();
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonLabel}>Sign out</Text>
        </Pressable>
      </View>
    </PayrollFrame>
  );
}

function PayrollFrame({
  session,
  title,
  subtitle,
  children,
}: {
  session: AuthSession;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeLabel}>{session.role.toUpperCase()}</Text>
          </View>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function NoticeCard({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.noticeCard}>
      <Text style={styles.noticeTitle}>{title}</Text>
      <Text style={styles.noticeBody}>{body}</Text>
    </View>
  );
}

function ErrorCard({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorBody}>{body}</Text>
    </View>
  );
}

function TabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.tabButton, active ? styles.tabButtonActive : null]}
    >
      <Text
        style={[styles.tabButtonLabel, active ? styles.tabButtonLabelActive : null]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function MemberEstimateCard({
  member,
}: {
  member: TeamPayrollMemberEstimate;
}) {
  return (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <View>
          <Text style={styles.memberName}>{member.fullName}</Text>
          <Text style={styles.memberMeta}>{member.role}</Text>
        </View>
        <Text style={styles.memberTotal}>
          {formatEstimatedPay(member.totalEstimatedPay)}
        </Text>
      </View>
      <Text style={styles.memberBody}>
        Estimated shifts {member.estimatedShiftCount} · Pending actual time {member.pendingScheduleCount}
      </Text>
      <Text style={styles.memberBody}>
        Regular pay {formatEstimatedPay(member.totalRegularPay)} · Overtime pay{' '}
        {formatEstimatedPay(member.totalOvertimePay)}
      </Text>
      {member.shifts.map((shift) => (
        <View key={`${member.memberId}-${shift.scheduleId}`} style={styles.shiftCard}>
          <View style={styles.shiftHeader}>
            <Text style={styles.shiftTitle}>{shift.scheduleTitle}</Text>
            <Text style={styles.shiftPay}>
              {shift.status === 'estimated'
                ? formatEstimatedPay(shift.estimatedPay)
                : 'Pending'}
            </Text>
          </View>
          <Text style={styles.shiftBody}>
            Positions {shift.positionCount} · Rate {formatEstimatedPay(shift.hourlyRate)}
          </Text>
          <Text style={styles.shiftBody}>
            Regular pay {formatEstimatedPay(shift.regularPay)} · Overtime pay{' '}
            {formatEstimatedPay(shift.overtimePay)}
          </Text>
          <Text style={styles.shiftBody}>
            {shift.status === 'estimated'
              ? `Worked ${shift.durationMinutes} min · Overtime ${shift.overtimeMinutes} min`
              : 'Actual start or end time is still missing for this schedule.'}
          </Text>
        </View>
      ))}
    </View>
  );
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
  noticeCard: {
    borderRadius: 18,
    backgroundColor: '#d8e5de',
    padding: 14,
    gap: 4,
  },
  noticeTitle: {
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
  tabRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tabButton: {
    borderRadius: 999,
    backgroundColor: '#ded5c6',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabButtonActive: {
    backgroundColor: '#14342b',
  },
  tabButtonLabel: {
    color: '#2d2720',
    fontSize: 13,
    fontWeight: '800',
  },
  tabButtonLabelActive: {
    color: '#fff8ef',
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
  memberCard: {
    borderRadius: 20,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 10,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  memberName: {
    color: '#14342b',
    fontSize: 17,
    fontWeight: '800',
  },
  memberMeta: {
    color: '#56635d',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  memberTotal: {
    color: '#7a2e1f',
    fontSize: 16,
    fontWeight: '800',
  },
  memberBody: {
    color: '#44514c',
    fontSize: 13,
    lineHeight: 18,
  },
  shiftCard: {
    borderRadius: 16,
    backgroundColor: '#fff8ef',
    padding: 14,
    gap: 6,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  shiftTitle: {
    flex: 1,
    color: '#14342b',
    fontSize: 14,
    fontWeight: '700',
  },
  shiftPay: {
    color: '#7a2e1f',
    fontSize: 13,
    fontWeight: '800',
  },
  shiftBody: {
    color: '#56635d',
    fontSize: 12,
    lineHeight: 17,
  },
  footerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  secondaryButton: {
    borderRadius: 999,
    backgroundColor: '#ded5c6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexGrow: 1,
  },
  secondaryButtonLabel: {
    color: '#2d2720',
    fontSize: 15,
    fontWeight: '800',
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: '#7a2e1f',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexGrow: 1,
  },
  primaryButtonLabel: {
    color: '#fff8ef',
    fontSize: 15,
    fontWeight: '800',
  },
});
