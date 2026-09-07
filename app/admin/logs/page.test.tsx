import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminActivityLogsPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  api: {
    getActivityLogs: vi.fn(),
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

describe("app/admin/logs", () => {
  it("renders activity logs header, filter, and audit entries", async () => {
    (api.getActivityLogs as any).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: "log-1",
            action: "SCHEDULE_INTERVIEW",
            targetType: "INTERVIEW",
            details: "Wawancara dengan kandidat Budi dijadwalkan",
            createdAt: "2026-09-07T12:00:00.000Z",
            user: { email: "admin@stas-rg.ac.id", role: "ADMIN" },
          },
        ],
        meta: { total: 1, totalPages: 1, page: 1 },
      },
    });

    renderWithClient(<AdminActivityLogsPage />);

    expect(
      screen.getByRole("heading", { name: /Log Aktivitas & Audit Trail/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("SCHEDULE_INTERVIEW")).toBeInTheDocument();
      expect(screen.getByText("admin@stas-rg.ac.id")).toBeInTheDocument();
      expect(
        screen.getByText("Wawancara dengan kandidat Budi dijadwalkan")
      ).toBeInTheDocument();
    });
  });
});
