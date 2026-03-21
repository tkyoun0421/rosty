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
import { useSettingsProfileQuery } from '@/features/settings/api/fetch-settings-profile';
import { useSettingsProfileMutation } from '@/features/settings/api/use-settings-profile-mutation';
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
  const [formValues, setFormValues] = useState(
    createSettingsProfileFormValues(null, session.displayName),
  );
  const [fieldErrors, setFieldErrors] = useState<ProfileSetupFieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

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
      setNotice('Profile updated.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not update profile.');
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

        {notice ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Settings</Text>
            <Text style={styles.noticeBody}>{notice}</Text>
          </View>
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
            disabled={mutation.isPending}
            onPress={() => {
              void handleSave();
            }}
            style={[styles.primaryButton, mutation.isPending ? styles.disabledButton : null]}
          >
            <Text style={styles.primaryButtonLabel}>
              {mutation.isPending ? 'Saving...' : 'Save profile'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void signOut();
            }}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonLabel}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  fieldGroup: {
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
