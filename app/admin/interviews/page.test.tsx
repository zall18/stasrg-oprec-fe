import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminInterviewsPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { api } from "@/lib/api/client";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api/client", () => ({
  api: {
    getAdminInterviews: vi.fn(),
    getCandidates: vi.fn(),
    createInterview: vi.fn(),
    updateInterview: vi.fn(),
    cancelInterview: vi.fn(),
  },
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>
  );
}

describe("app/admin/interviews", () => {
  it("renders interviews header, add button, and interview list", async () => {
    (api.getAdminInterviews as any).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: "iv-1",
            candidateId: "cand-1",
            datetime: "2026-10-15T09:00:00.000Z",
            type: "ONLINE",
            link: "https://meet.google.com/xyz-123",
            status: "SCHEDULED",
            candidate: {
              fullName: "Ahmad Dahlan",
              universitas: "UGM",
            },
          },
        ],
      },
    });
    (api.getCandidates as any).mockResolvedValue({
      data: { success: true, data: [] },
    });

    renderWithClient(<AdminInterviewsPage />);

    expect(
      await screen.findByRole("heading", { name: /Penjadwalan Wawancara/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Buat Jadwal Wawancara/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Ahmad Dahlan")).toBeInTheDocument();
      expect(screen.getByText("UGM")).toBeInTheDocument();
    });
  });
});
