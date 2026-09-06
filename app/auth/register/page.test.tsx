import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RegisterPage from "./page";
import { ToastProvider } from "@/components/ui/toast";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("app/auth/register", () => {
  it("renders register form fields and role selector", () => {
    render(
      <ToastProvider>
        <RegisterPage />
      </ToastProvider>
    );

    expect(
      screen.getByRole("heading", { name: /Registrasi Akun/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Institusi/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Kata Sandi")).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipe Akun/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Daftar Sekarang/i })
    ).toBeInTheDocument();
  });
});
