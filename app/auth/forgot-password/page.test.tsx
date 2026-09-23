import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ForgotPasswordPage from "./page";
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
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

describe("app/auth/forgot-password", () => {
  it("renders step 1 (request OTP) and transitions to step 2 after requesting OTP", async () => {
    vi.mocked(api.forgotPassword).mockResolvedValueOnce({
      data: { success: true, message: "OTP sent" },
    } as any);

    render(
      <ToastProvider>
        <ForgotPasswordPage />
      </ToastProvider>
    );

    expect(
      screen.getByRole("heading", { name: /Lupa Kata Sandi/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Akun/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", {
      name: /Kirim Kode Pemulihan/i,
    });
    expect(submitBtn).toBeInTheDocument();

    // Fill email
    fireEvent.change(screen.getByLabelText(/Email Akun/i), {
      target: { value: "user@stas-rg.ac.id" },
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.forgotPassword).toHaveBeenCalledWith({
        email: "user@stas-rg.ac.id",
      });
    });

    // Step 2 should now be visible
    expect(
      await screen.findByRole("heading", { name: /Setel Kata Sandi/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/user@stas-rg.ac.id/i)).toBeInTheDocument();
    expect(screen.getByText(/Kode OTP 6 Digit/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Kata Sandi Baru")).toBeInTheDocument();
    expect(screen.getByLabelText("Konfirmasi Kata Sandi Baru")).toBeInTheDocument();
  });

  it("completes password reset in step 2 and navigates to login", async () => {
    vi.mocked(api.forgotPassword).mockResolvedValueOnce({
      data: { success: true },
    } as any);
    vi.mocked(api.resetPassword).mockResolvedValueOnce({
      data: { success: true },
    } as any);

    render(
      <ToastProvider>
        <ForgotPasswordPage />
      </ToastProvider>
    );

    // Transition to step 2
    fireEvent.change(screen.getByLabelText(/Email Akun/i), {
      target: { value: "user@stas-rg.ac.id" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Kirim Kode Pemulihan/i }));

    await screen.findByRole("heading", { name: /Setel Kata Sandi/i });

    // Fill step 2 inputs
    const otpInput = screen.getByPlaceholderText(/Masukkan 6 digit angka/i);
    const newPassInput = screen.getByLabelText("Kata Sandi Baru");
    const confirmPassInput = screen.getByLabelText("Konfirmasi Kata Sandi Baru");

    fireEvent.change(otpInput, { target: { value: "849201" } });
    fireEvent.change(newPassInput, { target: { value: "newSecret123" } });
    fireEvent.change(confirmPassInput, { target: { value: "newSecret123" } });

    fireEvent.click(
      screen.getByRole("button", { name: /Simpan Kata Sandi Baru/i })
    );

    await waitFor(() => {
      expect(api.resetPassword).toHaveBeenCalledWith({
        email: "user@stas-rg.ac.id",
        otp: "849201",
        newPassword: "newSecret123",
      });
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });
  });
});
