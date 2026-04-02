import { readFile } from "node:fs/promises";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminUser = vi.fn();

vi.mock("#mutations/invite/actions/createWorkerInvite", () => ({
  createWorkerInvite: vi.fn(),
}));

vi.mock("#queries/access/dal/requireAdminUser", () => ({
  requireAdminUser,
}));

describe("Admin invites page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminUser.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
    });
  });

  it("renders the invite management heading and CTA for admin sessions", async () => {
    const { AdminInvitesPage } = await import(
      "#flows/admin-invites/components/AdminInvitesPage"
    );

    render(await AdminInvitesPage());

    expect(screen.getByRole("heading", { name: "초대 관리" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "근무자 초대 생성" })).toBeInTheDocument();
  });

  it("shows the denied access copy and hides the invite CTA when admin access is rejected", async () => {
    requireAdminUser.mockRejectedValue(new Error("FORBIDDEN"));

    const { AdminInvitesPage } = await import(
      "#flows/admin-invites/components/AdminInvitesPage"
    );

    render(await AdminInvitesPage());

    expect(screen.getByText("Admin access required.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "근무자 초대 생성" })).not.toBeInTheDocument();
  });

  it("keeps admin gating in the thin /admin/invites route", async () => {
    const routeSource = await readFile("src/app/admin/invites/page.tsx", "utf8");
    const page = await import("#app/admin/invites/page");

    render(await page.default());

    expect(routeSource).toContain("return await AdminInvitesPage()");
    expect(routeSource).not.toContain("requireAdminUser");
    expect(requireAdminUser).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "초대 관리" })).toBeInTheDocument();
  });
});
