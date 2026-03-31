import { describe, expect, it, vi } from "vitest";

const redirect = vi.fn((value: string) => value);
const getCurrentUserProfile = vi.fn();

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("#queries/access/dal/getCurrentUserProfile", () => ({
  getCurrentUserProfile,
}));

describe("RootRedirectPage", () => {
  it("sends anonymous users to sign-in", async () => {
    getCurrentUserProfile.mockResolvedValue(null);

    const { RootRedirectPage } = await import("#flows/auth-shell/components/RootRedirectPage");

    await RootRedirectPage();

    expect(redirect).toHaveBeenCalledWith("/sign-in");
  });

  it("routes incomplete profiles to onboarding first", async () => {
    getCurrentUserProfile.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      role: "worker",
      fullName: "Kim Worker",
      gender: null,
      birthDate: null,
      avatarUrl: "https://example.com/avatar.png",
      isProfileComplete: false,
    });

    const { RootRedirectPage } = await import("#flows/auth-shell/components/RootRedirectPage");

    await RootRedirectPage();

    expect(redirect).toHaveBeenCalledWith("/onboarding");
  });

  it("routes admin users through the common root split", async () => {
    getCurrentUserProfile.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
      fullName: "Kim Admin",
      gender: "female",
      birthDate: "1990-01-01",
      avatarUrl: "https://example.com/avatar.png",
      isProfileComplete: true,
    });

    const { RootRedirectPage } = await import("#flows/auth-shell/components/RootRedirectPage");

    await RootRedirectPage();

    expect(redirect).toHaveBeenCalledWith("/admin");
  });

  it("routes users without role to unauthorized after onboarding", async () => {
    getCurrentUserProfile.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      role: null,
      fullName: "Kim User",
      gender: "male",
      birthDate: "1991-01-01",
      avatarUrl: "https://example.com/avatar.png",
      isProfileComplete: true,
    });

    const { RootRedirectPage } = await import("#flows/auth-shell/components/RootRedirectPage");

    await RootRedirectPage();

    expect(redirect).toHaveBeenCalledWith("/unauthorized");
  });
});
