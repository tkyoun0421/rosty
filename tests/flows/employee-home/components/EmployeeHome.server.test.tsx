import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmployeeHome } from "#flows/employee-home/components/EmployeeHome.server";

describe("EmployeeHome", () => {
  it("connects dashboard cards to the active release 1 employee flows", () => {
    render(<EmployeeHome />);

    expect(screen.getByRole("link", { name: "스케줄 신청 열기" })).toHaveAttribute(
      "href",
      "/schedule",
    );
    expect(screen.getByRole("link", { name: "배정 스케줄 보기" })).toHaveAttribute(
      "href",
      "/schedule/assigned",
    );
  });
});
