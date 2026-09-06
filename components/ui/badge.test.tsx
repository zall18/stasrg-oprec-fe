import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "./badge";

describe("components/ui/badge", () => {
  it("renders DITERIMA status with emerald styling", () => {
    render(<Badge variant="DITERIMA">Diterima</Badge>);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-emerald-800");
  });

  it("renders GOLDEN badge with amber styling", () => {
    render(<Badge variant="GOLDEN">★ Golden Ticket</Badge>);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-amber-900");
  });
});
