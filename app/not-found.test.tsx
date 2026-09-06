import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NotFound from "./not-found";

describe("app/not-found", () => {
  it("renders 404 header and navigation buttons", () => {
    render(<NotFound />);

    expect(screen.getByText("Error 404")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Halaman Tidak Ditemukan/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Ke Beranda/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Masuk Akun/i })
    ).toBeInTheDocument();
  });
});
