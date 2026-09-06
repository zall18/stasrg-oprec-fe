import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import GoldenCandidatePage from "./page";
import { ToastProvider } from "@/components/ui/toast";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/api/client", () => ({
  api: {
    getCandidateProfile: vi.fn().mockResolvedValue({
      data: { success: true, data: null },
    }),
  },
}));

describe("app/dashboard/golden-candidate", () => {
  it("renders form sections for personal info, academic, and documents", () => {
    render(
      <ToastProvider>
        <GoldenCandidatePage />
      </ToastProvider>
    );

    expect(
      screen.getByRole("heading", { name: /Formulir Golden Candidate/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Nomor Induk Mahasiswa/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Perguruan Tinggi/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Kurikulum Vitae \(CV\) \*/i)
    ).toBeInTheDocument();
  });
});
