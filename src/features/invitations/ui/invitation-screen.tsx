import { useState } from 'react';

import * as Clipboard from 'expo-clipboard';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { useInvitationAdminMutation } from '@/features/invitations/api/use-invitation-admin-mutation';
import { useInvitationLinksQuery } from '@/features/invitations/api/fetch-invitation-links';
import {
  canDisableInvitation,
  canReissueInvitation,
  getActiveInvitationLinks,
  getHistoricalInvitationLinks,
  getInvitationCounts,
  getInvitationLinkState,
  type InvitationLinkRecord,
} from '@/features/invitations/model/invitation-management';
import {
  buildInvitationLoginUrl,
  buildInvitationShareContent,
} from '@/features/invitations/model/invitation-share';
import { hasSupabaseConfig } from '@/shared/lib/supabase/client';

type InvitationScreenProps = {
  session: AuthSession;
  onBackMembers: () => void;
};

type InvitationSectionProps = {
  title: string;
  body: string;
  invitations: InvitationLinkRecord[];
  now: Date;
  mutation: ReturnType<typeof useInvitationAdminMutation>;
  onCopyLink: (token: string) => Promise<void>;
  onShareLink: (token: string) => Promise<void>;
};

type InvitationCardProps = {
  invitation: InvitationLinkRecord;
  now: Date;
  mutation: ReturnType<typeof useInvitationAdminMutation>;
  onCopyLink: (token: string) => Promise<void>;
  onShareLink: (token: string) => Promise<void>;
};

type InvitationLinkActionsProps = {
  token: string;
  onCopyLink: (token: string) => Promise<void>;
  onShareLink: (token: string) => Promise<void>;
};

type InvitationActionNotice = {
  tone: 'notice' | 'error';
  title: string;
  body: string;
};

