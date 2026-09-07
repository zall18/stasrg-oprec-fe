import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import GoldenCandidatePublicPage from "./page";

describe("app/golden-candidate", () => {
  it("renders hero title, benefits, and call to action buttons", () => {
    render(<GoldenCandidatePublicPage />);

    expect(screen.getByText(/Golden Candidate STAS-RG/i)).toBeInTheDocument();
    expect(screen.getByText("Fast-Track Seleksi")).toBeInTheDocument();
    expect(screen.getByText("Matching Proyek Prioritas")).toBeInTheDocument();
    expect(screen.getByText("Mentoring Langsung Pimpinan")).toBeInTheDocument();
    expect(screen.getByText("Kriteria & Syarat Pendaftar")).toBeInTheDocument();
    expect(
      screen.getByText("Isi Formulir Golden Candidate")
    ).toBeInTheDocument();
  });
});
