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

describe("WorkerShellPage", () => {
  it("blocks non-workers", async () => {
    getCurrentUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });

    const { WorkerShellPage } = await import("#flows/worker-shell/components/WorkerShellPage");
    render(await WorkerShellPage());

    expect(screen.getByText("Worker access is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Sign in with a worker account to review schedules and confirmed work."),
    ).toBeInTheDocument();
  });

  it("shows the worker workspace shell and primary links", async () => {
    getCurrentUser.mockResolvedValue({ id: "worker-1", email: "worker@example.com", role: "worker" });

    const { WorkerShellPage } = await import("#flows/worker-shell/components/WorkerShellPage");
    render(await WorkerShellPage());

    expect(screen.getByText("Worker workspace")).toBeInTheDocument();
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
