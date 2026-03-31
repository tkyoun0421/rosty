import { isProfileComplete } from "#queries/access/utils/profileCompleteness";

describe("isProfileComplete", () => {
  it("returns true when all required onboarding fields exist", () => {
    expect(
      isProfileComplete({
        fullName: "Kim Admin",
        gender: "male",
        birthDate: "1990-01-01",
        avatarUrl: "https://example.com/avatar.png",
      }),
    ).toBe(true);
  });

  it("returns false when any onboarding field is missing", () => {
    expect(
      isProfileComplete({
        fullName: "Kim Admin",
        gender: null,
        birthDate: "1990-01-01",
        avatarUrl: "https://example.com/avatar.png",
      }),
    ).toBe(false);
  });
});
