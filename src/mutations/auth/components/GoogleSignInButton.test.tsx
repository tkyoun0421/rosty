import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const startGoogleSignIn = vi.fn();

vi.mock("#mutations/auth/actions/startGoogleSignIn", () => ({
  startGoogleSignIn,
}));

describe("GoogleSignInButton", () => {
  it("starts google sign-in on click", async () => {
    const { GoogleSignInButton } = await import("#mutations/auth/components/GoogleSignInButton");

    render(<GoogleSignInButton label="Google로 계속" inviteToken="invite-token" />);
    fireEvent.click(screen.getByRole("button", { name: "Google로 계속" }));

    expect(startGoogleSignIn).toHaveBeenCalledWith(window.location.origin, "invite-token");
  });
});
