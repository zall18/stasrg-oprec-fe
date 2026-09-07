import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NotificationBell } from "./notification-bell";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  api: {
    getUnreadNotificationCount: vi.fn(),
    getCandidateNotifications: vi.fn(),
    markNotificationRead: vi.fn(),
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

describe("components/ui/notification-bell", () => {
  it("renders notification bell icon and shows badge when unread > 0", async () => {
    (api.getUnreadNotificationCount as any).mockResolvedValue({
      data: { data: { unreadCount: 3 } },
    });

    renderWithClient(<NotificationBell />);

    expect(screen.getByTestId("notification-bell")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("unread-badge")).toHaveTextContent("3");
    });
  });

  it("opens dropdown on click and displays notification item", async () => {
    (api.getUnreadNotificationCount as any).mockResolvedValue({
      data: { data: { unreadCount: 1 } },
    });
    (api.getCandidateNotifications as any).mockResolvedValue({
      data: {
        data: [
          {
            id: "notif-1",
            title: "Jadwal Wawancara Dibuat",
            message: "Silakan konfirmasi jadwal wawancara Anda.",
            isRead: false,
            createdAt: "2026-09-07T10:00:00.000Z",
          },
        ],
      },
    });

    renderWithClient(<NotificationBell />);

    const button = screen.getByLabelText("Buka notifikasi");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Jadwal Wawancara Dibuat")).toBeInTheDocument();
      expect(
        screen.getByText("Silakan konfirmasi jadwal wawancara Anda.")
      ).toBeInTheDocument();
    });
  });
});
