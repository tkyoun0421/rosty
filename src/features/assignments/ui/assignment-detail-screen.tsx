import { useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useAssignmentDetailQuery } from '@/features/assignments/api/fetch-assignment-detail';
import { useAssignmentCancellationMutation } from '@/features/assignments/api/use-assignment-cancellation-mutation';
import {
  formatCancellationRequestStatus,
} from '@/features/assignments/model/assignment-detail';
import { formatAssignmentStatus } from '@/features/assignments/model/my-assignments';
import { useWorkTimeQuery } from '@/features/work-time/api/fetch-work-time';
import {
  formatWorkTimeStatus,
  formatWorkTimeValue,
} from '@/features/work-time/model/work-time';

type AssignmentDetailScreenProps = {
  session: AuthSession;
  scheduleId: string;
  onBackAssignments: () => void;
};

export function AssignmentDetailScreen({
  session,
  scheduleId,
  onBackAssignments,
}: AssignmentDetailScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const detailQuery = useAssignmentDetailQuery(session.userId, scheduleId);
  const workTimeQuery = useWorkTimeQuery(scheduleId);
  const mutation = useAssignmentCancellationMutation(session.userId, scheduleId);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRequestCancellation(assignmentId: string) {
    const reason = reasons[assignmentId]?.trim() ?? '';

    if (reason.length < 5) {
      setErrorMessage('Enter a cancellation reason before sending the request.');
      return;
    }

    setNotice(null);
    setErrorMessage(null);

    try {
      await mutation.mutateAsync({
        assignmentId,
        reason,
      });
      setNotice('Cancellation request submitted. The assignment now waits for review.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not create the cancellation request.',
      );
    }
  }

  if (detailQuery.isLoading || !detailQuery.data) {
    return (
      <DetailFrame
        title="Assignment Detail"
        subtitle="Loading your grouped assignment details."
      >
        <NoticeCard
          title="Loading assignment detail"
          body="Preparing the selected schedule and position details."
        />
      </DetailFrame>
    );
  }

  const { detail, source, sourceMessage } = detailQuery.data;

  return (
    <DetailFrame
      title="Assignment Detail"
      subtitle="Review the selected schedule positions and request cancellation when the rules allow it."
    >
      <NoticeCard
        title={source === 'supabase' ? 'Live assignment snapshot' : 'Seeded fallback snapshot'}
        body={
          sourceMessage ??
          'Assignment Detail is reading the current Supabase-backed assignment snapshot.'
        }
      />

      {!detail ? (
        <NoticeCard
          title="Assignment not found"
          body="This grouped assignment could not be found for the current employee."
        />
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{detail.title}</Text>
            <Text style={styles.sectionBody}>Event date {detail.eventDate}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work time</Text>
            {workTimeQuery.isLoading ? (
              <Text style={styles.sectionBody}>
                Loading the current schedule-level work time record.
              </Text>
            ) : !workTimeQuery.data?.record ? (
              <Text style={styles.sectionBody}>
                No planned or actual work time has been recorded for this
                schedule yet.
              </Text>
            ) : (
              <View style={styles.workTimeCard}>
                <Text style={styles.workTimeTitle}>
                  {formatWorkTimeStatus(workTimeQuery.data.record.status)}
                </Text>
                <Text style={styles.workTimeBody}>
                  Planned start{' '}
                  {formatWorkTimeValue(workTimeQuery.data.record.plannedStartAt)}
                </Text>
                <Text style={styles.workTimeBody}>
                  Planned end{' '}
                  {formatWorkTimeValue(workTimeQuery.data.record.plannedEndAt)}
                </Text>
                <Text style={styles.workTimeBody}>
                  Actual start{' '}
                  {formatWorkTimeValue(workTimeQuery.data.record.actualStartAt)}
                </Text>
                <Text style={styles.workTimeBody}>
                  Actual end{' '}
                  {formatWorkTimeValue(workTimeQuery.data.record.actualEndAt)}
                </Text>
              </View>
            )}
          </View>

          {notice ? <NoticeCard title="Request sent" body={notice} /> : null}
          {errorMessage ? <ErrorCard title="Request failed" body={errorMessage} /> : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned positions</Text>
            <Text style={styles.sectionBody}>
              Each position keeps its own assignment status and cancellation request state.
            </Text>
            {detail.positions.map((position) => (
              <View key={position.assignmentId} style={styles.positionCard}>
                <View style={styles.positionHeader}>
                  <Text style={styles.positionTitle}>{position.positionName}</Text>
                  <Text style={styles.positionStatus}>
                    {formatAssignmentStatus(position.status)}
                  </Text>
                </View>
                {position.cancellationRequest ? (
                  <View style={styles.requestCard}>
                    <Text style={styles.requestTitle}>
                      Request {formatCancellationRequestStatus(position.cancellationRequest.status)}
                    </Text>
                    <Text style={styles.requestBody}>{position.cancellationRequest.reason}</Text>
                  </View>
                ) : null}

                {position.canRequestCancellation ? (
                  <View style={styles.requestForm}>
                    <Text style={styles.requestHelp}>
                      Enter why you need to cancel this confirmed assignment.
                    </Text>
                    <TextInput
                      multiline
                      onChangeText={(value) => {
                        setReasons((current) => ({
                          ...current,
                          [position.assignmentId]: value,
                        }));
                      }}
                      placeholder="Family emergency came up before the event."
                      placeholderTextColor="#8f8a80"
                      style={styles.textArea}
                      value={reasons[position.assignmentId] ?? ''}
                    />
                    <Pressable
                      accessibilityRole="button"
                      disabled={mutation.isPending}
                      onPress={() => {
                        void handleRequestCancellation(position.assignmentId);
                      }}
                      style={[
                        styles.primaryButton,
                        mutation.isPending ? styles.disabledButton : null,
                      ]}
                    >
                      <Text style={styles.primaryButtonLabel}>
                        {mutation.isPending ? 'Sending request...' : 'Request cancellation'}
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.requestHelp}>
                    Cancellation requests are available only for confirmed future assignments.
                  </Text>
                )}
              </View>
            ))}
          </View>
        </>
      )}

      <View style={styles.footerActions}>
        <Pressable
          accessibilityRole="button"
          onPress={onBackAssignments}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonLabel}>Back to assignments</Text>
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

function ErrorCard({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorBody}>{body}</Text>
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
  positionCard: {
    borderRadius: 18,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 10,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  positionTitle: {
    flex: 1,
    color: '#14342b',
    fontSize: 16,
    fontWeight: '800',
  },
  positionStatus: {
    color: '#7a2e1f',
    fontSize: 13,
    fontWeight: '800',
  },
  requestCard: {
    borderRadius: 16,
    backgroundColor: '#fff8ef',
    padding: 14,
    gap: 4,
  },
  workTimeCard: {
    borderRadius: 16,
    backgroundColor: '#efe0c8',
    padding: 14,
    gap: 6,
  },
  workTimeTitle: {
    color: '#14342b',
    fontSize: 14,
    fontWeight: '800',
  },
  workTimeBody: {
    color: '#44514c',
    fontSize: 13,
    lineHeight: 18,
  },
  requestTitle: {
    color: '#14342b',
    fontSize: 13,
    fontWeight: '800',
  },
  requestBody: {
    color: '#44514c',
    fontSize: 13,
    lineHeight: 18,
  },
  requestForm: {
    gap: 8,
  },
  requestHelp: {
    color: '#56635d',
    fontSize: 13,
    lineHeight: 18,
  },
  textArea: {
    minHeight: 90,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d0c2ae',
    backgroundColor: '#fff8ef',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#14342b',
    fontSize: 14,
    textAlignVertical: 'top',
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
