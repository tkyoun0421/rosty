import { createSettingsProfileFormValues } from '@/features/settings/model/settings-profile';

describe('settings profile helper', () => {
  it('uses current profile values when they exist', () => {
    expect(
      createSettingsProfileFormValues(
        {
          id: 'user-1',
          fullName: 'Mina Staff',
          phoneNumber: '01012345678',
          gender: 'female',
          role: 'employee',
          status: 'active',
        },
        'Fallback Name',
      ),
    ).toEqual({
      fullName: 'Mina Staff',
      phoneNumber: '01012345678',
      gender: 'female',
    });
  });
});
