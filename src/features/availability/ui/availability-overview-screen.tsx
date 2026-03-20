import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useAvailabilityOverviewQuery } from '@/features/availability/api/fetch-availability-overview';
import { formatAvailabilityOverviewResponseState } from '@/features/availability/model/availability-overview';

type AvailabilityOverviewScreenProps = {
  session: AuthSession;
  scheduleId: string;
  onBackDetail: () => void;
  onOpenWorkspace?: () => void;
};

export function AvailabilityOverviewScreen({
  session,
  scheduleId,
  onBackDetail,
  onOpenWorkspace,
}: AvailabilityOverviewScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const overviewQuery = useAvailabilityOverviewQuery(scheduleId);

  if (overviewQuery.isLoading || !overviewQuery.data) {
    return (
      <OverviewFrame
        session={session}
        title="Availability Overview"
        subtitle="Loading current candidate responses."
      >
        <NoticeCard
          title="Loading availability overview"
          body="Preparing slot-by-slot candidate coverage."
        />
      </OverviewFrame>
    );
  }

  const snapshot = overviewQuery.data;

  return (
    <OverviewFrame
      session={session}
      title="Availability Overview"
      subtitle="Review available, unavailable, and missing responses by slot before assignment work begins."
    >
      <NoticeCard
        title={
          snapshot.source === 'supabase'
            ? 'Live availability overview'
            : 'Seeded fallback overview'
        }
        body={
          snapshot.sourceMessage ??
          'Availability Overview is reading the current Supabase-backed candidate snapshot.'
        }
      />

      {!snapshot.overview ? (
        <NoticeCard
          title="Schedule not found"
          body="The selected schedule could not be found."
        />
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{snapshot.overview.title}</Text>
            <Text style={styles.sectionBody}>
              {snapshot.overview.collectionState.toUpperCase()} · {snapshot.overview.scheduleStatus.toUpperCase()}
            </Text>
          </View>

      {snapshot.overview.slots.map((slot) => (
        <View key={slot.slotId} style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <Text style={styles.slotTitle}>{slot.positionName}</Text>
                <Text style={styles.slotMeta}>
                  Headcount {slot.headcount} · Vacancy {slot.vacancyCount}
                </Text>
              </View>
              <Text style={styles.sectionBody}>
                Gender {slot.requiredGender}
              </Text>

              <View style={styles.groupSection}>
                <Text style={styles.groupTitle}>Available</Text>
                {slot.availableCandidates.length === 0 ? (
                  <Text style={styles.groupEmpty}>No matching available candidates yet.</Text>
                ) : (
                  slot.availableCandidates.map((candidate) => (
                    <Text key={candidate.userId} style={styles.candidateRow}>
                      {candidate.fullName} · {candidate.gender}
                    </Text>
                  ))
                )}
              </View>

              <View style={styles.groupSection}>
                <Text style={styles.groupTitle}>Support</Text>
                {slot.supportCandidates.length === 0 ? (
                  <Text style={styles.groupEmpty}>No support candidates in this slot.</Text>
                ) : (
                  slot.supportCandidates.map((candidate) => (
                    <Text key={candidate.userId} style={styles.candidateRow}>
                      {candidate.fullName} · {candidate.gender} ·{' '}
                      {formatAvailabilityOverviewResponseState(candidate.responseState)}
                    </Text>
                  ))
                )}
              </View>
        </View>
      ))}

      {onOpenWorkspace ? (
        <Pressable
          accessibilityRole="button"
          onPress={onOpenWorkspace}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonLabel}>Open assignment workspace</Text>
        </Pressable>
      ) : null}
        </>
      )}

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
    </OverviewFrame>
  );
}

function OverviewFrame({
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
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  slotTitle: {
    flex: 1,
    color: '#14342b',
    fontSize: 16,
    fontWeight: '800',
  },
  slotMeta: {
    color: '#7a2e1f',
    fontSize: 13,
    fontWeight: '800',
  },
  groupSection: {
    gap: 6,
  },
  groupTitle: {
    color: '#14342b',
    fontSize: 14,
    fontWeight: '800',
  },
  groupEmpty: {
    color: '#56635d',
    fontSize: 13,
    lineHeight: 18,
  },
  candidateRow: {
    color: '#44514c',
    fontSize: 13,
    lineHeight: 18,
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
