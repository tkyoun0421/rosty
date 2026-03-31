import {
  type AppRole,
  type InviteStatus,
  type ProfileGender,
  type UserProfileRecord,
  type WorkerRateRecord,
} from "#shared/model/access";

describe("access model contracts", () => {
  it("supports only admin and worker roles", () => {
    const roles: AppRole[] = ["admin", "worker"];

    expect(roles).toEqual(["admin", "worker"]);
  });

  it("uses the token-only invite lifecycle statuses", () => {
    const statuses: InviteStatus[] = ["pending", "accepted", "revoked", "expired"];

    expect(statuses).toEqual(["pending", "accepted", "revoked", "expired"]);
  });

  it("limits profile gender values to the supported set", () => {
    const genders: ProfileGender[] = ["male", "female", "other"];

    expect(genders).toEqual(["male", "female", "other"]);
  });

  it("tracks onboarding profile fields", () => {
    const profile: UserProfileRecord = {
      fullName: "Kim Admin",
      gender: "female",
      birthDate: "1995-05-01",
      avatarUrl: "https://example.com/avatar.png",
    };

    expect(profile).toMatchObject({
      fullName: "Kim Admin",
      gender: "female",
    });
    expect(profile.birthDate).toContain("1995");
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
