import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("InviteTokenPage", () => {
  it("renders invite-specific copy and the google invite CTA", async () => {
    const pageModule = await import("#app/invite/[token]/page");

    render(await pageModule.default({ params: Promise.resolve({ token: "invite-token" }) }));

    expect(screen.getByText("Invite")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Accept your invite" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Sign in with Google to accept your invite. After sign-in, you will finish profile setup before entering the workspace.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept invite with Google" })).toBeInTheDocument();
  });
});
