import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const startGoogleSignIn = vi.fn();
const hasBrowserSupabaseEnv = vi.fn();

vi.mock("#mutations/auth/actions/startGoogleSignIn", () => ({
  startGoogleSignIn,
}));

vi.mock("#shared/lib/supabase/browserClient", () => ({
  hasBrowserSupabaseEnv,
}));

describe("GoogleSignInButton", () => {
  it("starts google sign-in when public env exists", async () => {
    hasBrowserSupabaseEnv.mockReturnValue(true);

    const { GoogleSignInButton } = await import("#flows/auth-shell/components/GoogleSignInButton");

    render(<GoogleSignInButton label="Google로 계속" inviteToken="invite-token" />);
    fireEvent.click(screen.getByRole("button", { name: "Google로 계속" }));

    expect(startGoogleSignIn).toHaveBeenCalledWith(window.location.origin, "invite-token");
  });

  it("disables the button when public env is missing", async () => {
    hasBrowserSupabaseEnv.mockReturnValue(false);

    const { GoogleSignInButton } = await import("#flows/auth-shell/components/GoogleSignInButton");
    render(<GoogleSignInButton label="Google로 계속" />);

    expect(screen.getByRole("button", { name: "Google로 계속" })).toBeDisabled();
    expect(screen.getByText("Supabase public env가 없어 로그인을 시작할 수 없습니다.")).toBeInTheDocument();
  });
});