import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("SignInPage", () => {
  it("renders the sign-in heading, supporting copy, and google CTA", async () => {
    const { SignInPage } = await import("#flows/auth-shell/components/SignInPage");

    render(<SignInPage />);

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Continue with Google" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Sign in with the Google account tied to your invite. After sign-in, you will finish profile setup before entering the workspace.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeInTheDocument();
  });
});