export function InvitationScreen({
  session,
  onBackMembers,
}: InvitationScreenProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const invitationsQuery = useInvitationLinksQuery();
  const mutation = useInvitationAdminMutation(session);
  const [actionNotice, setActionNotice] =
    useState<InvitationActionNotice | null>(null);

  if (!hasSupabaseConfig) {
    return (
      <InvitationFrame
        title="Invitation"
        subtitle="Supabase config is required before the real admin invitation workflow can run."
      >
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Invitation is unavailable</Text>
          <Text style={styles.noticeBody}>
            Configure the Supabase project env and reload the app to issue or
            reissue employee invitation links.
          </Text>
        </View>
        <FooterActions onBackMembers={onBackMembers} onSignOut={signOut} />
      </InvitationFrame>
    );
  }

  if (invitationsQuery.isLoading) {
    return (
      <InvitationFrame
        title="Invitation"
        subtitle="Loading invitation link history and the current admin actions."
      >
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Loading invitation links</Text>
          <Text style={styles.noticeBody}>
            Pulling active invites and historical link status from the current
            Supabase project.
          </Text>
        </View>
      </InvitationFrame>
    );
  }

  if (invitationsQuery.isError) {
    return (
      <InvitationFrame
        title="Invitation"
        subtitle="The admin route loaded, but the invitation query could not finish."
      >
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Invitation query failed</Text>
          <Text selectable style={styles.errorBody}>
            {invitationsQuery.error.message}
          </Text>
        </View>
        <FooterActions onBackMembers={onBackMembers} onSignOut={signOut} />
      </InvitationFrame>
    );
  }

  const now = new Date();
  const invitations = invitationsQuery.data ?? [];
  const counts = getInvitationCounts(invitations, now);
  const activeInvitations = getActiveInvitationLinks(invitations, now);
  const historicalInvitations = getHistoricalInvitationLinks(invitations, now);
  const latestInvitation =
    mutation.isSuccess && mutation.data.kind !== 'disable' ? mutation.data : null;

  async function handleCopyLink(token: string) {
    const url = buildInvitationLoginUrl(token);

    try {
      await Clipboard.setStringAsync(url);
      setActionNotice({
        tone: 'notice',
        title: 'Invitation link copied',
        body: 'The employee login URL is ready to paste into chat or email.',
      });
    } catch (error) {
      setActionNotice({
        tone: 'error',
        title: 'Invitation copy failed',
        body: formatActionError(error, 'Could not copy the invitation link.'),
      });
    }
  }

  async function handleShareLink(token: string) {
    try {
      const result = await Share.share(buildInvitationShareContent(token));

      if (result.action === Share.dismissedAction) {
        setActionNotice(null);
        return;
      }

      setActionNotice({
        tone: 'notice',
        title: 'Share sheet opened',
        body: 'The current employee login URL is ready to hand off from the native share sheet.',
      });
    } catch (error) {
      setActionNotice({
        tone: 'error',
        title: 'Invitation share failed',
        body: formatActionError(error, 'Could not open the native share sheet.'),
      });
    }
  }

  return (
    <InvitationFrame
      title="Invitation"
      subtitle="Issue, reissue, copy, and share employee invite links without leaving the admin shell."
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: mutation.isPending }}
        disabled={mutation.isPending}
        onPress={() => {
          mutation.mutate({ kind: 'issue' });
        }}
        style={[
          styles.issueCard,
          mutation.isPending ? styles.disabledCard : null,
        ]}
      >
        <Text style={styles.issueTitle}>Issue new employee link</Text>
        <Text style={styles.issueBody}>
          Create a fresh employee invite token that stays valid for 7 days.
        </Text>
      </Pressable>

      <View style={styles.summaryGrid}>
        <SummaryCard label="Active" value={counts.active} />
        <SummaryCard label="Used" value={counts.consumed} />
        <SummaryCard label="Expired" value={counts.expired} />
        <SummaryCard label="Disabled" value={counts.disabled} />
      </View>

      {mutation.isError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Invitation update failed</Text>
          <Text selectable style={styles.errorBody}>
            {mutation.error.message}
          </Text>
        </View>
      ) : null}

      {latestInvitation ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>
            {latestInvitation.kind === 'reissue'
              ? 'Replacement invitation ready'
              : 'New invitation ready'}
          </Text>
          <Text style={styles.noticeBody}>
            Copy the employee login URL directly or hand it off from the native
            share sheet.
          </Text>
          <ValueBlock
            label="Login URL"
            value={buildInvitationLoginUrl(latestInvitation.token)}
          />
          <ValueBlock label="Token" value={latestInvitation.token} />
          <Text style={styles.noticeBody}>
            Expires: {formatTimestamp(latestInvitation.expiresAt)}
          </Text>
          <InvitationLinkActions
            token={latestInvitation.token}
            onCopyLink={handleCopyLink}
            onShareLink={handleShareLink}
          />
        </View>
      ) : null}

      {mutation.isSuccess && mutation.data.kind === 'disable' ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Invitation disabled</Text>
          <Text style={styles.noticeBody}>
            The selected active link is now blocked from further use.
          </Text>
        </View>
      ) : null}

      {actionNotice ? (
        actionNotice.tone === 'error' ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>{actionNotice.title}</Text>
            <Text selectable style={styles.errorBody}>
              {actionNotice.body}
            </Text>
          </View>
        ) : (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>{actionNotice.title}</Text>
            <Text style={styles.noticeBody}>{actionNotice.body}</Text>
          </View>
        )
      ) : null}

      <InvitationSection
        title="Active links"
        body="Currently usable employee invitation tokens. Reissue keeps the old row as disabled history."
        invitations={activeInvitations}
        now={now}
        mutation={mutation}
        onCopyLink={handleCopyLink}
        onShareLink={handleShareLink}
      />

      <InvitationSection
        title="History"
        body="Read-only records for used, expired, and disabled invitation links."
        invitations={historicalInvitations}
        now={now}
        mutation={mutation}
        onCopyLink={handleCopyLink}
        onShareLink={handleShareLink}
      />

      <FooterActions onBackMembers={onBackMembers} onSignOut={signOut} />
    </InvitationFrame>
  );
}

function InvitationFrame({
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
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
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

function InvitationSection({
  title,
  body,
  invitations,
  now,
  mutation,
  onCopyLink,
  onShareLink,
}: InvitationSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
      {invitations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nothing here right now</Text>
          <Text style={styles.emptyBody}>
            Invitation rows will appear here once links move into this group.
          </Text>
        </View>
      ) : (
        invitations.map((invitation) => (
          <InvitationCard
            key={invitation.id}
            invitation={invitation}
            now={now}
            mutation={mutation}
            onCopyLink={onCopyLink}
            onShareLink={onShareLink}
          />
        ))
      )}
    </View>
  );
}

