import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminDashboardPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";

vi.mock("@/lib/api/client", () => ({
  api: {
    getDashboardStats: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          totalCandidates: 45,
          statusCounts: { PENDING: 10, DITERIMA: 5 },
          roleCounts: { RISET: 25, MAGANG: 20 },
        },
      },
    }),
    getRecruitmentSetting: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          isActive: true,
          currentBatch: "Batch 1 2026",
        },
      },
    }),
    updateRecruitmentSetting: vi.fn().mockResolvedValue({
      data: { success: true },
    }),
  },
}));

describe("app/admin/dashboard", () => {
  it("renders statistics cards and batch controller", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AdminDashboardPage />
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(
      screen.getByRole("heading", { name: /Statistik & Overview Seleksi/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Total Pelamar Masuk")).toBeInTheDocument();
    expect(screen.getByText("Pengaturan Batch Pendaftaran")).toBeInTheDocument();
  });
});
