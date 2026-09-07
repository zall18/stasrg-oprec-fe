import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminCandidatesPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ToastProvider } from "@/components/ui/toast";

vi.mock("@/lib/api/client", () => ({
  api: {
    getCandidates: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          candidates: [
            {
              id: "c-1",
              fullName: "Budi Santoso",
              nim: "102022530099",
              universitas: "ITB",
              programStudi: "Teknik Elektro",
              roleInterest: "RISET",
              status: "PENDING",
              isGolden: true,
            },
          ],
          meta: { total: 1, totalPages: 1, page: 1 },
        },
      },
    }),
    bulkUpdateCandidateStatus: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

describe("app/admin/candidates", () => {
  it("renders candidate table header and search input", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AdminCandidatesPage />
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(
      screen.getByRole("heading", { name: /Manajemen Pendaftar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Cari nama, NIM, email/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /Pilih Semua/i })
    ).toBeInTheDocument();
  });
});
