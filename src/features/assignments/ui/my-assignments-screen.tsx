import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useMyAssignmentsQuery } from '@/features/assignments/api/fetch-my-assignments';
import {
  formatAssignmentStatus,
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

      <AssignmentsSection
        title="Upcoming schedules"
        body="Schedules on or after today."
        schedules={snapshot.upcoming}
        onOpenSchedule={onOpenSchedule}
        emptyTitle="No upcoming assignments"
        emptyBody="Your upcoming confirmed schedules will appear here."
      />

      <AssignmentsSection
        title="Past schedules"
        body="Completed or previous schedules."
        schedules={snapshot.past}
        onOpenSchedule={onOpenSchedule}
        emptyTitle="No past assignments"
        emptyBody="Past schedules will appear here after event dates pass."
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
