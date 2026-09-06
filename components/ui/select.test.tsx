import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Select } from "./select";

describe("components/ui/select", () => {
  const options = [
    { label: "Pilih Role", value: "" },
    { label: "Mahasiswa Riset", value: "RISET" },
    { label: "Magang", value: "MAGANG" },
  ];

  it("renders with options and label", () => {
    render(<Select label="Pilihan Role" options={options} defaultValue="" />);
    expect(screen.getByLabelText("Pilihan Role")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("triggers onChange when selection changes", () => {
    const handleChange = vi.fn();
    render(
      <Select
        label="Role"
        options={options}
        defaultValue=""
        onChange={handleChange}
      />
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "RISET" } });
    expect(handleChange).toHaveBeenCalled();
  });
});
