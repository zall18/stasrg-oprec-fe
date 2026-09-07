import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminBatchesPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { api } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  api: {
    getBatches: vi.fn(),
    createBatch: vi.fn(),
    updateBatch: vi.fn(),
    deleteBatch: vi.fn(),
    activateBatch: vi.fn(),
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

describe("app/admin/oprec", () => {
  it("renders batches list and add batch button", async () => {
    (api.getBatches as any).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: "batch-1",
            name: "Batch 1 - 2026",
            description: "Oprec Riset Edge AI",
            quota: 40,
            isActive: true,
            totalApplicants: 15,
          },
        ],
      },
    });

    renderWithClient(<AdminBatchesPage />);

    expect(
      screen.getByRole("heading", { name: /Manajemen Batch Oprec/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Buat Batch Baru/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Batch 1 - 2026")).toBeInTheDocument();
      expect(screen.getByText("Oprec Riset Edge AI")).toBeInTheDocument();
      expect(screen.getByText("15 orang")).toBeInTheDocument();
    });
  });
});
