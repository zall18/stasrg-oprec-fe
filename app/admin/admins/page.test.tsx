import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminManagementPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";

const mockAdmins = [
  {
    id: "admin-1",
    email: "superadmin@stas-rg.ac.id",
    role: "ADMIN",
    createdAt: "2026-09-22T08:00:00.000Z",
  },
  {
    id: "admin-2",
    email: "second.admin@stas-rg.ac.id",
    role: "ADMIN",
    createdAt: "2026-09-22T08:30:00.000Z",
  },
];

vi.mock("@/lib/store/auth.store", () => ({
  useAuthStore: () => ({
    user: { id: "admin-1", email: "superadmin@stas-rg.ac.id", role: "ADMIN" },
    isAuthenticated: true,
  }),
}));

vi.mock("@/lib/api/client", () => ({
  api: {
    getAdmins: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: "admin-1",
            email: "superadmin@stas-rg.ac.id",
            role: "ADMIN",
            createdAt: "2026-09-22T08:00:00.000Z",
          },
          {
            id: "admin-2",
            email: "second.admin@stas-rg.ac.id",
            role: "ADMIN",
            createdAt: "2026-09-22T08:30:00.000Z",
          },
        ],
      },
    }),
    createAdmin: vi.fn().mockResolvedValue({
      data: {
        success: true,
        message: "Akun admin baru berhasil dibuat",
      },
    }),
    resetAdminPassword: vi.fn().mockResolvedValue({
      data: {
        success: true,
        message: "Password berhasil diperbarui",
      },
    }),
    deleteAdmin: vi.fn().mockResolvedValue({
      data: {
        success: true,
        message: "Akun admin berhasil dihapus",
      },
    }),
  },
}));

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AdminManagementPage />
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe("app/admin/admins", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders admin management header, stats, and admin list", async () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: "Kelola Akun Admin" })).toBeInTheDocument();
    expect(screen.getByText("Tambah Admin Baru")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("superadmin@stas-rg.ac.id").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("second.admin@stas-rg.ac.id")).toBeInTheDocument();
    });

    // Verify "Akun Anda" badge on logged-in user
    expect(screen.getByText("Akun Anda")).toBeInTheDocument();
  });

  it("enforces anti self-deletion rule by disabling delete on current user account", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("second.admin@stas-rg.ac.id")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: /Hapus/i });
    // First admin is self -> disabled
    expect(deleteButtons[0]).toBeDisabled();
    // Second admin is not self -> enabled
    expect(deleteButtons[1]).not.toBeDisabled();
  });

  it("opens create admin modal on click", async () => {
    renderComponent();

    const addBtn = screen.getByRole("button", { name: /Tambah Admin Baru/i });
    fireEvent.click(addBtn);

    expect(screen.getByRole("heading", { name: "Tambah Administrator Baru" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Administrator/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kata Sandi Awal/i)).toBeInTheDocument();
  });

  it("opens reset password modal on click", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("second.admin@stas-rg.ac.id")).toBeInTheDocument();
    });

    const resetButtons = screen.getAllByRole("button", { name: /Ganti Password/i });
    fireEvent.click(resetButtons[1]);

    expect(screen.getByRole("heading", { name: "Ganti Password Admin" })).toBeInTheDocument();
    expect(screen.getAllByText("second.admin@stas-rg.ac.id").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/Password Baru/i)).toBeInTheDocument();
  });

  it("filters admin list via search query", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("second.admin@stas-rg.ac.id")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Cari admin berdasarkan/i);
    fireEvent.change(searchInput, { target: { value: "second" } });

    expect(screen.getByText("second.admin@stas-rg.ac.id")).toBeInTheDocument();
    expect(screen.getByText(/Menampilkan/)).toHaveTextContent("Menampilkan 1 dari 2 administrator");
  });
});
