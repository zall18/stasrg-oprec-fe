import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "./page";
import { ToastProvider } from "@/components/ui/toast";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("app/auth/login", () => {
  it("renders login form elements and submit button", () => {
    render(
      <ToastProvider>
        <LoginPage />
      </ToastProvider>
    );

    expect(
      screen.getByRole("heading", { name: /Masuk ke Portal/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata Sandi")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Masuk Sekarang/i })
    ).toBeInTheDocument();
  });
});
