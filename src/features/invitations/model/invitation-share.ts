import * as Linking from 'expo-linking';

import { invitationTokenParam } from '@/features/invitations/model/invitation-join';

export const invitationLoginPath = 'login';
export const invitationShareTitle = 'Employee invitation link';

export type InvitationUrlBuilder = (
  path: string,
  options?: {
    queryParams?: Record<string, string>;
  },
) => string;

export type InvitationShareContent = {
  title: string;
  url: string;
  message: string;
};

export function buildInvitationLoginUrl(
  token: string,
  createUrl: InvitationUrlBuilder = Linking.createURL,
): string {
  return createUrl(invitationLoginPath, {
    queryParams: {
      [invitationTokenParam]: token,
    },
  });
}

export function buildInvitationShareContent(
  token: string,
  createUrl: InvitationUrlBuilder = Linking.createURL,
): InvitationShareContent {
  const url = buildInvitationLoginUrl(token, createUrl);

  return {
    title: invitationShareTitle,
    url,
    message: `Open this Rosty employee invitation link to continue login and profile setup:\n${url}`,
  };
}