function InvitationCard({
  invitation,
  now,
  mutation,
  onCopyLink,
  onShareLink,
}: InvitationCardProps) {
  const state = getInvitationLinkState(invitation, now);
  const disableAllowed = canDisableInvitation(invitation, now);
  const reissueAllowed = canReissueInvitation(invitation, now);
  const isBusy = mutation.isPending;
  const loginUrl =
    state === 'active' ? buildInvitationLoginUrl(invitation.token) : null;

  return (
    <View style={styles.invitationCard}>
      <View style={styles.invitationHeader}>
        <View style={styles.invitationTitleWrap}>
          <Text style={styles.invitationTitle}>Employee invite</Text>
          <Text style={styles.invitationMeta}>Role: {invitation.targetRole}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeLabel}>{formatState(state)}</Text>
        </View>
      </View>

      <ValueBlock label="Token" value={invitation.token} />

      {loginUrl ? (
        <>
          <ValueBlock label="Login URL" value={loginUrl} />
          <Text style={styles.linkHint}>
            Copy the current login URL or send it through the native share
            sheet.
          </Text>
          <InvitationLinkActions
            token={invitation.token}
            onCopyLink={onCopyLink}
            onShareLink={onShareLink}
          />
        </>
      ) : null}

      <Text style={styles.invitationMeta}>
        Created: {formatTimestamp(invitation.createdAt)}
      </Text>
      <Text style={styles.invitationMeta}>
        Expires: {formatTimestamp(invitation.expiresAt)}
      </Text>
      {invitation.consumedAt ? (
        <Text style={styles.invitationMeta}>
          Used: {formatTimestamp(invitation.consumedAt)}
        </Text>
      ) : null}
      {invitation.disabledAt ? (
        <Text style={styles.invitationMeta}>
          Disabled: {formatTimestamp(invitation.disabledAt)}
        </Text>
      ) : null}

      {state === 'active' ? (
        <View style={styles.actionRow}>
          <ActionPill
            label="Reissue"
            detail="Disable this link and generate a fresh 7 day token."
            disabled={isBusy || !reissueAllowed}
            onPress={() => {
              if (!reissueAllowed) {
                return;
              }

              mutation.mutate({
                kind: 'reissue',
                invitation,
              });
            }}
          />
          <ActionPill
            label="Disable"
            detail="Block this link without creating a replacement."
            disabled={isBusy || !disableAllowed}
            onPress={() => {
              if (!disableAllowed) {
                return;
              }

              mutation.mutate({
                kind: 'disable',
                invitation,
              });
            }}
            tone="secondary"
          />
        </View>
      ) : null}
    </View>
  );
}

function ValueBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.valueBlock}>
      <Text style={styles.valueLabel}>{label}</Text>
      <Text selectable style={styles.valueText}>
        {value}
      </Text>
    </View>
  );
}

function InvitationLinkActions({
  token,
  onCopyLink,
  onShareLink,
}: InvitationLinkActionsProps) {
  return (
    <View style={styles.linkActionRow}>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void onCopyLink(token);
        }}
        style={styles.linkActionButtonPrimary}
      >
        <Text style={styles.linkActionButtonPrimaryLabel}>Copy link</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void onShareLink(token);
        }}
        style={styles.linkActionButtonSecondary}
      >
        <Text style={styles.linkActionButtonSecondaryLabel}>Share link</Text>
      </Pressable>
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
          ? [styles.actionPill, disabled ? styles.disabledCard : null]
          : [styles.actionPillSecondary, disabled ? styles.disabledCard : null]
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
  onBackMembers,
  onSignOut,
}: {
  onBackMembers: () => void;
  onSignOut: () => Promise<void>;
}) {
  return (
    <View style={styles.footerActions}>
      <Pressable
        accessibilityRole="button"
        onPress={onBackMembers}
        style={styles.footerButtonSecondary}
      >
        <Text style={styles.footerButtonSecondaryLabel}>Back to members</Text>
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

function formatState(state: ReturnType<typeof getInvitationLinkState>) {
  switch (state) {
    case 'active':
      return 'Active';
    case 'consumed':
      return 'Used';
    case 'expired':
      return 'Expired';
    case 'disabled':
      return 'Disabled';
  }
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

function formatActionError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
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
  issueCard: {
    borderRadius: 24,
    backgroundColor: '#d8e5de',
    padding: 18,
    gap: 6,
  },
  issueTitle: {
    color: '#14342b',
    fontSize: 17,
    fontWeight: '800',
  },
  issueBody: {
    color: '#44514c',
    fontSize: 14,
    lineHeight: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    width: '47%',
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
  invitationCard: {
    borderRadius: 20,
    backgroundColor: '#efe0c8',
    padding: 16,
    gap: 10,
  },
  invitationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  invitationTitleWrap: {
    flex: 1,
    gap: 4,
  },
  invitationTitle: {
    color: '#14342b',
    fontSize: 17,
    fontWeight: '800',
  },
  invitationMeta: {
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
  valueBlock: {
    borderRadius: 16,
    backgroundColor: '#fff8ef',
    padding: 12,
    gap: 6,
  },
  valueLabel: {
    color: '#56635d',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueText: {
    color: '#14342b',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  linkHint: {
    color: '#44514c',
    fontSize: 13,
    lineHeight: 18,
  },
  linkActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  linkActionButtonPrimary: {
    borderRadius: 999,
    backgroundColor: '#14342b',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  linkActionButtonSecondary: {
    borderRadius: 999,
    backgroundColor: '#dfcfb8',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  linkActionButtonPrimaryLabel: {
    color: '#fff8ef',
    fontSize: 13,
    fontWeight: '800',
  },
  linkActionButtonSecondaryLabel: {
    color: '#14342b',
    fontSize: 13,
    fontWeight: '800',
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
    gap: 8,
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
  disabledCard: {
    opacity: 0.45,
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