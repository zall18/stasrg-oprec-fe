import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Logo } from "./logo";

describe("components/ui/logo", () => {
  it("renders logo image and text title", () => {
    render(<Logo subtitle="Test Subtitle" />);
    const img = screen.getByAltText("STAS-RG Logo");
    expect(img).toBeInTheDocument();
    expect(screen.getByText("STAS-RG")).toBeInTheDocument();
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
  });
});
