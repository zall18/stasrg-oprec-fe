import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RegisterPage from "./page";
import { ToastProvider } from "@/components/ui/toast";
import { api } from "@/lib/api/client";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/lib/api/client", () => ({
  api: {
    sendOtp: vi.fn(),
    register: vi.fn(),
  },
}));

describe("app/auth/register", () => {
  it("renders register form fields including email, OTP, and password", () => {
    render(
      <ToastProvider>
        <RegisterPage />
      </ToastProvider>
    );

    expect(
      screen.getByRole("heading", { name: /Registrasi Akun/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Institusi/i)).toBeInTheDocument();
    expect(screen.getByText(/Kode Verifikasi OTP/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Kirim Kode OTP/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Kata Sandi")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Daftar Sekarang/i })
    ).toBeInTheDocument();
  });

  it("handles sending OTP and shows cooldown", async () => {
    vi.mocked(api.sendOtp).mockResolvedValueOnce({ data: { success: true } } as any);

    render(
      <ToastProvider>
        <RegisterPage />
      </ToastProvider>
    );

    const emailInput = screen.getByLabelText(/Email Institusi/i);
    fireEvent.change(emailInput, { target: { value: "test@campus.ac.id" } });

    const sendOtpBtn = screen.getByRole("button", { name: /Kirim Kode OTP/i });
    fireEvent.click(sendOtpBtn);

    await waitFor(() => {
      expect(api.sendOtp).toHaveBeenCalledWith({
        email: "test@campus.ac.id",
        purpose: "REGISTRATION",
      });
    });

    expect(
      await screen.findByText(/Kode 6 digit telah dikirim ke email/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Kirim ulang \(60s\)/i)).toBeInTheDocument();
  });
});
