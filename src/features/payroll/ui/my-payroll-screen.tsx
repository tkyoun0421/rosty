import { useState } from 'react';

import * as Clipboard from 'expo-clipboard';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useMyPayrollQuery } from '@/features/payroll/api/fetch-my-payroll';
import {
  createMemberPayrollCsv,
  type PayrollDateRangeChip,
  filterTeamPayrollMemberEstimate,
  formatEstimatedPay,
  type PayrollShiftTab,
} from '@/features/payroll/model/team-payroll';

type MyPayrollScreenProps = {
  session: AuthSession;
  onBackHome: () => void;
};

export function MyPayrollScreen({
  session,
  onBackHome,
}: MyPayrollScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const payrollQuery = useMyPayrollQuery(session.userId);
  const [tab, setTab] = useState<PayrollShiftTab>('all');
  const [dateRange, setDateRange] = useState<PayrollDateRangeChip>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  if (payrollQuery.isLoading || !payrollQuery.data) {
    return (
      <PayrollFrame
        title="My Payroll"
        subtitle="Loading your current payroll estimate."
      >
        <NoticeCard
          title="Loading payroll estimate"
          body="Preparing your current per-schedule payroll summary."
        />
      </PayrollFrame>
    );
  }

  const snapshot = payrollQuery.data;
  const member = snapshot.member
    ? filterTeamPayrollMemberEstimate(snapshot.member, tab, dateRange)
    : null;

  async function handleCopyExport() {
    if (!member) {
      return;
    }

    try {
      await Clipboard.setStringAsync(createMemberPayrollCsv(member));
      setExportNotice(
        'The visible personal payroll view was copied as CSV and is ready to paste.',
      );
    } catch {
      setExportNotice('Could not copy the current payroll CSV view.');
    }
  }

  return (
    <PayrollFrame
      title="My Payroll"
      subtitle="Review your current estimated pay and the recorded shift details."
    >
      <NoticeCard
        title={
          snapshot.source === 'supabase'
            ? 'Live payroll snapshot'
            : 'Seeded fallback snapshot'
        }
        body={
          snapshot.sourceMessage ??
          'My Payroll is reading the current shared payroll snapshot.'
        }
      />

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !member }}
        disabled={!member}
        onPress={() => {
          void handleCopyExport();
        }}
        style={[styles.exportButton, !member ? styles.disabledButton : null]}
      >
        <Text style={styles.exportButtonLabel}>Copy visible CSV export</Text>
        <Text style={styles.exportButtonBody}>
          Copy the currently visible personal payroll rows for review or handoff.
        </Text>
      </Pressable>

      {exportNotice ? (
        <NoticeCard title="Payroll export ready" body={exportNotice} />
      ) : null}

      {snapshot.member ? (
        <>
          <View style={styles.tabRow}>
            <TabButton
              active={tab === 'all'}
              label={`All (${snapshot.member.shifts.length})`}
              onPress={() => setTab('all')}
            />
            <TabButton
              active={tab === 'estimated'}
              label={`Estimated (${snapshot.member.estimatedShiftCount})`}
              onPress={() => setTab('estimated')}
            />
            <TabButton
              active={tab === 'pending'}
              label={`Pending (${snapshot.member.pendingScheduleCount})`}
              onPress={() => setTab('pending')}
            />
          </View>

          <View style={styles.chipRow}>
            <ChipButton
              active={dateRange === 'all'}
              label="All periods"
              onPress={() => setDateRange('all')}
            />
            <ChipButton
              active={dateRange === 'current_month'}
              label="Current month"
              onPress={() => setDateRange('current_month')}
            />
            <ChipButton
              active={dateRange === 'future_months'}
              label="Future months"
              onPress={() => setDateRange('future_months')}
            />
            <ChipButton
              active={dateRange === 'past_months'}
              label="Past months"
              onPress={() => setDateRange('past_months')}
            />
          </View>
        </>
      ) : null}

      {!member ? (
        <NoticeCard
          title="No payroll estimate yet"
          body={
            snapshot.member
              ? 'No shift estimates matched the selected payroll tab and period chip.'
              : 'Your assignments do not have enough confirmed work-time data yet for a personal estimate.'
          }
        />
      ) : (
        <>
          <View style={styles.summaryGrid}>
            <SummaryCard
              label="Estimated payout"
              value={formatEstimatedPay(member.totalEstimatedPay)}
            />
            <SummaryCard
              label="Regular pay"
              value={formatEstimatedPay(member.totalRegularPay)}
            />
            <SummaryCard
              label="Overtime pay"
              value={formatEstimatedPay(member.totalOvertimePay)}
            />
            <SummaryCard
              label="Estimated shifts"
              value={String(member.estimatedShiftCount)}
            />
            <SummaryCard
              label="Pending actual time"
              value={String(member.pendingScheduleCount)}
            />
            <SummaryCard
              label="Worked minutes"
              value={String(member.totalMinutes)}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shift estimates</Text>
            <Text style={styles.sectionBody}>
              Duplicate same-schedule assignments are counted once for time, and
              schedules without actual time stay pending.
            </Text>
            {member.shifts.map((shift) => (
              <View key={shift.scheduleId} style={styles.shiftCard}>
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
        </>
      )}

      <View style={styles.footerActions}>
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
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroBadge}>EMPLOYEE</Text>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
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

function ChipButton({
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
      style={[styles.chipButton, active ? styles.chipButtonActive : null]}
    >
      <Text
        style={[styles.chipButtonLabel, active ? styles.chipButtonLabelActive : null]}
      >
        {label}
      </Text>
    </Pressable>
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
    color: '#14342b',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  exportButton: {
    borderRadius: 18,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 6,
  },
  exportButtonLabel: {
    color: '#14342b',
    fontSize: 15,
    fontWeight: '800',
  },
  exportButtonBody: {
    color: '#56635d',
    fontSize: 13,
    lineHeight: 18,
  },
  disabledButton: {
    opacity: 0.55,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  chipButton: {
    borderRadius: 999,
    backgroundColor: '#efe0c8',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipButtonActive: {
    backgroundColor: '#7a2e1f',
  },
  chipButtonLabel: {
    color: '#5b3329',
    fontSize: 12,
    fontWeight: '800',
  },
  chipButtonLabelActive: {
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
  shiftCard: {
    borderRadius: 16,
    backgroundColor: '#efe0c8',
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
    gap: 10,
  },
  secondaryButton: {
    borderRadius: 999,
    backgroundColor: '#ded5c6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
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
    flex: 1,
  },
  primaryButtonLabel: {
    color: '#fff8ef',
    fontSize: 15,
    fontWeight: '800',
  },
});
