import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const redirect = vi.fn((value: string) => value);
const getCurrentUserProfile = vi.fn();

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
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

  it("renders a common home and exposes the admin button only for admins", async () => {
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

    render(await RootRedirectPage());

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open admin page" })).toHaveAttribute("href", "/admin");
    expect(screen.queryByRole("link", { name: "Open schedules" })).not.toBeInTheDocument();
  });

  it("renders worker actions on the common home for workers", async () => {
    getCurrentUserProfile.mockResolvedValue({
      id: "worker-1",
      email: "worker@example.com",
      role: "worker",
      fullName: "Kim Worker",
      gender: "male",
      birthDate: "1991-01-01",
      avatarUrl: "https://example.com/avatar.png",
      isProfileComplete: true,
    });

    const { RootRedirectPage } = await import("#flows/auth-shell/components/RootRedirectPage");

    render(await RootRedirectPage());

    expect(screen.getByRole("link", { name: "Open schedules" })).toHaveAttribute(
      "href",
      "/worker/schedules",
    );
    expect(screen.getByRole("link", { name: "Open confirmed work" })).toHaveAttribute(
      "href",
      "/worker/assignments",
    );
    expect(screen.queryByRole("link", { name: "Open admin page" })).not.toBeInTheDocument();
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