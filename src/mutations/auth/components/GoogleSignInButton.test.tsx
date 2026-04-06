import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const startGoogleSignIn = vi.fn();

vi.mock("#mutations/auth/actions/startGoogleSignIn", () => ({
  startGoogleSignIn,
}));

describe("GoogleSignInButton", () => {
  it("starts google sign-in on click", async () => {
    const { GoogleSignInButton } = await import("#mutations/auth/components/GoogleSignInButton");

    render(<GoogleSignInButton label="Continue with Google" inviteToken="invite-token" />);
    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));

    await waitFor(() => {
      expect(startGoogleSignIn).toHaveBeenCalledWith(window.location.origin, "invite-token");
    });
  });
});
