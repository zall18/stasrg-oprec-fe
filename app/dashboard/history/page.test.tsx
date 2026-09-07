import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CandidateHistoryPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  api: {
    getRegistrationsHistory: vi.fn(),
  },
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("app/dashboard/history", () => {
  it("renders registrations list with batch name and status", async () => {
    (api.getRegistrationsHistory as any).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: "reg-1",
            batchName: "Batch 1 - 2026",
            status: "SELEKSI_BERKAS",
            appliedAt: "2026-09-07T08:00:00.000Z",
          },
        ],
      },
    });

    renderWithClient(<CandidateHistoryPage />);

    expect(
      screen.getByRole("heading", { name: /Riwayat Pendaftaran/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Batch 1 - 2026")).toBeInTheDocument();
      expect(screen.getByText("Status: SELEKSI_BERKAS")).toBeInTheDocument();
    });
  });
});
