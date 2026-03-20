import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useScheduleListQuery } from '@/features/schedules/api/fetch-schedule-list';
import {
  formatCollectionState,
  formatScheduleStatus,
  type ScheduleListItem,
} from '@/features/schedules/model/schedules';

type ScheduleListScreenProps = {
  session: AuthSession;
  onBackHome: () => void;
};

export function ScheduleListScreen({
  session,
  onBackHome,
}: ScheduleListScreenProps) {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);
  const schedulesQuery = useScheduleListQuery();

  if (schedulesQuery.isLoading || !schedulesQuery.data) {
    return (
      <ScheduleFrame
        session={session}
        title="Schedule List"
        subtitle="Loading the current event schedule list."
      >
        <NoticeCard
          title="Loading schedules"
          body="Preparing the current schedule list."
        />
      </ScheduleFrame>
    );
  }

  const snapshot = schedulesQuery.data;

  return (
    <ScheduleFrame
      session={session}
      title="Schedule List"
      subtitle="Browse the current Rosty event schedules before deeper availability, assignment, or work-time actions."
    >
      <NoticeCard
        title={
          snapshot.source === 'supabase'
            ? 'Live schedule snapshot'
            : 'Seeded fallback snapshot'
        }
        body={
          snapshot.sourceMessage ??
          'Schedule List is reading the current Supabase-backed schedule snapshot.'
        }
      />

      {snapshot.items.map((item) => (
        <ScheduleCard
          key={item.id}
          item={item}
          onPress={() => {
            router.push(`${'/schedule-detail'}?scheduleId=${encodeURIComponent(item.id)}`);
          }}
        />
      ))}

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
    </ScheduleFrame>
  );
}

function ScheduleFrame({
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

function ScheduleCard({
  item,
  onPress,
}: {
  item: ScheduleListItem;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardMeta}>{formatScheduleStatus(item.status)}</Text>
      </View>
      <Text style={styles.cardBody}>
        {formatCollectionState(item.collectionState)} · Enabled slots {item.enabledSlotCount}
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
  card: {
    borderRadius: 18,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    color: '#14342b',
    fontSize: 16,
    fontWeight: '800',
  },
  cardMeta: {
    color: '#7a2e1f',
    fontSize: 13,
    fontWeight: '800',
  },
  cardBody: {
    color: '#44514c',
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
    flex: 1,
  },
  primaryButtonLabel: {
    color: '#fff8ef',
    fontSize: 15,
    fontWeight: '800',
  },
});
