import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CandidateInterviewsPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { api } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  api: {
    getCandidateInterviews: vi.fn(),
    confirmInterview: vi.fn(),
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

describe("app/dashboard/interviews", () => {
  it("renders scheduled interviews with online link and confirmation button", async () => {
    (api.getCandidateInterviews as any).mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: "interview-1",
            candidateId: "user-1",
            datetime: "2026-10-15T09:00:00.000Z",
            type: "ONLINE",
            link: "https://meet.google.com/abc-defg-hij",
            notes: "Sesi teknis TinyML",
            status: "SCHEDULED",
          },
        ],
      },
    });

    renderWithClient(<CandidateInterviewsPage />);

    expect(
      screen.getByRole("heading", { name: /Jadwal Wawancara/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/Sesi Wawancara Daring/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText("https://meet.google.com/abc-defg-hij")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Konfirmasi Kehadiran/i })
      ).toBeInTheDocument();
    });
  });
});
