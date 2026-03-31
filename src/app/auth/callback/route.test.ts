import { describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
const getServerSupabaseClient = vi.fn();
const acceptInvite = vi.fn();

vi.mock("#shared/lib/supabase/serverClient", () => ({
  getServerSupabaseClient,
}));

vi.mock("#mutations/invite/actions/acceptInvite", () => ({
  acceptInvite,
}));

describe("auth callback route", () => {
  it("redirects successful callbacks to the common root", async () => {
    getServerSupabaseClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession,
      },
    });
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const { GET } = await import("#app/auth/callback/route");
    const response = await GET(new Request("https://example.com/auth/callback?code=abc"));

    expect(response.headers.get("location")).toBe("https://example.com/");
  });

  it("accepts invite tokens after oauth exchange", async () => {
    getServerSupabaseClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession,
      },
    });
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const { GET } = await import("#app/auth/callback/route");
    await GET(new Request("https://example.com/auth/callback?code=abc&invite_token=invite-token"));

    expect(acceptInvite).toHaveBeenCalledWith("invite-token");
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

