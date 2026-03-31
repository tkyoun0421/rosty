import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

describe("WorkerShellPage", () => {
  it("blocks non-workers", async () => {
    getCurrentUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });

    const { WorkerShellPage } = await import("#flows/worker-shell/components/WorkerShellPage");
    render(await WorkerShellPage());

    expect(screen.getByText("Worker access is required.")).toBeInTheDocument();
  });

  it("shows links for recruiting schedules and confirmed work", async () => {
    getCurrentUser.mockResolvedValue({ id: "worker-1", email: "worker@example.com", role: "worker" });

    const { WorkerShellPage } = await import("#flows/worker-shell/components/WorkerShellPage");
    render(await WorkerShellPage());

    expect(screen.getByRole("heading", { name: "Worker home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open schedules" })).toHaveAttribute(
      "href",
      "/worker/schedules",
    );
    expect(screen.getByRole("link", { name: "Confirmed work" })).toHaveAttribute(
      "href",
      "/worker/assignments",
    );
  });
});
