import type { ReactNode } from 'react';

import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { DemoAuthPreset } from '@/features/auth/model/auth-types';

type AuthLoadingScreenProps = {
  title: string;
  body: string;
};

type AuthFrameProps = {
  eyebrow: string;
  title: string;
  body: string;
  children: ReactNode;
};

type ActionButtonProps = {
  label: string;
  detail: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary';
};

const demoPresets: {
  preset: DemoAuthPreset;
  title: string;
  detail: string;
}[] = [
  {
    preset: 'employee-new',
    title: 'New employee demo',
    detail: 'Starts in the profile-incomplete state.',
  },
  {
    preset: 'employee-pending',
    title: 'Pending approval',
    detail: 'Shows the waiting screen after profile setup.',
  },
  {
    preset: 'employee-active',
    title: 'Active employee',
    detail: 'Jumps straight to the employee home dashboard.',
  },
  {
    preset: 'manager-active',
    title: 'Active manager',
    detail: 'Opens the operations queue home screen.',
  },
  {
    preset: 'admin-active',
    title: 'Active admin',
    detail: 'Shares the manager home shape with an admin badge.',
  },
  {
    preset: 'employee-suspended',
    title: 'Suspended user',
    detail: 'Verifies the blocked-access guidance screen.',
  },
];

export function AuthLoadingScreen({ title, body }: AuthLoadingScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#7a2e1f" size="large" />
        <Text style={styles.loadingTitle}>{title}</Text>
        <Text style={styles.loadingBody}>{body}</Text>
      </View>
    </SafeAreaView>
  );
}

export function LoginScreen() {
  const signInWithDemo = useAuthStore((state) => state.signInWithDemo);

  return (
    <AuthFrame
      eyebrow="Auth Shell"
      title="Rosty Sign In"
      body="Until Google OAuth is wired, this shell uses role-specific demo sessions. Each persona routes through profile setup, approval waiting, suspended, or the correct home screen."
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demo entry points</Text>
        {demoPresets.map((demoPreset) => {
          return (
            <ActionButton
              key={demoPreset.preset}
              label={demoPreset.title}
              detail={demoPreset.detail}
              onPress={() => signInWithDemo(demoPreset.preset)}
            />
          );
        })}
      </View>
    </AuthFrame>
  );
}

export function ProfileSetupScreen() {
  const session = useAuthStore((state) => state.session);
  const completeProfile = useAuthStore((state) => state.completeProfile);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <AuthFrame
      eyebrow="Profile Setup"
      title="Complete your profile"
      body="First-time users cannot enter the main app until the required profile fields are complete. This placeholder focuses on the locked route and transition rules."
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{session?.displayName ?? 'New user'} checklist</Text>
        <View style={styles.checklistCard}>
          <Text style={styles.checkItem}>- Confirm name and contact details</Text>
          <Text style={styles.checkItem}>- Verify invite or hall membership context</Text>
          <Text style={styles.checkItem}>- Review baseline work-role details</Text>
        </View>
      </View>
      <View style={styles.actionsRow}>
        <ActionButton label="Profile complete" detail="Moves this user into the approval waiting state." onPress={completeProfile} />
        <ActionButton label="Sign out" detail="Returns to the login screen." onPress={signOut} tone="secondary" />
      </View>
    </AuthFrame>
  );
}

export function ApprovalWaitingScreen() {
  const session = useAuthStore((state) => state.session);
  const approveAccess = useAuthStore((state) => state.approveAccess);
  const suspendAccess = useAuthStore((state) => state.suspendAccess);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <AuthFrame
      eyebrow="Approval Waiting"
      title="Approval pending"
      body="Users in this state cannot open home, schedule, assignment, or payroll screens. The route remains locked until approval or suspension changes the status."
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{session?.displayName ?? 'Pending user'} status</Text>
        <View style={styles.checklistCard}>
          <Text style={styles.checkItem}>- Status: pending_approval</Text>
          <Text style={styles.checkItem}>- Role: {session?.role ?? 'employee'}</Text>
          <Text style={styles.checkItem}>- Next step: admin approval for role home access</Text>
        </View>
      </View>
      <View style={styles.actionsRow}>
        <ActionButton label="Approve demo" detail="Switches to active and routes to the correct home." onPress={approveAccess} />
        <ActionButton label="Suspend demo" detail="Switches to the suspended guidance screen." onPress={suspendAccess} tone="secondary" />
        <ActionButton label="Sign out" detail="Returns to the login screen." onPress={signOut} tone="secondary" />
      </View>
    </AuthFrame>
  );
}

export function SuspendedScreen() {
  const reactivateAccess = useAuthStore((state) => state.reactivateAccess);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <AuthFrame
      eyebrow="Suspended"
      title="Access is temporarily paused"
      body="Suspended users keep a session but cannot enter the main operating flows. This screen keeps the blocked state explicit and only exposes safe exit actions."
    >
      <View style={styles.actionsRow}>
        <ActionButton label="Reactivate demo" detail="Returns the user to active access for verification." onPress={reactivateAccess} />
        <ActionButton label="Sign out" detail="Ends the session and returns to login." onPress={signOut} tone="secondary" />
      </View>
    </AuthFrame>
  );
}

function AuthFrame({ eyebrow, title, body, children }: AuthFrameProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ label, detail, onPress, tone = 'primary' }: ActionButtonProps) {
  const containerStyle = tone === 'primary' ? styles.primaryButton : styles.secondaryButton;
  const labelStyle = tone === 'primary' ? styles.primaryButtonLabel : styles.secondaryButtonLabel;
  const detailStyle = tone === 'primary' ? styles.primaryButtonDetail : styles.secondaryButtonDetail;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={detailStyle}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4ecdf',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
    backgroundColor: '#f4ecdf',
  },
  loadingTitle: {
    color: '#17362c',
    fontSize: 22,
    fontWeight: '800',
  },
  loadingBody: {
    color: '#56635d',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 18,
  },
  hero: {
    borderRadius: 30,
    backgroundColor: '#17362c',
    padding: 24,
    gap: 10,
  },
  eyebrow: {
    color: '#f1b963',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff7ee',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  body: {
    color: '#d7d3ca',
    fontSize: 16,
    lineHeight: 23,
  },
  section: {
    borderRadius: 24,
    backgroundColor: '#fff8f0',
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    color: '#17362c',
    fontSize: 19,
    fontWeight: '800',
  },
  checklistCard: {
    borderRadius: 20,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 8,
  },
  checkItem: {
    color: '#4e5955',
    fontSize: 15,
    lineHeight: 21,
  },
  actionsRow: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 22,
    backgroundColor: '#7a2e1f',
    padding: 18,
    gap: 6,
  },
  secondaryButton: {
    borderRadius: 22,
    backgroundColor: '#dfcfb8',
    padding: 18,
    gap: 6,
  },
  primaryButtonLabel: {
    color: '#fff8f0',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButtonLabel: {
    color: '#17362c',
    fontSize: 16,
    fontWeight: '800',
  },
  primaryButtonDetail: {
    color: '#f0d8cf',
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryButtonDetail: {
    color: '#495550',
    fontSize: 14,
    lineHeight: 20,
  },
});
