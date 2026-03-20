import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useMyAvailabilityQuery } from '@/features/availability/api/fetch-my-availability';
import { useAvailabilitySubmissionMutation } from '@/features/availability/api/use-availability-submission-mutation';
import {
  canSubmitAvailability,
  formatAvailabilityResponseState,
} from '@/features/availability/model/availability-submission';
import { useScheduleDetailQuery } from '@/features/schedules/api/fetch-schedule-detail';
import {
  formatCollectionState,
  formatScheduleStatus,
} from '@/features/schedules/model/schedules';

type ScheduleDetailScreenProps = {
  session: AuthSession;
  scheduleId: string;
  onBackList: () => void;
  onOpenAvailabilityOverview?: () => void;
  onOpenAssignmentWorkspace?: () => void;
};

export function ScheduleDetailScreen({
  session,
  scheduleId,
  onBackList,
  onOpenAvailabilityOverview,
  onOpenAssignmentWorkspace,
}: ScheduleDetailScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const detailQuery = useScheduleDetailQuery(scheduleId);
  const availabilityQuery = useMyAvailabilityQuery(
    session.role === 'employee' ? scheduleId : null,
    session.role === 'employee' ? session.userId : null,
  );
  const availabilityMutation = useAvailabilitySubmissionMutation(
    scheduleId,
    session.userId,
  );

  if (detailQuery.isLoading || !detailQuery.data) {
    return (
      <DetailFrame
        session={session}
        title="Schedule Detail"
        subtitle="Loading the current schedule detail."
      >
        <NoticeCard
          title="Loading schedule detail"
          body="Preparing the selected schedule and slot details."
        />
      </DetailFrame>
    );
  }

  const snapshot = detailQuery.data;

  return (
    <DetailFrame
      session={session}
      title="Schedule Detail"
      subtitle="Review the selected event schedule before the later availability, assignment, or work-time actions land."
    >
      <NoticeCard
        title={
          snapshot.source === 'supabase'
            ? 'Live schedule detail'
            : 'Seeded fallback detail'
        }
        body={
          snapshot.sourceMessage ??
          'Schedule Detail is reading the current Supabase-backed schedule snapshot.'
        }
      />

      {!snapshot.detail ? (
        <NoticeCard
          title="Schedule not found"
          body="The selected schedule could not be found."
        />
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{snapshot.detail.title}</Text>
            <Text style={styles.sectionBody}>
              {formatScheduleStatus(snapshot.detail.status)} ·{' '}
              {formatCollectionState(snapshot.detail.collectionState)}
            </Text>
            <Text style={styles.sectionBody}>
              Packages {snapshot.detail.packageCount} · Enabled slots{' '}
              {snapshot.detail.enabledSlotCount}
            </Text>
            {snapshot.detail.memo ? (
              <Text style={styles.sectionBody}>{snapshot.detail.memo}</Text>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Slots</Text>
            <Text style={styles.sectionBody}>
              Availability, assignment workspace, and work-time actions remain later follow-ups.
            </Text>
            {snapshot.detail.slots.map((slot) => (
              <View key={slot.id} style={styles.slotCard}>
                <Text style={styles.slotTitle}>{slot.positionName}</Text>
                <Text style={styles.slotBody}>
                  Headcount {slot.headcount} · Gender {slot.requiredGender} ·{' '}
                  {slot.isEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            ))}
          </View>

          {session.role === 'employee' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My availability</Text>
              <Text style={styles.sectionBody}>
                Current response {formatAvailabilityResponseState(availabilityQuery.data?.state ?? 'not_responded')}.
              </Text>
              {canSubmitAvailability({
                role: session.role,
                scheduleStatus: snapshot.detail.status,
                collectionState: snapshot.detail.collectionState,
              }) ? (
                <View style={styles.actionRow}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={availabilityMutation.isPending}
                    onPress={() => {
                      void availabilityMutation.mutateAsync({
                        scheduleId,
                        status: 'available',
                      });
                    }}
                    style={[
                      styles.secondaryButton,
                      availabilityMutation.isPending ? styles.disabledButton : null,
                    ]}
                  >
                    <Text style={styles.secondaryButtonLabel}>Available</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={availabilityMutation.isPending}
                    onPress={() => {
                      void availabilityMutation.mutateAsync({
                        scheduleId,
                        status: 'unavailable',
                      });
                    }}
                    style={[
                      styles.secondaryButton,
                      availabilityMutation.isPending ? styles.disabledButton : null,
                    ]}
                  >
                    <Text style={styles.secondaryButtonLabel}>Unavailable</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={styles.sectionBody}>
                  Availability responses are available only while collection is open on an active schedule.
                </Text>
              )}
            </View>
          ) : onOpenAvailabilityOverview || onOpenAssignmentWorkspace ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Operator actions</Text>
              <Text style={styles.sectionBody}>
                Review availability coverage and move into the assignment workspace from the current schedule.
              </Text>
              {onOpenAvailabilityOverview ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={onOpenAvailabilityOverview}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonLabel}>Open availability overview</Text>
                </Pressable>
              ) : null}
              {onOpenAssignmentWorkspace ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={onOpenAssignmentWorkspace}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonLabel}>Open assignment workspace</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </>
      )}

      <View style={styles.footerActions}>
        <Pressable
          accessibilityRole="button"
          onPress={onBackList}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonLabel}>Back to schedules</Text>
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
    </DetailFrame>
  );
}

function DetailFrame({
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
          <Text style={styles.heroBadge}>{session.role.toUpperCase()}</Text>
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
  slotCard: {
    borderRadius: 18,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 6,
  },
  slotTitle: {
    color: '#14342b',
    fontSize: 15,
    fontWeight: '800',
  },
  slotBody: {
    color: '#44514c',
    fontSize: 13,
    lineHeight: 18,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionRow: {
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
  disabledButton: {
    opacity: 0.5,
  },
});
