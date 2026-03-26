import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { formatAssignmentStatus } from '@/features/assignments/model/my-assignments';
import { useGlobalSearchQuery } from '@/features/search/api/fetch-global-search';
import {
  filterGlobalSearchResults,
  rankGlobalSearchResults,
  shouldShowGlobalSearchSection,
} from '@/features/search/model/global-search';
import { useGlobalSearchStore } from '@/features/search/model/global-search-store';
import {
  formatCollectionState,
  formatScheduleStatus,
} from '@/features/schedules/model/schedules';

type GlobalSearchScreenProps = {
  session: AuthSession;
  onBackHome: () => void;
};

export function GlobalSearchScreen({
  session,
  onBackHome,
}: GlobalSearchScreenProps) {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);
  const clearSearchUi = useGlobalSearchStore((state) => state.clear);
  const query = useGlobalSearchStore((state) => state.query);
  const sectionChip = useGlobalSearchStore((state) => state.sectionChip);
  const setQuery = useGlobalSearchStore((state) => state.setQuery);
  const setSectionChip = useGlobalSearchStore((state) => state.setSectionChip);
  const searchQuery = useGlobalSearchQuery(session, query);

  if (searchQuery.isLoading || !searchQuery.data) {
    return (
      <SearchFrame session={session} title="Global Search" subtitle="Loading search data.">
        <NoticeCard title="Loading search" body="Preparing schedules, assignments, and member results." />
      </SearchFrame>
    );
  }

  const snapshot = searchQuery.data;
  const schedules = rankGlobalSearchResults(
    filterGlobalSearchResults(
      snapshot.schedules,
      (schedule) =>
        `${schedule.title} ${schedule.eventDate} ${schedule.status} ${schedule.collectionState}`,
      query,
    ),
    (schedule) => schedule.title,
    (schedule) =>
      `${schedule.eventDate} ${schedule.status} ${schedule.collectionState}`,
    query,
  );
  const assignments = rankGlobalSearchResults(
    filterGlobalSearchResults(
      snapshot.assignments,
      (assignment) =>
        `${assignment.title} ${assignment.eventDate} ${assignment.positions.join(' ')} ${assignment.status}`,
      query,
    ),
    (assignment) => assignment.title,
    (assignment) =>
      `${assignment.eventDate} ${assignment.positions.join(' ')} ${assignment.status}`,
    query,
  );
  const members = rankGlobalSearchResults(
    filterGlobalSearchResults(
      snapshot.members,
      (member) => `${member.fullName} ${member.phoneNumber} ${member.role}`,
      query,
    ),
    (member) => member.fullName,
    (member) => `${member.role} ${member.phoneNumber}`,
    query,
  );

  return (
    <SearchFrame
      session={session}
      title="Global Search"
      subtitle="Search schedules, your assignments, and role-appropriate member results from one screen."
    >
      <NoticeCard
        title={
          snapshot.source === 'supabase'
            ? 'Live search snapshot'
            : 'Seeded fallback search'
        }
        body={
          snapshot.sourceMessage ??
          'Global Search is reading the current shared search snapshot.'
        }
      />

      <View style={styles.inputWrap}>
        <Text style={styles.fieldLabel}>Search</Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={setQuery}
          placeholder="Search schedules, assignments, or members"
          placeholderTextColor="#8f8a80"
          style={styles.textInput}
          value={query}
        />
      </View>

      <View style={styles.chipRow}>
        <ChipButton
          active={sectionChip === 'all'}
          label={`All (${schedules.length + assignments.length + (session.role !== 'employee' ? members.length : 0)})`}
          onPress={() => setSectionChip('all')}
        />
        <ChipButton
          active={sectionChip === 'schedules'}
          label={`Schedules (${schedules.length})`}
          onPress={() => setSectionChip('schedules')}
        />
        <ChipButton
          active={sectionChip === 'assignments'}
          label={`Assignments (${assignments.length})`}
          onPress={() => setSectionChip('assignments')}
        />
        {session.role !== 'employee' ? (
          <ChipButton
            active={sectionChip === 'members'}
            label={`Members (${members.length})`}
            onPress={() => setSectionChip('members')}
          />
        ) : null}
      </View>

      {shouldShowGlobalSearchSection(sectionChip, 'schedules') ? (
        <SearchSection title="Schedules">
          {schedules.length === 0 ? (
            <EmptyResultCard body="No schedules matched the current search view." />
          ) : (
            schedules.map((schedule) => (
              <Pressable
                key={schedule.id}
                accessibilityRole="button"
                onPress={() => {
                  router.push(`/schedule-detail?scheduleId=${encodeURIComponent(schedule.id)}` as never);
                }}
                style={styles.resultCard}
              >
                <Text style={styles.resultTitle}>{schedule.title}</Text>
                <Text style={styles.resultBody}>
                  {schedule.eventDate} · {formatScheduleStatus(schedule.status)} ·{' '}
                  {formatCollectionState(schedule.collectionState)}
                </Text>
              </Pressable>
            ))
          )}
        </SearchSection>
      ) : null}

      {shouldShowGlobalSearchSection(sectionChip, 'assignments') ? (
        <SearchSection title="My Assignments">
          {assignments.length === 0 ? (
            <EmptyResultCard body="No assignments matched the current search view." />
          ) : (
            assignments.map((assignment) => (
              <Pressable
                key={assignment.scheduleId}
                accessibilityRole="button"
                onPress={() => {
                  router.push(`/assignment-detail?scheduleId=${encodeURIComponent(assignment.scheduleId)}` as never);
                }}
                style={styles.resultCard}
              >
                <Text style={styles.resultTitle}>{assignment.title}</Text>
                <Text style={styles.resultBody}>
                  {assignment.eventDate} · {formatAssignmentStatus(assignment.status)} ·{' '}
                  {assignment.positions.join(', ')}
                </Text>
              </Pressable>
            ))
          )}
        </SearchSection>
      ) : null}

      {session.role !== 'employee' &&
      shouldShowGlobalSearchSection(sectionChip, 'members') ? (
        <SearchSection title="Members">
          {members.length === 0 ? (
            <EmptyResultCard body="No members matched the current search view." />
          ) : (
            members.map((member) => (
              <View key={member.id} style={styles.resultCard}>
                <Text style={styles.resultTitle}>{member.fullName}</Text>
                <Text style={styles.resultBody}>
                  {member.role} · {member.phoneNumber}
                </Text>
              </View>
            ))
          )}
        </SearchSection>
      ) : null}

      {sectionChip === 'all' &&
      schedules.length === 0 &&
      assignments.length === 0 &&
      (session.role === 'employee' || members.length === 0) ? (
        <NoticeCard
          title="No search results"
          body="Adjust the current query or result-type chip to see another subset."
        />
      ) : null}

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
            clearSearchUi();
            void signOut();
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonLabel}>Sign out</Text>
        </Pressable>
      </View>
    </SearchFrame>
  );
}

function SearchFrame({
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

function SearchSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function EmptyResultCard({ body }: { body: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>Nothing in this section</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
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
  inputWrap: {
    gap: 6,
  },
  fieldLabel: {
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
  emptyCard: {
    borderRadius: 18,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 4,
  },
  emptyTitle: {
    color: '#14342b',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyBody: {
    color: '#44514c',
    fontSize: 13,
    lineHeight: 18,
  },
  resultCard: {
    borderRadius: 18,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 6,
  },
  resultTitle: {
    color: '#14342b',
    fontSize: 15,
    fontWeight: '800',
  },
  resultBody: {
    color: '#44514c',
    fontSize: 13,
    lineHeight: 18,
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
});
