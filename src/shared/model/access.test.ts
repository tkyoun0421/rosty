import { type AppRole, type InviteStatus, type WorkerRateRecord } from "#shared/model/access";

describe("access model contracts", () => {
  it("supports only admin and worker roles", () => {
    const roles: AppRole[] = ["admin", "worker"];

    expect(roles).toEqual(["admin", "worker"]);
  });

  it("uses the token-only invite lifecycle statuses", () => {
    const statuses: InviteStatus[] = ["pending", "accepted", "revoked", "expired"];

    expect(statuses).toEqual(["pending", "accepted", "revoked", "expired"]);
  });

  it("keeps worker rates as current-value records with audit fields", () => {
    const record: WorkerRateRecord = {
      userId: "worker-1",
      hourlyRateCents: 15000,
      updatedBy: "admin-1",
      updatedAt: "2026-03-31T00:00:00.000Z",
    };

    expect(record).toMatchObject({
      userId: "worker-1",
      hourlyRateCents: 15000,
      updatedBy: "admin-1",
    });
    expect(record.updatedAt).toContain("2026-03-31");
  });
});
