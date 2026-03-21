export type UserRole = 'employee' | 'manager' | 'admin';

export type UserStatus =
  | 'profile_incomplete'
  | 'pending_approval'
  | 'active'
  | 'suspended'
  | 'deactivated';

export type ProfileGender = 'male' | 'female' | 'unspecified';

export type AuthSource = 'demo' | 'supabase';

export type AuthSession = {
  userId: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
};

export type DemoAuthPreset =
  | 'employee-new'
  | 'employee-pending'
  | 'employee-active'
  | 'manager-active'
  | 'admin-active'
  | 'employee-suspended';
