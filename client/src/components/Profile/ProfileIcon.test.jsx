import { render, screen, fireEvent } from "@testing-library/react";

import { describe, it, expect } from "vitest";
import ProfileIcon from "./ProfileIcon";

describe("ProfileIcon", () => {
  it("opens modal and shows preferences and account info", () => {
    render(<ProfileIcon accountName="Test Account" accountType="Primary" />);
    fireEvent.click(screen.getByRole("button", { name: /profile/i }));
    expect(screen.getByText(/Account Name: Test Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Type: Primary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Savings Goal/i)).toBeChecked();
    expect(screen.getByLabelText(/Round Up/i)).toBeChecked();
    expect(screen.getByLabelText(/Savings Goal/i)).toBeDisabled();
    expect(screen.getByLabelText(/Round Up/i)).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByText(/Test Account/i)).not.toBeInTheDocument();
  });
});
