import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./button";

describe("components/ui/button", () => {
  it("renders with text and handles click", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Daftar Sekarang</Button>);

    const button = screen.getByRole("button", { name: /Daftar Sekarang/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button and shows spinner when isLoading is true to prevent spam", () => {
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Kirim Berkas
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
