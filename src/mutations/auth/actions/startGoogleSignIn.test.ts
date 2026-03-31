import { describe, expect, it, vi } from "vitest";

const signInWithOAuth = vi.fn();
const getBrowserSupabaseClient = vi.fn(() => ({
  auth: {
    signInWithOAuth,
  },
}));

vi.mock("#shared/lib/supabase/browserClient", () => ({
  getBrowserSupabaseClient,
}));

describe("startGoogleSignIn", () => {
  it("starts google auth with the callback route and root redirect", async () => {
    const { startGoogleSignIn } = await import("#mutations/auth/actions/startGoogleSignIn");

    await startGoogleSignIn("https://example.com");

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "https://example.com/auth/callback?next=%2F",
      },
    });
  });

  it("preserves invite tokens through the callback", async () => {
    const { startGoogleSignIn } = await import("#mutations/auth/actions/startGoogleSignIn");

    await startGoogleSignIn("https://example.com", "invite-token");

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "https://example.com/auth/callback?next=%2F&invite_token=invite-token",
      },
    });
  });
});

