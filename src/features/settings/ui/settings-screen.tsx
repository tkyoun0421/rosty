import { useEffect, useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import {
  profileGenderOptions,
  validateProfileSetup,
  type ProfileSetupFieldErrors,
} from '@/features/auth/model/profile-setup';
import { useDeactivateAccountMutation } from '@/features/settings/api/use-deactivate-account-mutation';
import { useSettingsProfileQuery } from '@/features/settings/api/fetch-settings-profile';
import { useSettingsProfileMutation } from '@/features/settings/api/use-settings-profile-mutation';
import { getSettingsAppInfo } from '@/features/settings/model/settings-app-info';
import { createSettingsProfileFormValues } from '@/features/settings/model/settings-profile';

type SettingsScreenProps = {
  session: AuthSession;
  onBackHome: () => void;
};

export function SettingsScreen({
  session,
  onBackHome,
}: SettingsScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const profileQuery = useSettingsProfileQuery(session.userId);
  const mutation = useSettingsProfileMutation(session);
  const deactivateMutation = useDeactivateAccountMutation(session);
  const appInfo = getSettingsAppInfo();
  const [formValues, setFormValues] = useState(
    createSettingsProfileFormValues(null, session.displayName),
  );
  const [fieldErrors, setFieldErrors] = useState<ProfileSetupFieldErrors>({});
  const [notice, setNotice] = useState<{
    kind: 'success' | 'error';
    body: string;
  } | null>(null);
  const [isDeactivateConfirming, setIsDeactivateConfirming] = useState(false);
  const isBusy = mutation.isPending || deactivateMutation.isPending;

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    setFormValues(
      createSettingsProfileFormValues(profileQuery.data, session.displayName),
    );
    setFieldErrors({});
  }, [profileQuery.dataUpdatedAt, profileQuery.data, session.displayName]);

  async function handleSave() {
    const result = validateProfileSetup(formValues);

    if (!result.success) {
      setFieldErrors(result.fieldErrors);
      return;
    }

    try {
      await mutation.mutateAsync(result.data);
      setNotice({
        kind: 'success',
        body: 'Profile updated.',
      });
    } catch (error) {
      setNotice({
        kind: 'error',
        body:
          error instanceof Error ? error.message : 'Could not update profile.',
      });
    }
  }

  async function handleDeactivate() {
    setNotice(null);

    try {
      await deactivateMutation.mutateAsync();
    } catch (error) {
      setNotice({
        kind: 'error',
        body:
          error instanceof Error
            ? error.message
            : 'Could not deactivate the account.',
      });
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroBadge}>{session.role.toUpperCase()}</Text>
          <Text style={styles.heroTitle}>Settings</Text>
          <Text style={styles.heroSubtitle}>
            Review and update your core profile fields.
          </Text>
        </View>

        <View style={styles.section}>
          <Field
            label="Full name"
            value={formValues.fullName}
            error={fieldErrors.fullName}
            placeholder="Mina Staff"
            onChangeText={(value) => {
              setFieldErrors((current) => ({ ...current, fullName: undefined }));
              setFormValues((current) => ({ ...current, fullName: value }));
            }}
          />
          <Field
            label="Phone number"
            value={formValues.phoneNumber}
            error={fieldErrors.phoneNumber}
            placeholder="010-1234-5678"
            onChangeText={(value) => {
              setFieldErrors((current) => ({ ...current, phoneNumber: undefined }));
              setFormValues((current) => ({ ...current, phoneNumber: value }));
            }}
          />
          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.chipRow}>
            {profileGenderOptions.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                onPress={() => {
                  setFormValues((current) => ({
                    ...current,
                    gender: option.value,
                  }));
                }}
                style={[
                  styles.chip,
                  formValues.gender === option.value ? styles.chipActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    formValues.gender === option.value ? styles.chipLabelActive : null,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App info</Text>
          <InfoRow label="App" value={appInfo.appName} />
          <InfoRow label="Version" value={appInfo.version} />
          <InfoRow label="Environment" value={appInfo.appEnv} />
          <InfoRow label="Auth" value={appInfo.authStatus} />
          <InfoRow label="iOS bundle" value={appInfo.iosBundleId} />
          <InfoRow label="Android package" value={appInfo.androidPackage} />
          <Text style={styles.sectionBody}>{appInfo.deliveryStatus}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session</Text>
          <Text style={styles.sectionBody}>
            End the current session without changing your account status.
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={isBusy}
            onPress={() => {
              void signOut();
            }}
            style={[styles.secondaryButton, isBusy ? styles.disabledButton : null]}
          >
            <Text style={styles.secondaryButtonLabel}>Sign out</Text>
          </Pressable>
        </View>

        <View style={[styles.section, styles.dangerSection]}>
          <Text style={styles.dangerTitle}>Deactivate account</Text>
          <Text style={styles.sectionBody}>
            This keeps past operating data, signs you out, and is blocked while
            upcoming confirmed assignments still belong to you.
          </Text>
          {isDeactivateConfirming ? (
            <View style={styles.buttonRow}>
              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                onPress={() => {
                  void handleDeactivate();
                }}
                style={[
                  styles.dangerButton,
                  styles.buttonGrow,
                  isBusy ? styles.disabledButton : null,
                ]}
              >
                <Text style={styles.dangerButtonLabel}>
                  {deactivateMutation.isPending
                    ? 'Deactivating...'
                    : 'Confirm deactivation'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                onPress={() => {
                  setIsDeactivateConfirming(false);
                }}
                style={[
                  styles.secondaryButton,
                  styles.buttonGrow,
                  isBusy ? styles.disabledButton : null,
                ]}
              >
                <Text style={styles.secondaryButtonLabel}>Keep account</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={isBusy}
              onPress={() => {
                setNotice(null);
                setIsDeactivateConfirming(true);
              }}
              style={[
                styles.dangerButton,
                isBusy ? styles.disabledButton : null,
              ]}
            >
              <Text style={styles.dangerButtonLabel}>Review deactivation</Text>
            </Pressable>
          )}
        </View>

        {notice ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Settings</Text>
            <Text
              style={[
                styles.noticeBody,
                notice.kind === 'error' ? styles.noticeBodyError : null,
              ]}
            >
              {notice.body}
            </Text>
          </View>
        ) : null}

        <View style={styles.footerActions}>
          <Pressable
            accessibilityRole="button"
            onPress={onBackHome}
            style={[styles.secondaryButton, styles.buttonGrow]}
          >
            <Text style={styles.secondaryButtonLabel}>Back home</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isBusy}
            onPress={() => {
              void handleSave();
            }}
            style={[
              styles.primaryButton,
              styles.buttonGrow,
              isBusy ? styles.disabledButton : null,
            ]}
          >
            <Text style={styles.primaryButtonLabel}>
              {mutation.isPending ? 'Saving...' : 'Save profile'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Field({
  label,
  value,
  error,
  placeholder,
  onChangeText,
}: {
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8f8a80"
        style={styles.textInput}
        value={value}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    fontSize: 18,
    fontWeight: '800',
  },
  sectionBody: {
    color: '#44514c',
    fontSize: 14,
    lineHeight: 21,
  },
  fieldGroup: {
    gap: 6,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    color: '#56635d',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#14342b',
    fontSize: 14,
    lineHeight: 20,
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
  errorText: {
    color: '#7a2e1f',
    fontSize: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    backgroundColor: '#ded5c6',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: '#14342b',
  },
  chipLabel: {
    color: '#2d2720',
    fontSize: 13,
    fontWeight: '700',
  },
  chipLabelActive: {
    color: '#fff8ef',
  },
  noticeCard: {
    borderRadius: 18,
    backgroundColor: '#efe7dc',
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
  noticeBodyError: {
    color: '#7a2e1f',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonGrow: {
    flex: 1,
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
  secondaryButton: {
    borderRadius: 999,
    backgroundColor: '#ded5c6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  secondaryButtonLabel: {
    color: '#2d2720',
    fontSize: 15,
    fontWeight: '800',
  },
  dangerSection: {
    backgroundColor: '#faece8',
  },
  dangerTitle: {
    color: '#7a2e1f',
    fontSize: 18,
    fontWeight: '800',
  },
  dangerButton: {
    borderRadius: 999,
    backgroundColor: '#8f2f24',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dangerButtonLabel: {
    color: '#fff8ef',
    fontSize: 15,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
