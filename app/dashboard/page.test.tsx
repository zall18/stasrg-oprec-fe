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
        },
      },
    }),
    getRegistrationsHistory: vi.fn().mockResolvedValue({
      data: { success: true, data: [] },
    }),
    getCandidateInterviews: vi.fn().mockResolvedValue({
      data: { success: true, data: [] },
    }),
  },
}));

describe("app/dashboard", () => {
  it("renders candidate summary with fetched data and progress stepper", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CandidateDashboardPage />
      </QueryClientProvider>
    );

    expect(
      screen.getByRole("heading", { name: /Halo/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Ringkasan Data Diri")).toBeInTheDocument();
    expect(screen.getByTestId("progress-stepper")).toBeInTheDocument();
  });
});
