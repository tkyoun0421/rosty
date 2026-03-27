import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SignInShell } from "#flows/auth-entry/components/SignInShell.server";

describe("SignInShell", () => {
  it("renders employee and admin scaffold entry points", () => {
    render(<SignInShell />);

    expect(
      screen.getByRole("heading", { name: /웨딩홀 근무 운영 시작/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /직원으로 시작/i }),
    ).toHaveAttribute("href", "/api/dev/session?role=employee");
    expect(
      screen.getByRole("link", { name: /관리자로 시작/i }),
    ).toHaveAttribute("href", "/api/dev/session?role=admin");
  });
});