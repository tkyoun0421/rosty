import type { ReactNode } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useHomeDashboardQuery } from '@/features/home/model/home-dashboard';

type RoleHomeProps = {
  session: AuthSession;
  onOpenMembers?: () => void;
};

type HomeFrameProps = {
  badge: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

type InfoCardProps = {
  title: string;
  subtitle: string;
  meta: string;
};

type QuickActionCardProps = {
  title: string;
  detail: string;
};

type LoadingStateProps = {
  title: string;
};

export function EmployeeHomeScreen({ session }: RoleHomeProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const { data, isLoading } = useHomeDashboardQuery(session.role);

  if (isLoading || !data || data.kind !== 'employee') {
    return <HomeLoadingState title="Loading employee home" />;
  }

  return (
    <HomeFrame
      badge={session.role.toUpperCase()}
      title={session.displayName}
      subtitle={data.headline}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming assignments</Text>
        {data.upcomingAssignments.map((item) => {
          return (
            <InfoCard
              key={`${item.title}-${item.meta}`}
              title={item.title}
              subtitle={item.subtitle}
              meta={item.meta}
            />
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Open schedules</Text>
        {data.openSchedules.map((item) => {
          return (
            <InfoCard
              key={`${item.title}-${item.meta}`}
              title={item.title}
              subtitle={item.subtitle}
              meta={item.meta}
            />
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void signOut();
        }}
        style={styles.signOutButton}
      >
        <Text style={styles.signOutLabel}>Sign out</Text>
      </Pressable>
    </HomeFrame>
  );
}

export function ManagerHomeScreen({ session, onOpenMembers }: RoleHomeProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const { data, isLoading } = useHomeDashboardQuery(session.role);

  if (isLoading || !data || data.kind !== 'manager') {
    return <HomeLoadingState title="Loading operations home" />;
  }

  return (
    <HomeFrame
      badge={session.role.toUpperCase()}
      title={session.displayName}
      subtitle={data.headline}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Operations queue</Text>
        {data.operationsQueue.map((item) => {
          return (
            <InfoCard
              key={`${item.title}-${item.meta}`}
              title={item.title}
              subtitle={item.subtitle}
              meta={item.meta}
            />
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        {data.quickActions.map((item) => {
          return (
            <QuickActionCard
              key={item.title}
              title={item.title}
              detail={item.detail}
            />
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This week</Text>
        {data.weekSchedule.map((item) => {
          return (
            <InfoCard
              key={`${item.title}-${item.meta}`}
              title={item.title}
              subtitle={item.subtitle}
              meta={item.meta}
            />
          );
        })}
      </View>

      {session.role === 'admin' && onOpenMembers ? (
        <Pressable
          accessibilityRole="button"
          onPress={onOpenMembers}
          style={styles.adminActionButton}
        >
          <Text style={styles.adminActionLabel}>Open members</Text>
          <Text style={styles.adminActionDetail}>
            Review pending approvals, role changes, and blocked access.
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void signOut();
        }}
        style={styles.signOutButton}
      >
        <Text style={styles.signOutLabel}>Sign out</Text>
      </Pressable>
    </HomeFrame>
  );
}

function HomeLoadingState({ title }: LoadingStateProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#14342b" />
        <Text style={styles.loadingTitle}>{title}</Text>
      </View>
    </SafeAreaView>
  );
}

function HomeFrame({ badge, title, subtitle, children }: HomeFrameProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{badge}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({ title, subtitle, meta }: InfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoSubtitle}>{subtitle}</Text>
      <Text style={styles.infoMeta}>{meta}</Text>
    </View>
  );
}

function QuickActionCard({ title, detail }: QuickActionCardProps) {
  return (
    <View style={styles.quickActionCard}>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionDetail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6efe5',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f6efe5',
  },
  loadingTitle: {
    color: '#14342b',
    fontSize: 18,
    fontWeight: '700',
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
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#f4bb65',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeLabel: {
    color: '#14342b',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: '#fff8ef',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
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
  infoCard: {
    borderRadius: 18,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 4,
  },
  infoTitle: {
    color: '#14342b',
    fontSize: 16,
    fontWeight: '700',
  },
  infoSubtitle: {
    color: '#45524d',
    fontSize: 14,
    lineHeight: 20,
  },
  infoMeta: {
    color: '#7a2e1f',
    fontSize: 13,
    fontWeight: '700',
  },
  quickActionCard: {
    borderRadius: 18,
    backgroundColor: '#d8e5de',
    padding: 16,
    gap: 4,
  },
  quickActionTitle: {
    color: '#14342b',
    fontSize: 16,
    fontWeight: '700',
  },
  quickActionDetail: {
    color: '#44514c',
    fontSize: 14,
    lineHeight: 20,
  },
  adminActionButton: {
    borderRadius: 24,
    backgroundColor: '#d8e5de',
    padding: 18,
    gap: 6,
  },
  adminActionLabel: {
    color: '#14342b',
    fontSize: 16,
    fontWeight: '800',
  },
  adminActionDetail: {
    color: '#44514c',
    fontSize: 14,
    lineHeight: 20,
  },
  signOutButton: {
    borderRadius: 999,
    backgroundColor: '#7a2e1f',
    paddingVertical: 16,
    alignItems: 'center',
  },
  signOutLabel: {
    color: '#fff8ef',
    fontSize: 16,
    fontWeight: '800',
  },
});
