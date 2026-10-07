import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ConfirmAdminPage from "./page";
import { ToastProvider } from "@/components/ui/toast";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
}));

describe("app/auth/confirm-admin", () => {
  it("renders confirm admin page without crashing", () => {
    render(
      <ToastProvider>
        <ConfirmAdminPage />
      </ToastProvider>
    );

    expect(screen.getByText(/Tautan Tidak Valid atau Kadaluarsa/i)).toBeInTheDocument();
  });
});
