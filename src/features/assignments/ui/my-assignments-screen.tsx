import { useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useMyAssignmentsQuery } from '@/features/assignments/api/fetch-my-assignments';
import {
  filterMyAssignmentSchedules,
  formatAssignmentStatus,
  type MyAssignmentsStatusChip,
  type MyAssignmentsTab,
  type MyAssignmentSchedule,
} from '@/features/assignments/model/my-assignments';

type MyAssignmentsScreenProps = {
  session: AuthSession;
  onBackHome: () => void;
  onOpenSchedule: (scheduleId: string) => void;
};

export function MyAssignmentsScreen({
  session,
  onBackHome,
  onOpenSchedule,
}: MyAssignmentsScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const assignmentsQuery = useMyAssignmentsQuery(session.userId);
  const [tab, setTab] = useState<MyAssignmentsTab>('upcoming');
  const [statusChip, setStatusChip] =
    useState<MyAssignmentsStatusChip>('all');

  if (assignmentsQuery.isLoading || !assignmentsQuery.data) {
    return (
      <AssignmentsFrame
        title="My Assignments"
        subtitle="Loading your confirmed assignment schedules."
      >
        <NoticeCard
          title="Loading assignments"
          body="Preparing your grouped schedule assignments."
        />
      </AssignmentsFrame>
    );
  }

  const snapshot = assignmentsQuery.data;
  const filteredSchedules = filterMyAssignmentSchedules({
    snapshot,
    tab,
    status: statusChip,
  });

  return (
    <AssignmentsFrame
      title="My Assignments"
      subtitle="Review your own confirmed and follow-up assignment schedules."
    >
      <NoticeCard
        title={
          snapshot.source === 'supabase'
            ? 'Live assignments snapshot'
            : 'Seeded fallback snapshot'
        }
        body={
          snapshot.sourceMessage ??
          'My Assignments is reading the current Supabase-backed assignments snapshot.'
        }
      />

      <View style={styles.tabRow}>
        <TabButton
          active={tab === 'upcoming'}
          label={`Upcoming (${snapshot.upcoming.length})`}
          onPress={() => setTab('upcoming')}
        />
        <TabButton
          active={tab === 'past'}
          label={`Past (${snapshot.past.length})`}
          onPress={() => setTab('past')}
        />
      </View>

      <View style={styles.chipRow}>
        <ChipButton
          active={statusChip === 'all'}
          label="All"
          onPress={() => setStatusChip('all')}
        />
        <ChipButton
          active={statusChip === 'confirmed'}
          label="Confirmed"
          onPress={() => setStatusChip('confirmed')}
        />
        <ChipButton
          active={statusChip === 'cancel_requested'}
          label="Cancel requested"
          onPress={() => setStatusChip('cancel_requested')}
        />
        <ChipButton
          active={statusChip === 'cancelled'}
          label="Cancelled"
          onPress={() => setStatusChip('cancelled')}
        />
        <ChipButton
          active={statusChip === 'completed'}
          label="Completed"
          onPress={() => setStatusChip('completed')}
        />
      </View>

      <AssignmentsSection
        title={tab === 'upcoming' ? 'Upcoming schedules' : 'Past schedules'}
        body={
          tab === 'upcoming'
            ? 'Schedules on or after today.'
            : 'Completed or previous schedules.'
        }
        schedules={filteredSchedules}
        onOpenSchedule={onOpenSchedule}
        emptyTitle={
          tab === 'upcoming'
            ? 'No upcoming assignments'
            : 'No past assignments'
        }
        emptyBody="Switch the current tab or status chip to see a different subset."
      />

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
    </AssignmentsFrame>
  );
}

function AssignmentsFrame({
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

function AssignmentsSection({
  title,
  body,
  schedules,
  onOpenSchedule,
  emptyTitle,
  emptyBody,
}: {
  title: string;
  body: string;
  schedules: MyAssignmentSchedule[];
  onOpenSchedule: (scheduleId: string) => void;
  emptyTitle: string;
  emptyBody: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
      {schedules.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptyBody}>{emptyBody}</Text>
        </View>
      ) : (
        schedules.map((schedule) => (
          <Pressable
            key={schedule.scheduleId}
            accessibilityRole="button"
            onPress={() => {
              onOpenSchedule(schedule.scheduleId);
            }}
            style={styles.assignmentCard}
          >
            <View style={styles.assignmentHeader}>
              <Text style={styles.assignmentTitle}>{schedule.title}</Text>
              <Text style={styles.assignmentStatus}>
                {formatAssignmentStatus(schedule.status)}
              </Text>
            </View>
            <Text style={styles.assignmentDate}>{schedule.eventDate}</Text>
            <View style={styles.positionRow}>
              {schedule.positions.map((position) => (
                <View key={`${schedule.scheduleId}-${position}`} style={styles.positionChip}>
                  <Text style={styles.positionChipLabel}>{position}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        ))
      )}
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  emptyCard: {
    borderRadius: 18,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 4,
  },
  emptyTitle: {
    color: '#14342b',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyBody: {
    color: '#44514c',
    fontSize: 13,
    lineHeight: 18,
  },
  assignmentCard: {
    borderRadius: 18,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 8,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  assignmentTitle: {
    flex: 1,
    color: '#14342b',
    fontSize: 15,
    fontWeight: '800',
  },
  assignmentStatus: {
    color: '#7a2e1f',
    fontSize: 13,
    fontWeight: '800',
  },
  assignmentDate: {
    color: '#56635d',
    fontSize: 13,
    fontWeight: '700',
  },
  positionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionChip: {
    borderRadius: 999,
    backgroundColor: '#fff8ef',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  positionChipLabel: {
    color: '#14342b',
    fontSize: 12,
    fontWeight: '700',
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
