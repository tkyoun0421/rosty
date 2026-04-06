import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("AdminShellPage", () => {
  it("blocks non-admins", async () => {
    getCurrentUser.mockResolvedValue({ id: "worker-1", email: "worker@example.com", role: "worker" });

    const { AdminShellPage } = await import("#flows/admin-shell/components/AdminShellPage");
    render(await AdminShellPage());

    expect(screen.getByText("Admin access is required.")).toBeInTheDocument();
  });

  it("shows admin workspace destinations for admins", async () => {
    getCurrentUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });

    const { AdminShellPage } = await import("#flows/admin-shell/components/AdminShellPage");
    render(await AdminShellPage());

    expect(screen.getAllByText("Admin workspace")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Open schedules" })).toHaveAttribute(
      "href",
      "/admin/schedules",
    );
    expect(screen.getByRole("link", { name: "Open operations dashboard" })).toHaveAttribute(
      "href",
      "/admin/operations",
    );
    expect(screen.getByRole("link", { name: "Open invites" })).toHaveAttribute(
      "href",
      "/admin/invites",
    );
    expect(screen.getByRole("link", { name: "Open worker rates" })).toHaveAttribute(
      "href",
      "/admin/worker-rates",
    );
  });
});
