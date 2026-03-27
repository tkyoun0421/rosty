import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock, redirectMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  redirectMock: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

let mockRole: string | undefined;

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import HomePage from "#app/page";

describe("HomePage", () => {
  beforeEach(() => {
    mockRole = undefined;
    cookiesMock.mockResolvedValue({
      get: (name: string) => {
        if (name !== "rosty-role" || !mockRole) {
          return undefined;
        }

        return { value: mockRole };
      },
    });
    redirectMock.mockClear();
  });

  it("renders employee home instead of redirecting back to root for employee role", async () => {
    mockRole = "employee";

    const ui = (await HomePage()) as ReactElement;
    render(ui);

    expect(screen.getByText("Employee Home")).toBeInTheDocument();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects admin role to the admin home route", async () => {
    mockRole = "admin";

    await expect(HomePage()).rejects.toThrow("REDIRECT:/admin");
    expect(redirectMock).toHaveBeenCalledWith("/admin");
  });

  it("redirects missing role to sign-in", async () => {
    await expect(HomePage()).rejects.toThrow("REDIRECT:/sign-in");
    expect(redirectMock).toHaveBeenCalledWith("/sign-in");
  });
});