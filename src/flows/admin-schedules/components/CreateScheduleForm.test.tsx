import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("#mutations/schedule/actions/submitSchedule", () => ({
  submitSchedule: vi.fn(),
}));

describe("CreateScheduleForm", () => {
  it("renders the readable schedule creation surface", async () => {
    const { CreateScheduleForm } = await import(
      "#flows/admin-schedules/components/CreateScheduleForm"
    );

    render(<CreateScheduleForm />);

    expect(screen.getByRole("heading", { name: "Create schedule" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "New schedules start in Recruiting so admins can collect applicants before assignments.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Work date")).toBeInTheDocument();
    expect(screen.getByLabelText("Starts at")).toBeInTheDocument();
    expect(screen.getByLabelText("Ends at")).toBeInTheDocument();
    expect(screen.getByLabelText("Role code")).toBeInTheDocument();
    expect(screen.getByLabelText("Headcount")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add another role" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove role" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save schedule" })).toBeInTheDocument();
  });
});
