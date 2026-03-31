import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const getCurrentUser = vi.fn();
vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

describe("AdminShellPage", () => {
  it("renders admin content only for admins", async () => {
    getCurrentUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });

    const { AdminShellPage } = await import("#flows/admin-shell/components/AdminShellPage");
    render(await AdminShellPage());

    expect(screen.getByText("관리자 홈")).toBeInTheDocument();
  });
});

