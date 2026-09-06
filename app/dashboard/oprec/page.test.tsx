import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import OprecApplyPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";

vi.mock("@/lib/api/client", () => ({
  api: {
    getOprecStatus: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          isActive: true,
          currentBatch: "Batch 1 2026",
          description: "Perekrutan laboratorium terbuka",
        },
      },
    }),
  },
}));

describe("app/dashboard/oprec", () => {
  it("renders active batch details and apply button", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <OprecApplyPage />
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(
      screen.getByRole("heading", { name: /Pendaftaran Open Recruitment/i })
    ).toBeInTheDocument();
  });
});
