import { useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useAssignmentWorkspaceQuery } from '@/features/assignments/api/fetch-assignment-workspace';
import {
  useClearAssignmentDraftMutation,
  useConfirmScheduleAssignmentsMutation,
  useSaveAssignmentDraftMutation,
} from '@/features/assignments/api/use-assignment-workspace-mutation';

type AssignmentWorkspaceScreenProps = {
  session: AuthSession;
  scheduleId: string;
  onBackDetail: () => void;
};

export function AssignmentWorkspaceScreen({
  session,
  scheduleId,
  onBackDetail,
}: AssignmentWorkspaceScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const workspaceQuery = useAssignmentWorkspaceQuery(scheduleId);
  const saveDraftMutation = useSaveAssignmentDraftMutation(scheduleId);
  const clearDraftMutation = useClearAssignmentDraftMutation(scheduleId);
  const confirmMutation = useConfirmScheduleAssignmentsMutation(scheduleId);
  const [guestDrafts, setGuestDrafts] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  if (workspaceQuery.isLoading || !workspaceQuery.data) {
    return (
      <WorkspaceFrame
        session={session}
        title="Assignment Workspace"
        subtitle="Loading the current assignment workspace."
      >
        <NoticeCard
          title="Loading workspace"
          body="Preparing slots, current drafts, and candidate lists."
        />
      </WorkspaceFrame>
    );
  }

  const snapshot = workspaceQuery.data;
  const workspace = snapshot.workspace;

  return (
    <WorkspaceFrame
      session={session}
      title="Assignment Workspace"
      subtitle="Save slot-level draft assignments and confirm the schedule when ready."
    >
      <NoticeCard
        title={
          snapshot.source === 'supabase'
            ? 'Live assignment workspace'
            : 'Seeded fallback workspace'
        }
        body={
          snapshot.sourceMessage ??
          'Assignment Workspace is reading the current Supabase-backed assignment snapshot.'
        }
      />

      {!workspace ? (
        <NoticeCard
          title="Schedule not found"
          body="The selected schedule could not be found."
        />
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{workspace.title}</Text>
            <Text style={styles.sectionBody}>
              {workspace.scheduleStatus.toUpperCase()} · {workspace.collectionState.toUpperCase()}
            </Text>
            <Text style={styles.sectionBody}>
              Missing seat count {workspace.missingRequiredSeatCount}
            </Text>
          </View>

          {workspace.slots.map((slot) => (
            <View key={slot.slotId} style={styles.slotCard}>
              {(() => {
                const openSeat = slot.seats.find((seat) => seat.assignmentId === null);

                return (
                  <>
              <Text style={styles.slotTitle}>
                {slot.positionName} · Headcount {slot.headcount}
              </Text>
              <Text style={styles.slotMeta}>
                Vacancy {slot.vacancyCount} · Gender {slot.requiredGender}
              </Text>

              {slot.seats.map((seat) => (
                <View key={`${slot.slotId}-${seat.seatIndex}`} style={styles.seatCard}>
                  <Text style={styles.seatTitle}>Seat {seat.seatIndex + 1}</Text>
                  <Text style={styles.seatBody}>
                    {seat.assigneeName
                      ? `Assigned: ${seat.assigneeName}`
                      : seat.guestName
                        ? `Guest: ${seat.guestName}`
                        : 'No draft yet'}
                  </Text>
                  <Text style={styles.seatBody}>Status {seat.status}</Text>
                  {seat.assignmentId ? (
                    <Pressable
                      accessibilityRole="button"
                      disabled={!workspace.canEdit || clearDraftMutation.isPending}
                      onPress={() => {
                        void clearDraftMutation.mutateAsync(seat.assignmentId!);
                      }}
                      style={[
                        styles.secondaryButton,
                        !workspace.canEdit || clearDraftMutation.isPending
                          ? styles.disabledButton
                          : null,
                      ]}
                    >
                      <Text style={styles.secondaryButtonLabel}>Clear seat</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))}

              <View style={styles.groupSection}>
                <Text style={styles.groupTitle}>Available candidates</Text>
                {slot.availableCandidates.map((candidate) => (
                  <Pressable
                    key={`${slot.slotId}-${candidate.userId}`}
                    accessibilityRole="button"
                    disabled={
                      !workspace.canEdit ||
                      saveDraftMutation.isPending ||
                      !openSeat
                    }
                    onPress={() => {
                      if (!openSeat) {
                        return;
                      }

                      void saveDraftMutation.mutateAsync({
                        scheduleId: workspace.scheduleId,
                        slotId: slot.slotId,
                        assignmentId: openSeat.assignmentId,
                        assigneeUserId: candidate.userId,
                        guestName: null,
                        actorUserId: session.userId,
                      });
                    }}
                    style={[
                      styles.secondaryButton,
                      !workspace.canEdit || saveDraftMutation.isPending || !openSeat
                        ? styles.disabledButton
                        : null,
                    ]}
                  >
                    <Text style={styles.secondaryButtonLabel}>
                      {candidate.fullName}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.groupSection}>
                <Text style={styles.groupTitle}>Guest draft</Text>
                <TextInput
                  onChangeText={(value) => {
                    setGuestDrafts((current) => ({
                      ...current,
                      [slot.slotId]: value,
                    }));
                  }}
                  placeholder="Guest name"
                  placeholderTextColor="#8f8a80"
                  style={styles.textInput}
                  value={guestDrafts[slot.slotId] ?? ''}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={
                    !workspace.canEdit ||
                    saveDraftMutation.isPending ||
                    !openSeat
                  }
                  onPress={() => {
                    if (!openSeat) {
                      return;
                    }

                    void saveDraftMutation.mutateAsync({
                      scheduleId: workspace.scheduleId,
                      slotId: slot.slotId,
                      assignmentId: openSeat.assignmentId,
                      assigneeUserId: null,
                      guestName: guestDrafts[slot.slotId] ?? '',
                      actorUserId: session.userId,
                    });
                  }}
                  style={[
                    styles.secondaryButton,
                    !workspace.canEdit || saveDraftMutation.isPending || !openSeat
                      ? styles.disabledButton
                      : null,
                  ]}
                >
                  <Text style={styles.secondaryButtonLabel}>Save guest draft</Text>
                </Pressable>
              </View>
                  </>
                );
              })()}
            </View>
          ))}

          {workspace.canConfirm ? (
            <Pressable
              accessibilityRole="button"
              disabled={confirmMutation.isPending}
              onPress={() => {
                void confirmMutation.mutateAsync().then(() => {
                  setNotice(
                    workspace.missingRequiredSeatCount > 0
                      ? 'The schedule was confirmed with remaining vacancies.'
                      : 'The schedule was confirmed.',
                  );
                });
              }}
              style={[
                styles.primaryButton,
                confirmMutation.isPending ? styles.disabledButton : null,
              ]}
            >
              <Text style={styles.primaryButtonLabel}>
                {confirmMutation.isPending ? 'Confirming schedule...' : 'Confirm schedule'}
              </Text>
            </Pressable>
          ) : null}
        </>
      )}

      {notice ? <NoticeCard title="Workspace updated" body={notice} /> : null}

      <View style={styles.footerActions}>
        <Pressable
          accessibilityRole="button"
          onPress={onBackDetail}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonLabel}>Back to detail</Text>
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
    </WorkspaceFrame>
  );
}

function WorkspaceFrame({
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
    borderRadius: 20,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 12,
  },
  slotTitle: {
    color: '#14342b',
    fontSize: 16,
    fontWeight: '800',
  },
  slotMeta: {
    color: '#7a2e1f',
    fontSize: 13,
    fontWeight: '800',
  },
  seatCard: {
    borderRadius: 16,
    backgroundColor: '#fff8ef',
    padding: 14,
    gap: 6,
  },
  seatTitle: {
    color: '#14342b',
    fontSize: 14,
    fontWeight: '800',
  },
  seatBody: {
    color: '#44514c',
    fontSize: 13,
    lineHeight: 18,
  },
  groupSection: {
    gap: 8,
  },
  groupTitle: {
    color: '#14342b',
    fontSize: 14,
    fontWeight: '800',
  },
  textInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d0c2ae',
    backgroundColor: '#fff8ef',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#14342b',
    fontSize: 14,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
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
  disabledButton: {
    opacity: 0.5,
  },
});
