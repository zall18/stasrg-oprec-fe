import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminBatchDetailPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  api: {
    getBatchById: vi.fn(),
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

describe("app/admin/oprec/[batchId]", () => {
  it("renders batch detail stats and breakdown", async () => {
    (api.getBatchById as any).mockResolvedValue({
      data: {
        success: true,
        data: {
          id: "batch-1",
          name: "Batch 1 - 2026",
          description: "Topik TinyML dan IoT",
          totalApplicants: 25,
          quota: 30,
          goldenCandidateCount: 5,
          statusBreakdown: {
            PENDING: 10,
            DITERIMA: 3,
          },
          roleBreakdown: {
            RISET: 15,
            MAGANG: 10,
          },
        },
      },
    });

    renderWithClient(
      <AdminBatchDetailPage params={{ batchId: "batch-1" }} />
    );

    await waitFor(() => {
      expect(screen.getByText("Batch 1 - 2026")).toBeInTheDocument();
      expect(screen.getByText("Topik TinyML dan IoT")).toBeInTheDocument();
      expect(screen.getByText("15 kandidat")).toBeInTheDocument();
    });
  });
});
