import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HomePage from "./page";

// Mock api client
vi.mock("@/lib/api/client", () => ({
  api: {
    getOprecStatus: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          isActive: true,
          currentBatch: "Batch 1 2026",
        },
      },
    }),
    getAnnouncements: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: [],
      },
    }),
  },
}));

describe("app/page", () => {
  it("renders hero title and role cards", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /Membangun Masa Depan Bersama STAS-RG/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Mahasiswa Riset")).toBeInTheDocument();
    expect(screen.getByText("Mahasiswa Magang")).toBeInTheDocument();
    expect(screen.getByText("Golden Candidate")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login untuk Mendaftar/i })).toBeInTheDocument();
  });
});
