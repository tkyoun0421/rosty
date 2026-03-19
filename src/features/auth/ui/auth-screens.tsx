import { useEffect, useState, type ReactNode } from 'react';

import { useLocalSearchParams } from 'expo-router';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileSetupMutation } from '@/features/auth/api/use-profile-setup-mutation';
import { useAuthStore } from '@/features/auth/model/auth-store';
import { useInvitationJoinQuery } from '@/features/invitations/api/fetch-invitation-join';
import {
  canCompleteEmployeeJoin,
  getInvitationJoinMessage,
  requiresEmployeeInvitation,
  resolveInvitationTokenParam,
} from '@/features/invitations/model/invitation-join';
import { getInvitationLinkState } from '@/features/invitations/model/invitation-management';
import {
  createInitialProfileSetupValues,
  profileGenderOptions,
  validateProfileSetup,
  type ProfileSetupFieldErrors,
  type ProfileSetupFormValues,
} from '@/features/auth/model/profile-setup';
import type {
  DemoAuthPreset,
  ProfileGender,
} from '@/features/auth/model/auth-types';
import { publicEnv } from '@/shared/config/env';
import { hasSupabaseConfig } from '@/shared/lib/supabase/client';

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
  disabled?: boolean;
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
  const params = useLocalSearchParams<{ invite?: string | string[] }>();
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signInWithDemo = useAuthStore((state) => state.signInWithDemo);
  const clearError = useAuthStore((state) => state.clearError);
  const setPendingInvitationToken = useAuthStore(
    (state) => state.setPendingInvitationToken,
  );
  const pendingInvitationToken = useAuthStore(
    (state) => state.pendingInvitationToken,
  );
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const errorMessage = useAuthStore((state) => state.errorMessage);

  const routeInvitationToken = resolveInvitationTokenParam(params.invite);
  const invitationToken = routeInvitationToken ?? pendingInvitationToken;
  const invitationQuery = useInvitationJoinQuery(invitationToken);
  const invitationState = invitationQuery.data
    ? getInvitationLinkState(invitationQuery.data)
    : null;
  const showDemoFallback =
    !hasSupabaseConfig || publicEnv.appEnv !== 'production';
  const inviteGateBlocked =
    !!invitationToken &&
    (!hasSupabaseConfig ||
      invitationQuery.isLoading ||
      invitationQuery.isError ||
      invitationState !== 'active');

  useEffect(() => {
    if (routeInvitationToken) {
      setPendingInvitationToken(routeInvitationToken);
    }
  }, [routeInvitationToken, setPendingInvitationToken]);

  return (
    <AuthFrame
      eyebrow="Auth Shell"
      title="Rosty Sign In"
      body="This build now prefers a real Supabase-backed Google OAuth session. When local auth config is missing, the shell still exposes demo personas so route gating work can continue."
    >
      {invitationToken ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee invitation</Text>
          <Text style={styles.sectionBody}>
            Employee onboarding keeps this invite token through Google sign-in
            and checks it again before profile submission.
          </Text>
          {!hasSupabaseConfig ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Invite validation unavailable</Text>
              <Text style={styles.noticeBody}>
                Fill the local Supabase env before testing employee invite
                onboarding in this build.
              </Text>
            </View>
          ) : invitationQuery.isLoading ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Checking invitation</Text>
              <Text style={styles.noticeBody}>
                Validating that this employee invite link is still active.
              </Text>
            </View>
          ) : invitationQuery.isError ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Invitation check failed</Text>
              <Text style={styles.errorBody}>{invitationQuery.error.message}</Text>
            </View>
          ) : invitationQuery.data && invitationState === 'active' ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Invitation ready</Text>
              <Text style={styles.noticeBody}>
                This employee invite is valid until{' '}
                {formatTimestamp(invitationQuery.data.expiresAt)}.
              </Text>
            </View>
          ) : (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Invitation blocked</Text>
              <Text style={styles.errorBody}>
                {getInvitationJoinMessage(
                  invitationToken,
                  invitationQuery.data ?? null,
                )}
              </Text>
            </View>
          )}
        </View>
      ) : null}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Google OAuth</Text>
        <Text style={styles.sectionBody}>
          {hasSupabaseConfig
            ? 'Start the real Google sign-in flow and let Supabase restore the session on the next app launch.'
            : 'Supabase auth is not configured in this local environment yet. Fill the local env and Supabase redirect settings to enable the real Google flow.'}
        </Text>
        <ActionButton
          label={isAuthenticating ? 'Signing in...' : 'Continue with Google'}
          detail={
            !hasSupabaseConfig
              ? 'Unavailable until Supabase auth env is configured locally.'
              : inviteGateBlocked
                ? 'Employee onboarding stays locked until this invite link is valid.'
                : 'Opens a secure Google OAuth session and exchanges the callback code with Supabase.'
          }
          onPress={() => {
            clearError();
            void signInWithGoogle(invitationToken);
          }}
          disabled={!hasSupabaseConfig || isAuthenticating || inviteGateBlocked}
        />
        {errorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Sign-in error</Text>
            <Text style={styles.errorBody}>{errorMessage}</Text>
          </View>
        ) : null}
      </View>
      {showDemoFallback ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local demo fallback</Text>
          <Text style={styles.sectionBody}>
            These entries stay available outside production so route and role
            screens can still be checked without a live auth provider.
          </Text>
          {demoPresets.map((demoPreset) => {
            return (
              <ActionButton
                key={demoPreset.preset}
                label={demoPreset.title}
                detail={demoPreset.detail}
                onPress={() => {
                  clearError();
                  signInWithDemo(demoPreset.preset);
                }}
                tone="secondary"
              />
            );
          })}
        </View>
      ) : null}
    </AuthFrame>
  );
}
export function ProfileSetupScreen() {
  const params = useLocalSearchParams<{ invite?: string | string[] }>();
  const session = useAuthStore((state) => state.session);
  const authSource = useAuthStore((state) => state.authSource);
  const pendingInvitationToken = useAuthStore(
    (state) => state.pendingInvitationToken,
  );
  const setPendingInvitationToken = useAuthStore(
    (state) => state.setPendingInvitationToken,
  );
  const completeProfile = useAuthStore((state) => state.completeProfile);
  const signOut = useAuthStore((state) => state.signOut);
  const routeInvitationToken = resolveInvitationTokenParam(params.invite);
  const invitationToken = routeInvitationToken ?? pendingInvitationToken;
  const requiresInvitation =
    authSource === 'supabase' && requiresEmployeeInvitation(session);
  const invitationQuery = useInvitationJoinQuery(
    invitationToken,
    requiresInvitation,
  );
  const invitationState = invitationQuery.data
    ? getInvitationLinkState(invitationQuery.data)
    : null;
  const canSubmitWithInvitation = canCompleteEmployeeJoin(
    session,
    invitationToken,
    invitationQuery.data ?? null,
  );
  const mutation = useProfileSetupMutation(
    authSource === 'supabase' ? session : null,
    authSource === 'supabase' ? invitationToken : null,
  );

  const [formValues, setFormValues] = useState<ProfileSetupFormValues>(() =>
    createInitialProfileSetupValues(session?.displayName),
  );
  const [fieldErrors, setFieldErrors] = useState<ProfileSetupFieldErrors>({});

  useEffect(() => {
    if (routeInvitationToken) {
      setPendingInvitationToken(routeInvitationToken);
    }
  }, [routeInvitationToken, setPendingInvitationToken]);

  useEffect(() => {
    setFormValues((current) => {
      if (current.fullName.trim().length > 0) {
        return current;
      }

      return {
        ...current,
        ...createInitialProfileSetupValues(session?.displayName),
      };
    });
  }, [session?.displayName]);

  const clearFieldError = (field: keyof ProfileSetupFieldErrors) => {
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    if (mutation.isError) {
      mutation.reset();
    }
  };

  const handleFullNameChange = (value: string) => {
    clearFieldError('fullName');
    setFormValues((current) => ({
      ...current,
      fullName: value,
    }));
  };

  const handlePhoneNumberChange = (value: string) => {
    clearFieldError('phoneNumber');
    setFormValues((current) => ({
      ...current,
      phoneNumber: value,
    }));
  };

  const handleGenderChange = (value: ProfileGender) => {
    clearFieldError('gender');
    setFormValues((current) => ({
      ...current,
      gender: value,
    }));
  };

  const handleSubmitProfile = () => {
    if (
      requiresInvitation &&
      (invitationQuery.isLoading ||
        invitationQuery.isError ||
        !canSubmitWithInvitation)
    ) {
      return;
    }

    const validation = validateProfileSetup(formValues);

    if (!validation.success) {
      setFieldErrors(validation.fieldErrors);
      return;
    }

    mutation.mutate(validation.data);
  };

  return (
    <AuthFrame
      eyebrow="Profile Setup"
      title="Complete your profile"
      body="Users remain blocked here until the required profile path is complete. Real Supabase sessions can now submit the first profile record, while the local demo flow still exposes state transitions for route verification."
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {session?.displayName ?? 'New user'} checklist
        </Text>
        <View style={styles.checklistCard}>
          <Text style={styles.checkItem}>
            - Confirm name and contact details
          </Text>
          <Text style={styles.checkItem}>
            - Review the baseline personal profile fields
          </Text>
          <Text style={styles.checkItem}>
            - Submit the profile and wait for admin approval
          </Text>
        </View>
      </View>
      {authSource === 'demo' ? (
        <View style={styles.actionsRow}>
          <ActionButton
            label="Profile complete"
            detail="Moves this demo user into the approval waiting state."
            onPress={completeProfile}
          />
          <ActionButton
            label="Sign out"
            detail="Returns to the login screen."
            onPress={() => {
              void signOut();
            }}
            tone="secondary"
          />
        </View>
      ) : (
        <View style={styles.actionsRow}>
          {requiresInvitation ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Employee invitation</Text>
              <Text style={styles.sectionBody}>
                This onboarding flow stays locked until the employee invite link
                is valid and unused.
              </Text>
              {!invitationToken ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorTitle}>Invitation required</Text>
                  <Text style={styles.errorBody}>
                    {getInvitationJoinMessage(null, null)}
                  </Text>
                </View>
              ) : invitationQuery.isLoading ? (
                <View style={styles.noticeCard}>
                  <Text style={styles.noticeTitle}>Checking invitation</Text>
                  <Text style={styles.noticeBody}>
                    Validating the employee invite link before profile
                    submission opens.
                  </Text>
                </View>
              ) : invitationQuery.isError ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorTitle}>Invitation check failed</Text>
                  <Text style={styles.errorBody}>{invitationQuery.error.message}</Text>
                </View>
              ) : invitationQuery.data && invitationState === 'active' ? (
                <View style={styles.noticeCard}>
                  <Text style={styles.noticeTitle}>Invitation ready</Text>
                  <Text style={styles.noticeBody}>
                    This employee invite stays valid until{' '}
                    {formatTimestamp(invitationQuery.data.expiresAt)}.
                  </Text>
                </View>
              ) : (
                <View style={styles.errorCard}>
                  <Text style={styles.errorTitle}>Invitation blocked</Text>
                  <Text style={styles.errorBody}>
                    {getInvitationJoinMessage(
                      invitationToken,
                      invitationQuery.data ?? null,
                    )}
                  </Text>
                </View>
              )}
            </View>
          ) : null}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required profile fields</Text>
            <Text style={styles.sectionBody}>
              {requiresInvitation
                ? 'This submission writes your `profiles` record, consumes the current employee invite, and moves the app state to `pending_approval`.'
                : 'This submission writes your `profiles` record and moves the app state to `pending_approval`.'}
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Full name</Text>
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                editable={!mutation.isPending}
                onChangeText={handleFullNameChange}
                placeholder="Mina Staff"
                placeholderTextColor="#8f8a80"
                style={styles.textInput}
                value={formValues.fullName}
              />
              {fieldErrors.fullName ? (
                <Text style={styles.errorText}>{fieldErrors.fullName}</Text>
              ) : null}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Phone number</Text>
              <TextInput
                autoCorrect={false}
                editable={!mutation.isPending}
                keyboardType="phone-pad"
                onChangeText={handlePhoneNumberChange}
                placeholder="010-1234-5678"
                placeholderTextColor="#8f8a80"
                style={styles.textInput}
                value={formValues.phoneNumber}
              />
              <Text style={styles.helperText}>
                Digits, spaces, and dashes are allowed. Only digits are stored.
              </Text>
              {fieldErrors.phoneNumber ? (
                <Text style={styles.errorText}>{fieldErrors.phoneNumber}</Text>
              ) : null}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.choiceRow}>
                {profileGenderOptions.map((option) => {
                  const isSelected = formValues.gender === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      disabled={mutation.isPending}
                      onPress={() => handleGenderChange(option.value)}
                      style={
                        isSelected
                          ? [styles.choiceChip, styles.choiceChipActive]
                          : styles.choiceChip
                      }
                    >
                      <Text
                        style={
                          isSelected
                            ? [styles.choiceText, styles.choiceTextActive]
                            : styles.choiceText
                        }
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {fieldErrors.gender ? (
                <Text style={styles.errorText}>{fieldErrors.gender}</Text>
              ) : null}
            </View>
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>What happens next</Text>
              <Text style={styles.noticeBody}>
                After submission, this account stays signed in but moves to the
                approval waiting route until an admin activates it.
                {requiresInvitation
                  ? ' The invite link is marked used as part of this handoff.'
                  : ''}
              </Text>
            </View>
            {mutation.isError ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>Profile submission failed</Text>
                <Text style={styles.errorBody}>{mutation.error.message}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.actionsRow}>
            <ActionButton
              label={
                mutation.isPending ? 'Submitting profile...' : 'Submit profile'
              }
              detail={
                requiresInvitation && !canSubmitWithInvitation
                  ? 'Open a valid employee invitation link before submitting your profile.'
                  : requiresInvitation
                    ? 'Creates your profile row, consumes the invite link, then routes to approval waiting.'
                    : 'Creates or updates your profile row, then routes to approval waiting.'
              }
              onPress={handleSubmitProfile}
              disabled={
                mutation.isPending ||
                (requiresInvitation &&
                  (invitationQuery.isLoading ||
                    invitationQuery.isError ||
                    !canSubmitWithInvitation))
              }
            />
            <ActionButton
              label="Sign out"
              detail="Ends the session and returns to login."
              onPress={() => {
                void signOut();
              }}
              tone="secondary"
              disabled={mutation.isPending}
            />
          </View>
        </View>
      )}
    </AuthFrame>
  );
}

