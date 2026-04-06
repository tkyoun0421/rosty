import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("UnauthorizedPage", () => {
  it("renders the unauthorized heading and recovery links", async () => {
    const pageModule = await import("#app/unauthorized/page");

    render(pageModule.default());

    expect(screen.getByText("Access required")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "You do not have access to this area" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Go to sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
  });
});
