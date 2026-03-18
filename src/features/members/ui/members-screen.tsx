import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession, UserRole } from '@/features/auth/model/auth-types';
import { useMemberAdminMutation } from '@/features/members/api/use-member-admin-mutation';
import { useMembersQuery } from '@/features/members/api/fetch-members';
import {
  canApproveMember,
  canChangeMemberRole,
  canReactivateMember,
  canSuspendMember,
  getActiveMembers,
  getLastAdminProtectionMessage,
  getPendingMembers,
  getSuspendedMembers,
  type MemberRecord,
} from '@/features/members/model/member-management';
import { hasSupabaseConfig } from '@/shared/lib/supabase/client';

type MembersScreenProps = {
  session: AuthSession;
  onBackHome: () => void;
};

type MemberSectionProps = {
  title: string;
  body: string;
  members: MemberRecord[];
  allMembers: MemberRecord[];
  mutation: ReturnType<typeof useMemberAdminMutation>;
};

type MemberCardProps = {
  member: MemberRecord;
  allMembers: MemberRecord[];
  mutation: ReturnType<typeof useMemberAdminMutation>;
};

const roleOptions: UserRole[] = ['employee', 'manager', 'admin'];

export function MembersScreen({ session, onBackHome }: MembersScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const membersQuery = useMembersQuery();
  const mutation = useMemberAdminMutation(session);

  if (!hasSupabaseConfig) {
    return (
      <MembersFrame
        title="Members"
        subtitle="Supabase config is required before the real admin members workflow can run."
      >
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Members is unavailable</Text>
          <Text style={styles.noticeBody}>
            Configure the Supabase project env and reload the app to manage real
            member rows.
          </Text>
        </View>
        <FooterActions onBackHome={onBackHome} onSignOut={signOut} />
      </MembersFrame>
    );
  }

  if (membersQuery.isLoading) {
    return (
      <MembersFrame
        title="Members"
        subtitle="Loading member rows and admin controls from the current Supabase project."
      >
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Loading members</Text>
          <Text style={styles.noticeBody}>
            Pulling pending approvals, active staff, and suspended accounts.
          </Text>
        </View>
      </MembersFrame>
    );
  }

  if (membersQuery.isError) {
    return (
      <MembersFrame
        title="Members"
        subtitle="The admin route loaded, but the member query could not finish."
      >
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Members query failed</Text>
          <Text style={styles.errorBody}>{membersQuery.error.message}</Text>
        </View>
        <FooterActions onBackHome={onBackHome} onSignOut={signOut} />
      </MembersFrame>
    );
  }

  const members = membersQuery.data ?? [];
  const pendingMembers = getPendingMembers(members);
  const activeMembers = getActiveMembers(members);
  const suspendedMembers = getSuspendedMembers(members);
  const otherMembers = members.filter(
    (member) =>
      member.status !== 'pending_approval' &&
      member.status !== 'active' &&
      member.status !== 'suspended',
  );

  return (
    <MembersFrame
      title="Members"
      subtitle="Approve pending users, adjust roles, and control access without leaving the admin shell."
    >
      <View style={styles.summaryRow}>
        <SummaryCard label="Pending" value={pendingMembers.length} />
        <SummaryCard label="Active" value={activeMembers.length} />
        <SummaryCard label="Suspended" value={suspendedMembers.length} />
      </View>

      {mutation.isError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Member update failed</Text>
          <Text style={styles.errorBody}>{mutation.error.message}</Text>
        </View>
      ) : null}

      <MemberSection
        title="Pending approval"
        body="Profiles that completed setup and still need an admin decision."
        members={pendingMembers}
        allMembers={members}
        mutation={mutation}
      />

      <MemberSection
        title="Active members"
        body="Users who can enter the main app today."
        members={activeMembers}
        allMembers={members}
        mutation={mutation}
      />

      <MemberSection
        title="Suspended members"
        body="Users who can sign in but cannot open operating flows until restored."
        members={suspendedMembers}
        allMembers={members}
        mutation={mutation}
      />

      {otherMembers.length > 0 ? (
        <MemberSection
          title="Other states"
          body="Read-only rows outside the current management scope."
          members={otherMembers}
          allMembers={members}
          mutation={mutation}
        />
      ) : null}

      <FooterActions onBackHome={onBackHome} onSignOut={signOut} />
    </MembersFrame>
  );
}

function MembersFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeLabel}>ADMIN</Text>
          </View>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function MemberSection({
  title,
  body,
  members,
  allMembers,
  mutation,
}: MemberSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
      {members.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nothing here right now</Text>
          <Text style={styles.emptyBody}>
            This section will populate once member rows enter the matching
            state.
          </Text>
        </View>
      ) : (
        members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            allMembers={allMembers}
            mutation={mutation}
          />
        ))
      )}
    </View>
  );
}

function MemberCard({ member, allMembers, mutation }: MemberCardProps) {
  const protectionMessage = getLastAdminProtectionMessage(allMembers, member);
  const approveAllowed = canApproveMember(member);
  const suspendAllowed = canSuspendMember(allMembers, member);
  const reactivateAllowed = canReactivateMember(member);
  const isBusy = mutation.isPending;

  return (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <View style={styles.memberTitleWrap}>
          <Text style={styles.memberName}>{member.fullName}</Text>
          <Text style={styles.memberMeta}>
            {member.phoneNumber} · {member.gender}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeLabel}>
            {formatStatus(member.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.memberMeta}>Role: {member.role}</Text>

      <View style={styles.roleRow}>
        {roleOptions.map((roleOption) => {
          const canApplyRole = canChangeMemberRole(
            allMembers,
            member,
            roleOption,
          );
          const isCurrentRole = member.role === roleOption;

          return (
            <Pressable
              key={roleOption}
              accessibilityRole="button"
              accessibilityState={{
                disabled: isBusy || (!canApplyRole && !isCurrentRole),
                selected: isCurrentRole,
              }}
              disabled={isBusy || (!canApplyRole && !isCurrentRole)}
              onPress={() => {
                if (!canApplyRole) {
                  return;
                }

                mutation.mutate({
                  kind: 'change-role',
                  member,
                  members: allMembers,
                  nextRole: roleOption,
                });
              }}
              style={
                isCurrentRole
                  ? [styles.roleChip, styles.roleChipActive]
                  : [
                      styles.roleChip,
                      isBusy || !canApplyRole ? styles.disabledChip : null,
                    ]
              }
            >
              <Text
                style={
                  isCurrentRole
                    ? [styles.roleChipLabel, styles.roleChipLabelActive]
                    : styles.roleChipLabel
                }
              >
                {roleOption}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actionRow}>
        {approveAllowed ? (
          <ActionPill
            label="Approve"
            detail="Move to active access."
            disabled={isBusy}
            onPress={() => {
              mutation.mutate({
                kind: 'approve',
                member,
                members: allMembers,
              });
            }}
          />
        ) : null}

        {member.status === 'pending_approval' || member.status === 'active' ? (
          <ActionPill
            label={suspendAllowed ? 'Suspend' : 'Suspend blocked'}
            detail={
              suspendAllowed
                ? 'Pause access until reactivated.'
                : 'Blocked by the last active admin rule.'
            }
            disabled={isBusy || !suspendAllowed}
            onPress={() => {
              if (!suspendAllowed) {
                return;
              }

              mutation.mutate({
                kind: 'suspend',
                member,
                members: allMembers,
              });
            }}
            tone="secondary"
          />
        ) : null}

        {reactivateAllowed ? (
          <ActionPill
            label="Reactivate"
            detail="Restore active access."
            disabled={isBusy}
            onPress={() => {
              mutation.mutate({
                kind: 'reactivate',
                member,
                members: allMembers,
              });
            }}
          />
        ) : null}
      </View>

      {protectionMessage ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Admin safeguard</Text>
          <Text style={styles.noticeBody}>{protectionMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

function ActionPill({
  label,
  detail,
  disabled,
  onPress,
  tone = 'primary',
}: {
  label: string;
  detail: string;
  disabled: boolean;
  onPress: () => void;
  tone?: 'primary' | 'secondary';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={
        tone === 'primary'
          ? [styles.actionPill, disabled ? styles.disabledChip : null]
          : [styles.actionPillSecondary, disabled ? styles.disabledChip : null]
      }
    >
      <Text
        style={
          tone === 'primary'
            ? styles.actionPillLabel
            : styles.actionPillSecondaryLabel
        }
      >
        {label}
      </Text>
      <Text
        style={
          tone === 'primary'
            ? styles.actionPillDetail
            : styles.actionPillSecondaryDetail
        }
      >
        {detail}
      </Text>
    </Pressable>
  );
}

function FooterActions({
  onBackHome,
  onSignOut,
}: {
  onBackHome: () => void;
  onSignOut: () => Promise<void>;
}) {
  return (
    <View style={styles.footerActions}>
      <Pressable
        accessibilityRole="button"
        onPress={onBackHome}
        style={styles.footerButtonSecondary}
      >
        <Text style={styles.footerButtonSecondaryLabel}>Back to home</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void onSignOut();
        }}
        style={styles.footerButtonPrimary}
      >
        <Text style={styles.footerButtonPrimaryLabel}>Sign out</Text>
      </Pressable>
    </View>
  );
}

function formatStatus(status: MemberRecord['status']) {
  switch (status) {
    case 'pending_approval':
      return 'Pending';
    case 'active':
      return 'Active';
    case 'suspended':
      return 'Suspended';
    case 'profile_incomplete':
      return 'Incomplete';
    case 'deactivated':
      return 'Deactivated';
  }
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
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroBadgeLabel: {
    color: '#14342b',
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
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: '#fff8ef',
    padding: 18,
    gap: 6,
  },
  summaryLabel: {
    color: '#56635d',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryValue: {
    color: '#14342b',
    fontSize: 28,
    fontWeight: '800',
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
  emptyCard: {
    borderRadius: 20,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 6,
  },
  emptyTitle: {
    color: '#14342b',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyBody: {
    color: '#495550',
    fontSize: 14,
    lineHeight: 20,
  },
  memberCard: {
    borderRadius: 20,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  memberTitleWrap: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    color: '#14342b',
    fontSize: 17,
    fontWeight: '800',
  },
  memberMeta: {
    color: '#495550',
    fontSize: 13,
    lineHeight: 18,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#d8e5de',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeLabel: {
    color: '#14342b',
    fontSize: 12,
    fontWeight: '800',
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cfba9a',
    backgroundColor: '#fff8ef',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  roleChipActive: {
    borderColor: '#14342b',
    backgroundColor: '#14342b',
  },
  roleChipLabel: {
    color: '#45524d',
    fontSize: 12,
    fontWeight: '800',
  },
  roleChipLabelActive: {
    color: '#fff8ef',
  },
  disabledChip: {
    opacity: 0.45,
  },
  actionRow: {
    gap: 10,
  },
  actionPill: {
    borderRadius: 18,
    backgroundColor: '#7a2e1f',
    padding: 14,
    gap: 4,
  },
  actionPillSecondary: {
    borderRadius: 18,
    backgroundColor: '#dfcfb8',
    padding: 14,
    gap: 4,
  },
  actionPillLabel: {
    color: '#fff8ef',
    fontSize: 14,
    fontWeight: '800',
  },
  actionPillSecondaryLabel: {
    color: '#14342b',
    fontSize: 14,
    fontWeight: '800',
  },
  actionPillDetail: {
    color: '#f0d8cf',
    fontSize: 13,
    lineHeight: 18,
  },
  actionPillSecondaryDetail: {
    color: '#495550',
    fontSize: 13,
    lineHeight: 18,
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
  errorCard: {
    borderRadius: 20,
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
  footerActions: {
    gap: 12,
  },
  footerButtonPrimary: {
    borderRadius: 999,
    backgroundColor: '#7a2e1f',
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerButtonSecondary: {
    borderRadius: 999,
    backgroundColor: '#dfcfb8',
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerButtonPrimaryLabel: {
    color: '#fff8ef',
    fontSize: 16,
    fontWeight: '800',
  },
  footerButtonSecondaryLabel: {
    color: '#14342b',
    fontSize: 16,
    fontWeight: '800',
  },
});
