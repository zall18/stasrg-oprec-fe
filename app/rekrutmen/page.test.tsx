import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RekrutmenPage from "./page";
import { ToastProvider } from "@/components/ui/toast";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api/client", () => ({
  api: {
    getOprecStatus: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          isOprecActive: true,
          currentBatch: "Batch 1 - 2026",
        },
      },
    }),
  },
}));

describe("app/rekrutmen", () => {
  it("renders recruitment info, role explanations, and application form", () => {
    render(
      <ToastProvider>
        <RekrutmenPage />
      </ToastProvider>
    );

    expect(
      screen.getByRole("heading", {
        name: /Panduan Lengkap Seleksi & Pendaftaran Kandidat/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Mahasiswa Riset")).toBeInTheDocument();
    expect(screen.getByText("Mahasiswa Magang")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /3\. Formulir Pendaftaran Terpadu/i,
      })
    ).toBeInTheDocument();
  });
});
