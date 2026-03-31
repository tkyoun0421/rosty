import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const getCurrentUser = vi.fn();
vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

describe("WorkerShellPage", () => {
  it("blocks non-workers", async () => {
    getCurrentUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });

    const { WorkerShellPage } = await import("#flows/worker-shell/components/WorkerShellPage");
    render(await WorkerShellPage());

    expect(screen.getByText("근무자 권한이 필요합니다.")).toBeInTheDocument();
  });
});

