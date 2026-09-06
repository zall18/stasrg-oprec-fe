import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminLayout from "./layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/store/auth.store", () => ({
  useAuthStore: () => ({
    user: { email: "admin@stasrg.org", role: "ADMIN" },
    isAuthenticated: true,
    loadFromStorage: vi.fn(),
    clearAuth: vi.fn(),
  }),
}));

vi.mock("@/lib/api/client", () => ({
  api: {
    getRecruitmentSetting: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          isActive: true,
          currentBatch: "Oprec Batch 1 - 2026",
        },
      },
    }),
    updateRecruitmentSetting: vi.fn().mockResolvedValue({ data: { success: true } }),
    exportCandidates: vi.fn().mockResolvedValue({ data: "mock-csv" }),
  },
}));

describe("app/admin/layout", () => {
  it("renders admin sidebar with navigation and oprec widget", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AdminLayout>
            <div>Dashboard Content</div>
          </AdminLayout>
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
    expect(screen.getByText("Ringkasan & Statistik")).toBeInTheDocument();
    expect(screen.getByText("Manajemen Pelamar")).toBeInTheDocument();
    expect(screen.getByText("Atur Pendaftaran")).toBeInTheDocument();
    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
  });
});
