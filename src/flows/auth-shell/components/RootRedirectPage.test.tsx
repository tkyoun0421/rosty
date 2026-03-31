import { describe, expect, it, vi } from "vitest";

const redirect = vi.fn((value: string) => value);
const getCurrentUser = vi.fn();

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

describe("RootRedirectPage", () => {
  it("sends anonymous users to sign-in", async () => {
    getCurrentUser.mockResolvedValue(null);

    const { RootRedirectPage } = await import("#flows/auth-shell/components/RootRedirectPage");

    await RootRedirectPage();

    expect(redirect).toHaveBeenCalledWith("/sign-in");
  });

  it("routes admin users through the common root split", async () => {
    getCurrentUser.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
    });

    const { RootRedirectPage } = await import("#flows/auth-shell/components/RootRedirectPage");

    await RootRedirectPage();

    expect(redirect).toHaveBeenCalledWith("/admin");
  });

  it("routes users without role to unauthorized", async () => {
    getCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      role: null,
    });

    const { RootRedirectPage } = await import("#flows/auth-shell/components/RootRedirectPage");

    await RootRedirectPage();

    expect(redirect).toHaveBeenCalledWith("/unauthorized");
  });
});

