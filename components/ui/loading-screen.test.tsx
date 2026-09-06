import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LoadingScreen } from "./loading-screen";

describe("components/ui/loading-screen", () => {
  it("renders when showFullscreen is true", () => {
    render(<LoadingScreen showFullscreen message="Menghubungkan ke server..." />);
    expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
    expect(screen.getByText("Menghubungkan ke server...")).toBeInTheDocument();
  });

  it("does not render when showFullscreen is false", () => {
    const { container } = render(<LoadingScreen showFullscreen={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
