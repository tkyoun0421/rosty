export type AppRole = "admin" | "worker";

export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";

export type ProfileGender = "male" | "female" | "other";

export interface WorkerRateRecord {
  userId: string;
  hourlyRateCents: number;
  updatedBy: string;
  updatedAt: string;
}

export interface UserProfileRecord {
  fullName: string | null;
  gender: ProfileGender | null;
  birthDate: string | null;
  avatarUrl: string | null;
}
