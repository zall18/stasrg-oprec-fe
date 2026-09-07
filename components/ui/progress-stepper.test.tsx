import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProgressStepper } from "./progress-stepper";

describe("components/ui/progress-stepper", () => {
  it("renders all 5 normal steps when status is PENDING", () => {
    render(<ProgressStepper currentStatus="PENDING" />);
    expect(screen.getByTestId("progress-stepper")).toBeInTheDocument();
    expect(screen.getByText("Pendaftaran")).toBeInTheDocument();
    expect(screen.getByText("Seleksi Berkas")).toBeInTheDocument();
    expect(screen.getByText("Wawancara 1")).toBeInTheDocument();
    expect(screen.getByText("Wawancara 2")).toBeInTheDocument();
    expect(screen.getByText("Hasil Akhir")).toBeInTheDocument();
  });

  it("renders rejection alert state when status is DITOLAK", () => {
    render(<ProgressStepper currentStatus="DITOLAK" />);
    expect(
      screen.getByText("Status Seleksi: Belum Memenuhi Kualifikasi")
    ).toBeInTheDocument();
  });
});
