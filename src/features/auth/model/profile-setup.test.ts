import {
  createInitialProfileSetupValues,
  normalizePhoneNumber,
  validateProfileSetup,
} from '@/features/auth/model/profile-setup';

describe('profile setup defaults', () => {
  it('prefills a real display name but leaves fallback names blank', () => {
    expect(createInitialProfileSetupValues('Mina Staff').fullName).toBe(
      'Mina Staff',
    );
    expect(createInitialProfileSetupValues('Rosty User').fullName).toBe('');
  });
});

describe('profile setup validation', () => {
  it('normalizes phone digits during validation', () => {
    const result = validateProfileSetup({
      fullName: 'Mina Staff',
      phoneNumber: '010-1234-5678',
      gender: 'female',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.phoneNumber).toBe('01012345678');
    }
  });

  it('rejects empty names and short phone numbers', () => {
    const result = validateProfileSetup({
      fullName: ' ',
      phoneNumber: '010-12',
      gender: 'unspecified',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.fullName).toBe('Enter your full name.');
      expect(result.fieldErrors.phoneNumber).toBe(
        'Enter a valid phone number.',
      );
    }
  });

  it('strips non-digit characters from phone input', () => {
    expect(normalizePhoneNumber('+82 10 1234 5678')).toBe('821012345678');
  });
});
