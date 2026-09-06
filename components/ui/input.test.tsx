import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Input } from "./input";

describe("components/ui/input", () => {
  it("renders with label and placeholder", () => {
    render(
      <Input
        label="NIM Mahasiswa"
        placeholder="102022530058"
      />
    );

    expect(screen.getByLabelText("NIM Mahasiswa")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("102022530058")).toBeInTheDocument();
  });

  it("displays error message properly", () => {
    render(
      <Input
        label="Email"
        error="Format email tidak valid"
      />
    );

    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
  });

  it("handles onChange events", () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Masukkan nama" onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Masukkan nama");
    fireEvent.change(input, { target: { value: "Alif Akbar" } });
    expect(handleChange).toHaveBeenCalled();
  });
});
