import type { AppRole, UserProfileRecord } from "#shared/model/access";

export interface CurrentUserProfile extends UserProfileRecord {
  id: string;
  email: string;
  role: AppRole | null;
  isProfileComplete: boolean;
}
