import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminAnnouncementsPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { api } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  api: {
    getAnnouncements: vi.fn(),
    createAnnouncement: vi.fn(),
    updateAnnouncement: vi.fn(),
    deleteAnnouncement: vi.fn(),
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

describe("app/admin/announcements", () => {
  it("renders announcements header, create button, and items", async () => {
    (api.getAnnouncements as any).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: "ann-1",
            title: "Pengumuman Hasil Seleksi Berkas Batch 1",
            content: "Silakan cek status di portal masing-masing kandidat.",
            isActive: true,
            createdAt: "2026-09-07T10:00:00.000Z",
          },
        ],
      },
    });

    renderWithClient(<AdminAnnouncementsPage />);

    expect(
      screen.getByRole("heading", { name: /Manajemen Pengumuman/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Buat Pengumuman/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("Pengumuman Hasil Seleksi Berkas Batch 1")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Silakan cek status di portal masing-masing kandidat.")
      ).toBeInTheDocument();
      expect(screen.getByText("Tayang")).toBeInTheDocument();
    });
  });
});
