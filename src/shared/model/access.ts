export type AppRole = "admin" | "worker";

export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";

export interface WorkerRateRecord {
  userId: string;
  hourlyRateCents: number;
  updatedBy: string;
  updatedAt: string;
}
