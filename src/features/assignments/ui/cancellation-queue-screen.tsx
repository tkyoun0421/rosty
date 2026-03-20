import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useCancellationQueueQuery } from '@/features/assignments/api/fetch-cancellation-queue';
import { useCancellationReviewMutation } from '@/features/assignments/api/use-cancellation-review-mutation';

type CancellationQueueScreenProps = {
  session: AuthSession;
  onBackHome: () => void;
};

export function CancellationQueueScreen({
  session,
  onBackHome,
}: CancellationQueueScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const queueQuery = useCancellationQueueQuery();
  const mutation = useCancellationReviewMutation();

  if (queueQuery.isLoading || !queueQuery.data) {
    return (
      <QueueFrame
        session={session}
        title="Cancellation Queue"
        subtitle="Loading pending cancellation requests."
      >
        <NoticeCard
          title="Loading queue"
          body="Preparing the current cancellation review list."
        />
      </QueueFrame>
    );
  }

  const snapshot = queueQuery.data;

  return (
    <QueueFrame
      session={session}
      title="Cancellation Queue"
      subtitle="Review employee cancellation requests and decide whether each assignment should be cancelled or restored."
    >
      <NoticeCard
        title={
          snapshot.source === 'supabase'
            ? 'Live cancellation queue'
            : 'Seeded fallback queue'
        }
        body={
          snapshot.sourceMessage ??
          'Cancellation Queue is reading the current Supabase-backed request snapshot.'
        }
      />

      {snapshot.items.length === 0 ? (
        <NoticeCard
          title="No pending requests"
          body="There are no cancellation requests waiting for review right now."
        />
      ) : (
        snapshot.items.map((item) => (
          <View key={item.requestId} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestTitle}>{item.scheduleTitle}</Text>
              <Text style={styles.requestStatus}>{item.status.toUpperCase()}</Text>
            </View>
            <Text style={styles.requestMeta}>
              {item.requesterName} · {item.positionName} · {item.eventDate}
            </Text>
            <Text style={styles.requestReason}>{item.reason}</Text>
            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                disabled={mutation.isPending}
                onPress={() => {
                  void mutation.mutateAsync({
                    requestId: item.requestId,
                    action: 'approve',
                  });
                }}
                style={[
                  styles.primaryButton,
                  mutation.isPending ? styles.disabledButton : null,
                ]}
              >
                <Text style={styles.primaryButtonLabel}>Approve</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={mutation.isPending}
                onPress={() => {
                  void mutation.mutateAsync({
                    requestId: item.requestId,
                    action: 'reject',
                  });
                }}
                style={[
                  styles.secondaryButton,
                  mutation.isPending ? styles.disabledButton : null,
                ]}
              >
                <Text style={styles.secondaryButtonLabel}>Reject</Text>
              </Pressable>
            </View>
          </View>
        ))
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
    </QueueFrame>
  );
}

function QueueFrame({
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
  requestCard: {
    borderRadius: 18,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 8,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  requestTitle: {
    flex: 1,
    color: '#14342b',
    fontSize: 16,
    fontWeight: '800',
  },
  requestStatus: {
    color: '#7a2e1f',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  requestMeta: {
    color: '#56635d',
    fontSize: 13,
    fontWeight: '700',
  },
  requestReason: {
    color: '#44514c',
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
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