export function ApprovalWaitingScreen() {
  const session = useAuthStore((state) => state.session);
  const authSource = useAuthStore((state) => state.authSource);
  const approveAccess = useAuthStore((state) => state.approveAccess);
  const suspendAccess = useAuthStore((state) => state.suspendAccess);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <AuthFrame
      eyebrow="Approval Waiting"
      title="Approval pending"
      body="Users in this state cannot open home, schedule, assignment, or payroll screens. The route stays locked until approval or suspension changes the status."
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {session?.displayName ?? 'Pending user'} status
        </Text>
        <View style={styles.checklistCard}>
          <Text style={styles.checkItem}>- Status: pending_approval</Text>
          <Text style={styles.checkItem}>
            - Role: {session?.role ?? 'employee'}
          </Text>
          <Text style={styles.checkItem}>
            - Next step: admin approval for role home access
          </Text>
        </View>
      </View>
      {authSource === 'demo' ? (
        <View style={styles.actionsRow}>
          <ActionButton
            label="Approve demo"
            detail="Switches to active and routes to the correct home."
            onPress={approveAccess}
          />
          <ActionButton
            label="Suspend demo"
            detail="Switches to the suspended guidance screen."
            onPress={suspendAccess}
            tone="secondary"
          />
          <ActionButton
            label="Sign out"
            detail="Returns to the login screen."
            onPress={() => {
              void signOut();
            }}
            tone="secondary"
          />
        </View>
      ) : (
        <View style={styles.actionsRow}>
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Waiting for admin review</Text>
            <Text style={styles.noticeBody}>
              This screen is now backed by the real session state. Approval
              still depends on the profiles record being updated by an admin
              path.
            </Text>
          </View>
          <ActionButton
            label="Sign out"
            detail="Ends the real session and returns to login."
            onPress={() => {
              void signOut();
            }}
            tone="secondary"
          />
        </View>
      )}
    </AuthFrame>
  );
}

