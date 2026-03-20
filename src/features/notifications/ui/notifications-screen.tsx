import { useState } from 'react';

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useNotificationsQuery } from '@/features/notifications/api/fetch-notifications';
import { useNotificationReadMutation } from '@/features/notifications/api/use-notification-read-mutation';
import {
  countUnreadNotifications,
  filterNotifications,
  type NotificationTab,
} from '@/features/notifications/model/notifications';

type NotificationsScreenProps = {
  session: AuthSession;
  onBackHome: () => void;
};

export function NotificationsScreen({
  session,
  onBackHome,
}: NotificationsScreenProps) {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);
  const notificationsQuery = useNotificationsQuery(session);
  const readMutation = useNotificationReadMutation(session.userId);
  const [tab, setTab] = useState<NotificationTab>('unread');

  if (notificationsQuery.isLoading || !notificationsQuery.data) {
    return (
      <NotificationsFrame
        session={session}
        title="Notifications"
        subtitle="Loading the current inbox."
      >
        <NoticeCard
          title="Loading notifications"
          body="Preparing your current in-app inbox."
        />
      </NotificationsFrame>
    );
  }

  const snapshot = notificationsQuery.data;
  const visibleItems = filterNotifications(snapshot.items, tab);
  const unreadCount = countUnreadNotifications(snapshot.items);

  async function handleOpenNotification(
    notificationId: string,
    targetRoute: string,
    isRead: boolean,
  ) {
    if (!isRead) {
      try {
        await readMutation.mutateAsync({
          notificationId,
          userId: session.userId,
        });
      } catch {
        // Keep navigation resilient even if mark-as-read fails.
      }
    }

    router.push(targetRoute as never);
  }

  return (
    <NotificationsFrame
      session={session}
      title="Notifications"
      subtitle="Review unread and recent in-app notifications from the current Rosty flows."
    >
      <NoticeCard
        title={
          snapshot.source === 'supabase'
            ? 'Live notifications inbox'
            : 'Seeded fallback inbox'
        }
        body={
          snapshot.sourceMessage ??
          'Notifications is reading the current Supabase-backed inbox.'
        }
      />

      <View style={styles.tabRow}>
        <TabButton
          active={tab === 'unread'}
          label={`Unread (${unreadCount})`}
          onPress={() => setTab('unread')}
        />
        <TabButton
          active={tab === 'all'}
          label={`All (${snapshot.items.length})`}
          onPress={() => setTab('all')}
        />
      </View>

      {visibleItems.length === 0 ? (
        <NoticeCard
          title="No notifications here"
          body={
            tab === 'unread'
              ? 'You have no unread notifications right now.'
              : 'No notifications were available in the current inbox window.'
          }
        />
      ) : (
        visibleItems.map((item) => (
          <View
            key={item.id}
            style={[
              styles.notificationCard,
              item.isRead ? styles.notificationCardRead : null,
            ]}
          >
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationBody}>{item.body}</Text>
            <View style={styles.notificationFooter}>
              <Text style={styles.notificationMeta}>
                {item.isRead ? 'Read' : 'Unread'}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void handleOpenNotification(
                    item.id,
                    item.targetRoute,
                    item.isRead,
                  );
                }}
                style={styles.openButton}
              >
                <Text style={styles.openButtonLabel}>Open</Text>
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
    </NotificationsFrame>
  );
}

function NotificationsFrame({
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
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#ded5c6',
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#14342b',
  },
  tabButtonLabel: {
    color: '#2d2720',
    fontSize: 14,
    fontWeight: '700',
  },
  tabButtonLabelActive: {
    color: '#fff8ef',
  },
  notificationCard: {
    borderRadius: 18,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 8,
  },
  notificationCardRead: {
    opacity: 0.75,
  },
  notificationTitle: {
    color: '#14342b',
    fontSize: 16,
    fontWeight: '800',
  },
  notificationBody: {
    color: '#44514c',
    fontSize: 14,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  notificationMeta: {
    color: '#7a2e1f',
    fontSize: 12,
    fontWeight: '800',
  },
  openButton: {
    borderRadius: 999,
    backgroundColor: '#14342b',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  openButtonLabel: {
    color: '#fff8ef',
    fontSize: 13,
    fontWeight: '800',
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
