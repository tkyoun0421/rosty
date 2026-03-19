import {
  buildInvitationLoginUrl,
  buildInvitationShareContent,
  invitationLoginPath,
  invitationShareTitle,
} from '@/features/invitations/model/invitation-share';
import { invitationTokenParam } from '@/features/invitations/model/invitation-join';

describe('invitation share helpers', () => {
  it('builds an employee login URL from the invite token', () => {
    const createUrl = jest.fn(
      (
        path: string,
        options?: {
          queryParams?: Record<string, string>;
        },
      ) =>
        `rosty://${path}?${invitationTokenParam}=${options?.queryParams?.[invitationTokenParam]}`,
    );

    expect(buildInvitationLoginUrl('active-token', createUrl)).toBe(
      'rosty://login?invite=active-token',
    );
    expect(createUrl).toHaveBeenCalledWith(invitationLoginPath, {
      queryParams: {
        [invitationTokenParam]: 'active-token',
      },
    });
  });

  it('builds share content from the same invite URL', () => {
    const createUrl = jest.fn(() => 'https://rosty.app/login?invite=share-token');

    expect(buildInvitationShareContent('share-token', createUrl)).toEqual({
      title: invitationShareTitle,
      url: 'https://rosty.app/login?invite=share-token',
      message:
        'Open this Rosty employee invitation link to continue login and profile setup:\nhttps://rosty.app/login?invite=share-token',
    });
  });
});