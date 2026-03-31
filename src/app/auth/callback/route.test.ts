import { describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
const getServerSupabaseClient = vi.fn();
const finalizeAuthSession = vi.fn();

vi.mock("#shared/lib/supabase/serverClient", () => ({
  getServerSupabaseClient,
}));

vi.mock("#mutations/auth/actions/finalizeAuthSession", () => ({
  finalizeAuthSession,
}));

describe("auth callback route", () => {
  it("redirects successful callbacks to the finalized next path", async () => {
    getServerSupabaseClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession,
      },
    });
    exchangeCodeForSession.mockResolvedValue({ error: null });
    finalizeAuthSession.mockResolvedValue("/onboarding");

    const { GET } = await import("#app/auth/callback/route");
    const response = await GET(new Request("https://example.com/auth/callback?code=abc"));

    expect(finalizeAuthSession).toHaveBeenCalledWith(undefined);
    expect(response.headers.get("location")).toBe("https://example.com/onboarding");
  });

  it("passes invite tokens into auth finalization", async () => {
    getServerSupabaseClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession,
      },
    });
    exchangeCodeForSession.mockResolvedValue({ error: null });
    finalizeAuthSession.mockResolvedValue("/");

    const { GET } = await import("#app/auth/callback/route");
    await GET(new Request("https://example.com/auth/callback?code=abc&invite_token=invite-token"));

    expect(finalizeAuthSession).toHaveBeenCalledWith("invite-token");
  });

  it("redirects callback errors back to sign-in", async () => {
    getServerSupabaseClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession,
      },
    });
    exchangeCodeForSession.mockResolvedValue({ error: new Error("oauth failed") });

    const { GET } = await import("#app/auth/callback/route");
    const response = await GET(new Request("https://example.com/auth/callback?code=abc"));

    expect(response.headers.get("location")).toBe("https://example.com/sign-in?error=oauth");
  });
});