export function SuspendedScreen() {
  const authSource = useAuthStore((state) => state.authSource);
  const reactivateAccess = useAuthStore((state) => state.reactivateAccess);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <AuthFrame
      eyebrow="Suspended"
      title="Access is temporarily paused"
      body="Suspended users keep a session but cannot enter the main operating flows. This screen keeps the blocked state explicit and only exposes safe exit actions."
    >
      {authSource === 'demo' ? (
        <View style={styles.actionsRow}>
          <ActionButton
            label="Reactivate demo"
            detail="Returns the user to active access for verification."
            onPress={reactivateAccess}
          />
          <ActionButton
            label="Sign out"
            detail="Ends the session and returns to login."
            onPress={() => {
              void signOut();
            }}
            tone="secondary"
          />
        </View>
      ) : (
        <View style={styles.actionsRow}>
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Access remains blocked</Text>
            <Text style={styles.noticeBody}>
              A real suspended session can only be reactivated from the
              management side once the user status changes back to active.
            </Text>
          </View>
          <ActionButton
            label="Sign out"
            detail="Ends the session and returns to login."
            onPress={() => {
              void signOut();
            }}
            tone="secondary"
          />
        </View>
      )}
    </AuthFrame>
  );
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return 'Not recorded';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return `${parsed.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
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

function ActionButton({
  label,
  detail,
  onPress,
  tone = 'primary',
  disabled = false,
}: ActionButtonProps) {
  const containerStyle =
    tone === 'primary'
      ? [styles.primaryButton, disabled ? styles.disabledButton : null]
      : [styles.secondaryButton, disabled ? styles.disabledButton : null];
  const labelStyle =
    tone === 'primary'
      ? styles.primaryButtonLabel
      : styles.secondaryButtonLabel;
  const detailStyle =
    tone === 'primary'
      ? styles.primaryButtonDetail
      : styles.secondaryButtonDetail;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={containerStyle}
    >
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
  sectionBody: {
    color: '#56635d',
    fontSize: 15,
    lineHeight: 22,
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
  inputGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: '#17362c',
    fontSize: 14,
    fontWeight: '800',
  },
  textInput: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d8c3a2',
    backgroundColor: '#fffdf8',
    color: '#17362c',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  helperText: {
    color: '#68736e',
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: '#7a2e1f',
    fontSize: 13,
    lineHeight: 18,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cfba9a',
    backgroundColor: '#f9f0e3',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  choiceChipActive: {
    borderColor: '#17362c',
    backgroundColor: '#17362c',
  },
  choiceText: {
    color: '#495550',
    fontSize: 13,
    fontWeight: '700',
  },
  choiceTextActive: {
    color: '#fff8f0',
  },
  actionsRow: {
    gap: 12,
  },
  noticeCard: {
    borderRadius: 22,
    backgroundColor: '#efe0c8',
    padding: 18,
    gap: 6,
  },
  noticeTitle: {
    color: '#17362c',
    fontSize: 16,
    fontWeight: '800',
  },
  noticeBody: {
    color: '#4e5955',
    fontSize: 14,
    lineHeight: 20,
  },
  errorCard: {
    borderRadius: 18,
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
  disabledButton: {
    opacity: 0.55,
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





