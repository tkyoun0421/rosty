import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const redirect = vi.fn((value: string) => value);
const getCurrentUserProfile = vi.fn();

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("#queries/access/dal/getCurrentUserProfile", () => ({
  getCurrentUserProfile,
}));

vi.mock("#mutations/auth/components/ProfileOnboardingForm", () => ({
  ProfileOnboardingForm: () => <div>Profile form</div>,
}));

describe("ProfileOnboardingPage", () => {
  it("redirects anonymous users to sign-in", async () => {
    getCurrentUserProfile.mockResolvedValue(null);

    const { ProfileOnboardingPage } = await import(
      "#flows/profile-onboarding/components/ProfileOnboardingPage"
    );

    await ProfileOnboardingPage();

    expect(redirect).toHaveBeenCalledWith("/sign-in");
  });

  it("redirects completed profiles to the root page", async () => {
    getCurrentUserProfile.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      role: "worker",
      fullName: "Kim Worker",
      gender: "male",
      birthDate: "1991-01-01",
      avatarUrl: "https://example.com/avatar.png",
      isProfileComplete: true,
    });

    const { ProfileOnboardingPage } = await import(
      "#flows/profile-onboarding/components/ProfileOnboardingPage"
    );

    await ProfileOnboardingPage();

    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("renders the onboarding heading for incomplete profiles", async () => {
    getCurrentUserProfile.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      role: "worker",
      fullName: "Kim Worker",
      gender: null,
      birthDate: null,
      avatarUrl: null,
      isProfileComplete: false,
    });

    const { ProfileOnboardingPage } = await import(
      "#flows/profile-onboarding/components/ProfileOnboardingPage"
    );

    render(await ProfileOnboardingPage());

    expect(screen.getByText("Profile setup")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Complete your profile" })).toBeInTheDocument();
    expect(screen.getByText("Profile form")).toBeInTheDocument();
  });
});
