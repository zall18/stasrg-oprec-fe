import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CandidateDashboardPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/api/client", () => ({
  api: {
    getCandidateProfile: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          fullName: "Alif Akbar",
          nim: "102022530058",
          universitas: "Universitas Indonesia",
          programStudi: "Sistem Informasi",
          roleInterest: "RISET",
          cvUrl: "https://storage.stasrg.org/cv.pdf",
          portfolioUrl: "https://github.com/alif",
          transkripUrl: "https://storage.stasrg.org/transkrip.pdf",
          ksmUrl: "https://storage.stasrg.org/ksm.pdf",
          eprtUrl: "https://storage.stasrg.org/eprt.pdf",
          linkedinUrl: "https://linkedin.com/in/alif",
        },
      },
    }),
    getRegistrationsHistory: vi.fn().mockResolvedValue({
      data: { success: true, data: [{ id: "reg-1", status: "PENDING", batchName: "Batch 1" }] },
    }),
    getGoldenApplication: vi.fn().mockResolvedValue({
      data: { success: true, data: null },
    }),
    getCandidateInterviews: vi.fn().mockResolvedValue({
      data: { success: true, data: [] },
    }),
  },
}));

describe("app/dashboard", () => {
  it("renders prominent Golden Ticket, Reguler track CTAs, and candidate guide", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CandidateDashboardPage />
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { name: /Halo/i })).toBeInTheDocument();
    expect(screen.getAllByText(/JALUR GOLDEN TICKET/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/JALUR REGULER/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Panduan Langkah: Apa yang Harus Dilakukan Setelah Login\?/i)).toBeInTheDocument();
    expect(await screen.findByTestId("progress-stepper")).toBeInTheDocument();
  });
});
