import { useEffect, useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useScheduleDetailQuery } from '@/features/schedules/api/fetch-schedule-detail';
import { useWorkTimeQuery } from '@/features/work-time/api/fetch-work-time';
import {
  useWorkTimeCompletionMutation,
  useWorkTimeMutation,
} from '@/features/work-time/api/use-work-time-mutation';
import {
  canCompleteScheduleOperation,
  createWorkTimeFormValues,
  validateWorkTimeForm,
  type WorkTimeFieldErrors,
} from '@/features/work-time/model/work-time';

type WorkTimeScreenProps = {
  session: AuthSession;
  scheduleId: string;
  onBackDetail: () => void;
};

export function WorkTimeScreen({
  session,
  scheduleId,
  onBackDetail,
}: WorkTimeScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const scheduleDetailQuery = useScheduleDetailQuery(scheduleId);
  const workTimeQuery = useWorkTimeQuery(scheduleId);
  const mutation = useWorkTimeMutation(scheduleId, session.userId);
  const completionMutation = useWorkTimeCompletionMutation(scheduleId);
  const [formValues, setFormValues] = useState(createWorkTimeFormValues(null));
  const [fieldErrors, setFieldErrors] = useState<WorkTimeFieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const isBusy = mutation.isPending || completionMutation.isPending;

  useEffect(() => {
    if (!workTimeQuery.data) {
      return;
    }

    setFormValues(createWorkTimeFormValues(workTimeQuery.data.record));
    setFieldErrors({});
  }, [workTimeQuery.dataUpdatedAt, workTimeQuery.data]);

  async function handleSave() {
    const result = validateWorkTimeForm(formValues);
    setFieldErrors(result.errors);

    if (!result.status) {
      return;
    }

    try {
      await mutation.mutateAsync({
        plannedStartAt: result.normalized.plannedStartAt || null,
        plannedEndAt: result.normalized.plannedEndAt || null,
        actualStartAt: result.normalized.actualStartAt || null,
        actualEndAt: result.normalized.actualEndAt || null,
        status: result.status,
      });
      setNotice('Work time saved for this schedule.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save work time.');
    }
  }

  async function handleCompleteSchedule() {
    try {
      await completionMutation.mutateAsync();
      setNotice('Schedule marked completed.');
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Could not complete the schedule.',
      );
    }
  }

  const canCompleteSchedule = canCompleteScheduleOperation({
    scheduleStatus: scheduleDetailQuery.data?.detail?.status ?? null,
    actualStartAt: workTimeQuery.data?.record?.actualStartAt ?? null,
    actualEndAt: workTimeQuery.data?.record?.actualEndAt ?? null,
  });

  return (
    <Frame session={session} title="Work Time" subtitle="Record planned and actual times for the selected schedule.">
      {workTimeQuery.data ? (
        <NoticeCard
          title={workTimeQuery.data.source === 'supabase' ? 'Live work time record' : 'Seeded fallback work time'}
          body={
            workTimeQuery.data.sourceMessage ??
            'Work Time is reading the current Supabase-backed schedule_time_record.'
          }
        />
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Planned time</Text>
        <Field
          label="Planned start"
          value={formValues.plannedStartAt}
          error={fieldErrors.plannedStartAt}
          placeholder="2026-03-22T10:00:00.000Z"
          onChangeText={(value) => {
            setFieldErrors((current) => ({ ...current, plannedStartAt: undefined }));
            setFormValues((current) => ({ ...current, plannedStartAt: value }));
          }}
        />
        <Field
          label="Planned end"
          value={formValues.plannedEndAt}
          error={fieldErrors.plannedEndAt}
          placeholder="2026-03-22T18:00:00.000Z"
          onChangeText={(value) => {
            setFieldErrors((current) => ({ ...current, plannedEndAt: undefined }));
            setFormValues((current) => ({ ...current, plannedEndAt: value }));
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actual time</Text>
        <Field
          label="Actual start"
          value={formValues.actualStartAt}
          error={fieldErrors.actualStartAt}
          placeholder="2026-03-22T10:05:00.000Z"
          onChangeText={(value) => {
            setFieldErrors((current) => ({ ...current, actualStartAt: undefined }));
            setFormValues((current) => ({ ...current, actualStartAt: value }));
          }}
        />
        <Field
          label="Actual end"
          value={formValues.actualEndAt}
          error={fieldErrors.actualEndAt}
          placeholder="2026-03-22T18:12:00.000Z"
          onChangeText={(value) => {
            setFieldErrors((current) => ({ ...current, actualEndAt: undefined }));
            setFormValues((current) => ({ ...current, actualEndAt: value }));
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completion</Text>
        <Text style={styles.sectionBody}>
          Assigned schedules can be completed only after actual start and end
          times are recorded and any pending cancellation requests are resolved.
        </Text>
        {canCompleteSchedule ? (
          <Pressable
            accessibilityRole="button"
            disabled={isBusy}
            onPress={() => {
              void handleCompleteSchedule();
            }}
            style={[styles.primaryButton, isBusy ? styles.disabledButton : null]}
          >
            <Text style={styles.primaryButtonLabel}>
              {completionMutation.isPending
                ? 'Completing schedule...'
                : 'Mark schedule completed'}
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.sectionBody}>
            This action opens once the schedule is assigned and both actual time
            fields are present.
          </Text>
        )}
      </View>

      {notice ? <NoticeCard title="Work Time" body={notice} /> : null}

      <View style={styles.footerActions}>
        <Pressable
          accessibilityRole="button"
          onPress={onBackDetail}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonLabel}>Back to detail</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={() => {
            void handleSave();
          }}
          style={[styles.primaryButton, isBusy ? styles.disabledButton : null]}
        >
          <Text style={styles.primaryButtonLabel}>
            {mutation.isPending ? 'Saving work time...' : 'Save work time'}
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
    </Frame>
  );
}

function Frame({
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
  sectionBody: {
    color: '#56635d',
    fontSize: 14,
    lineHeight: 20,
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
