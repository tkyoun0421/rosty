import { useEffect, useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useScheduleDetailQuery } from '@/features/schedules/api/fetch-schedule-detail';
import { slotPresetSeedRows } from '@/features/schedules/api/schedule-read-fallback';
import { useSaveScheduleMutation } from '@/features/schedules/api/use-save-schedule-mutation';
import {
  createScheduleEditFormValues,
  validateScheduleEditForm,
  type ScheduleEditFieldErrors,
} from '@/features/schedules/model/schedule-edit';

type ScheduleEditScreenProps = {
  session: AuthSession;
  scheduleId: string | null;
  onBackSchedule: (scheduleId?: string) => void;
};

export function ScheduleEditScreen({
  session,
  scheduleId,
  onBackSchedule,
}: ScheduleEditScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const detailQuery = useScheduleDetailQuery(scheduleId);
  const mutation = useSaveScheduleMutation(scheduleId, session.userId);
  const [formValues, setFormValues] = useState(
    createScheduleEditFormValues({
      schedule: null,
      slots: [],
      presets: slotPresetSeedRows.map((preset) => ({
        id: preset.id,
        code: preset.code,
        positionName: preset.position_name,
        defaultHeadcount: preset.default_headcount,
        requiredGender: preset.required_gender,
        isRequired: preset.is_required,
        sortOrder: preset.sort_order,
      })),
    }),
  );
  const [fieldErrors, setFieldErrors] = useState<ScheduleEditFieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!scheduleId || !detailQuery.data?.detail) {
      return;
    }

    setFormValues(
      createScheduleEditFormValues({
        schedule: {
          eventDate: detailQuery.data.detail.eventDate,
          packageCount: detailQuery.data.detail.packageCount,
          memo: detailQuery.data.detail.memo,
          collectionState: detailQuery.data.detail.collectionState,
        },
        slots: detailQuery.data.detail.slots.map((slot) => ({
          id: slot.id,
          presetId: null,
          positionName: slot.positionName,
          headcount: slot.headcount,
          requiredGender: slot.requiredGender,
          isRequired: false,
          isEnabled: slot.isEnabled,
          sortOrder: 0,
        })),
        presets: slotPresetSeedRows.map((preset) => ({
          id: preset.id,
          code: preset.code,
          positionName: preset.position_name,
          defaultHeadcount: preset.default_headcount,
          requiredGender: preset.required_gender,
          isRequired: preset.is_required,
          sortOrder: preset.sort_order,
        })),
      }),
    );
  }, [detailQuery.dataUpdatedAt, detailQuery.data, scheduleId]);

  async function handleSave() {
    const result = validateScheduleEditForm(
      formValues,
      new Date().toISOString().slice(0, 10),
    );

    setFieldErrors(result.errors);

    if (!result.payload) {
      return;
    }

    try {
      const saved = await mutation.mutateAsync(result.payload);
      setNotice('Schedule saved.');
      onBackSchedule(saved.scheduleId);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save the schedule.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroBadge}>{session.role.toUpperCase()}</Text>
          <Text style={styles.heroTitle}>
            {scheduleId ? 'Schedule Edit' : 'Create Schedule'}
          </Text>
          <Text style={styles.heroSubtitle}>
            Save the event schedule and slot structure while the schedule remains editable.
          </Text>
        </View>

        <View style={styles.section}>
          <Field
            label="Event date"
            value={formValues.eventDate}
            error={fieldErrors.eventDate}
            placeholder="2026-03-29"
            onChangeText={(value) => {
              setFieldErrors((current) => ({ ...current, eventDate: undefined }));
              setFormValues((current) => ({ ...current, eventDate: value }));
            }}
          />
          <Field
            label="Package count"
            value={formValues.packageCount}
            error={fieldErrors.packageCount}
            placeholder="3"
            onChangeText={(value) => {
              setFieldErrors((current) => ({ ...current, packageCount: undefined }));
              setFormValues((current) => ({ ...current, packageCount: value }));
            }}
          />
          <Field
            label="Memo"
            value={formValues.memo}
            placeholder="Convention Hall banquet"
            onChangeText={(value) => {
              setFormValues((current) => ({ ...current, memo: value }));
            }}
          />
          {fieldErrors.slots ? (
            <Text style={styles.errorText}>{fieldErrors.slots}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Slots</Text>
          {formValues.slots.map((slot, index) => (
            <View key={slot.id} style={styles.slotCard}>
              <Text style={styles.slotTitle}>{slot.positionName}</Text>
              <Field
                label="Headcount"
                value={slot.headcount}
                placeholder="1"
                onChangeText={(value) => {
                  setFormValues((current) => ({
                    ...current,
                    slots: current.slots.map((entry, entryIndex) =>
                      entryIndex === index
                        ? {
                            ...entry,
                            headcount: value,
                          }
                        : entry,
                    ),
                  }));
                }}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setFormValues((current) => ({
                    ...current,
                    slots: current.slots.map((entry, entryIndex) =>
                      entryIndex === index
                        ? {
                            ...entry,
                            isEnabled: !entry.isEnabled,
                          }
                        : entry,
                    ),
                  }));
                }}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonLabel}>
                  {slot.isEnabled ? 'Disable slot' : 'Enable slot'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        {notice ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Schedule</Text>
            <Text style={styles.noticeBody}>{notice}</Text>
          </View>
        ) : null}

        <View style={styles.footerActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onBackSchedule(scheduleId ?? undefined)}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonLabel}>Back</Text>
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
              {mutation.isPending ? 'Saving schedule...' : 'Save schedule'}
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
        autoCapitalize="none"
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
    fontSize: 19,
    fontWeight: '800',
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
  slotCard: {
    borderRadius: 18,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 8,
  },
  slotTitle: {
    color: '#14342b',
    fontSize: 15,
    fontWeight: '800',
  },
  errorText: {
    color: '#7a2e1f',
    fontSize: 12,
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
