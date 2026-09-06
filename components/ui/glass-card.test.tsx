import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GlassCard } from "./glass-card";

describe("components/ui/glass-card", () => {
  it("renders children properly with rounded-3xl and backdrop-blur", () => {
    render(
      <GlassCard className="test-card">
        <p>Konten Transparan</p>
      </GlassCard>
    );

    const card = screen.getByTestId("glass-card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("rounded-3xl");
    expect(card).toHaveClass("backdrop-blur-md");
    expect(screen.getByText("Konten Transparan")).toBeInTheDocument();
  });
});
