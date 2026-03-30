import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminHome } from "#flows/admin-home/components/AdminHome.server";

describe("AdminHome", () => {
  it("connects dashboard cards to the current admin routes", () => {
    render(<AdminHome />);

    expect(screen.getByRole("link", { name: "요청 검토하러 가기" })).toHaveAttribute(
      "href",
      "/admin/schedule-requests",
    );
    expect(screen.getByRole("link", { name: "전체 일정 보기" })).toHaveAttribute(
      "href",
      "/admin/schedule-overview",
    );
  });
});
