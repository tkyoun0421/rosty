import { z } from 'zod';

import type { ProfileGender } from '@/features/auth/model/auth-types';

export type ProfileSetupFormValues = {
  fullName: string;
  phoneNumber: string;
  gender: ProfileGender;
};

export type ProfileSetupSubmission = {
  fullName: string;
  phoneNumber: string;
  gender: ProfileGender;
};

export type ProfileSetupFieldErrors = Partial<
  Record<keyof ProfileSetupFormValues, string>
>;

export const profileGenderOptions: {
  value: ProfileGender;
  label: string;
}[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'unspecified', label: 'Prefer not to say' },
];

const profileSetupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name.')
    .max(60, 'Keep your name under 60 characters.'),
  phoneNumber: z
    .string()
    .transform((value) => normalizePhoneNumber(value))
    .refine(
      (value) => value.length >= 9 && value.length <= 13,
      'Enter a valid phone number.',
    ),
  gender: z.enum(['male', 'female', 'unspecified']),
});

export function normalizePhoneNumber(value: string): string {
  return value.replace(/\D/g, '');
}

export function createInitialProfileSetupValues(
  displayName?: string | null,
): ProfileSetupFormValues {
  return {
    fullName: displayName && displayName !== 'Rosty User' ? displayName : '',
    phoneNumber: '',
    gender: 'unspecified',
  };
}

export function validateProfileSetup(
  values: ProfileSetupFormValues,
):
  | { success: true; data: ProfileSetupSubmission }
  | { success: false; fieldErrors: ProfileSetupFieldErrors } {
  const result = profileSetupSchema.safeParse(values);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  const fieldErrors = result.error.flatten().fieldErrors;

  return {
    success: false,
    fieldErrors: {
      fullName: fieldErrors.fullName?.[0],
      phoneNumber: fieldErrors.phoneNumber?.[0],
      gender: fieldErrors.gender?.[0],
    },
  };
}
