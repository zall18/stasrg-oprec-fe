import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CandidateDetailPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "c-123" }),
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api/client", () => ({
  api: {
    getCandidateById: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          id: "c-123",
          profile: {
            fullName: "Alif Akbar",
            nim: "102022530058",
            universitas: "UI",
            programStudi: "Sistem Informasi",
            roleInterest: "RISET",
            cvUrl: "https://storage.stasrg.org/cv.pdf",
            portfolioUrl: "https://github.com/alif",
          },
          registration: {
            id: "reg-123",
            status: "PENDING",
          },
        },
      },
    }),
    updateCandidateStatus: vi.fn().mockResolvedValue({ data: { success: true } }),
    assignProject: vi.fn().mockResolvedValue({ data: { success: true } }),
    getCandidateNotes: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    addCandidateNote: vi.fn().mockResolvedValue({ data: { success: true } }),
    deleteCandidateNote: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

describe("app/admin/candidates/[id]", () => {
  it("renders candidate full details, status updater, and preview buttons", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <CandidateDetailPage />
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(
      await screen.findByRole("heading", { name: "Alif Akbar" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Informasi Akademik/i)).toBeInTheDocument();
    expect(screen.getByText("Berkas & Portofolio")).toBeInTheDocument();
    expect(screen.getByText("Preview File")).toBeInTheDocument();
    expect(screen.getByText("Catatan Internal Admin")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Simpan Perubahan/i })
    ).toBeInTheDocument();
  });

  it("renders golden candidate section and opens motivation essay popup modal when clicked", async () => {
    const { api } = await import("@/lib/api/client");
    vi.mocked(api.getCandidateById).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: "c-123",
          profile: {
            fullName: "Budi Santoso",
            nim: "1906123456",
            universitas: "UI",
            programStudi: "Ilmu Komputer",
            roleInterest: "RISET",
            isGoldenCandidate: true,
          },
          goldenApplication: {
            id: "ga-1",
            motivasi: "Saya sangat tertarik mendalami riset machine learning dan AI.",
            pencapaian: "Juara 1 Hackathon Nasional 2026",
            rekomendasi: "Prof. Dr. Ir. Riset",
            status: "ADMINISTRATIVE",
          },
        },
      },
    } as any);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <CandidateDetailPage />
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Aplikasi & Prestasi Jalur Golden")).toBeInTheDocument();
    expect(screen.getByText("Juara 1 Hackathon Nasional 2026")).toBeInTheDocument();

    // The popup should not be visible initially
    expect(screen.queryByText("Esai Motivasi Riset Kandidat")).not.toBeInTheDocument();

    // Click the trigger card / button
    const openBtn = screen.getByText(/Klik untuk Buka Popup/i);
    fireEvent.click(openBtn);

    // Now the modal popup should appear
    expect(screen.getByText("Esai Motivasi Riset Kandidat")).toBeInTheDocument();
    expect(screen.getAllByText(/Saya sangat tertarik mendalami riset machine learning/i).length).toBeGreaterThanOrEqual(2);

    // Click "Tutup" button inside modal
    const closeBtn = screen.getByRole("button", { name: "Tutup" });
    fireEvent.click(closeBtn);

    // Popup modal should close
    expect(screen.queryByText("Esai Motivasi Riset Kandidat")).not.toBeInTheDocument();
  });

  it("renders mode toggle and allows switching between Oprec decision and Golden decision when candidate has both", async () => {
    const { api } = await import("@/lib/api/client");
    vi.mocked(api.getCandidateById).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: "c-dual-123",
          profile: {
            fullName: "Citra Kirana",
            nim: "10203344",
            universitas: "ITB",
            programStudi: "Teknik Informatika",
            roleInterest: "RISET",
            isGoldenCandidate: true,
          },
          registration: {
            id: "reg-dual-123",
            status: "WAWANCARA_1",
          },
          goldenApplication: {
            id: "ga-dual-123",
            motivasi: "Motivasi riset mendalam",
            pencapaian: "Finalis Gemastik",
            status: "ADMINISTRATIVE",
          },
        },
      },
    } as any);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <CandidateDetailPage />
        </ToastProvider>
      </QueryClientProvider>
    );

    // Initial default is Oprec mode
    expect(await screen.findByText("Aksi Keputusan Seleksi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Jalur Oprec Reguler/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Jalur Golden Ticket/i })).toBeInTheDocument();
    expect(screen.queryByText("Keputusan Golden Ticket")).not.toBeInTheDocument();

    // Click to switch to Golden decision
    fireEvent.click(screen.getByRole("button", { name: /Jalur Golden Ticket/i }));

    // Now Golden decision should be visible and Oprec decision hidden
    expect(screen.getByText("Keputusan Golden Ticket")).toBeInTheDocument();
    expect(screen.queryByText("Aksi Keputusan Seleksi")).not.toBeInTheDocument();

    // Click to switch back to Oprec decision
    fireEvent.click(screen.getByRole("button", { name: /Jalur Oprec Reguler/i }));
    expect(screen.getByText("Aksi Keputusan Seleksi")).toBeInTheDocument();
    expect(screen.queryByText("Keputusan Golden Ticket")).not.toBeInTheDocument();
  });
});

