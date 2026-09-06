import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ToastProvider, useToast } from "./toast";

const TestComponent = () => {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success("Data berhasil disimpan")}>
        Trigger Success
      </button>
      <button onClick={() => toast.error("Terjadi kesalahan")}>
        Trigger Error
      </button>
    </div>
  );
};

describe("components/ui/toast", () => {
  it("shows success and error toast when triggered", () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Trigger Success"));
    expect(screen.getByText("Data berhasil disimpan")).toBeInTheDocument();
    expect(screen.getByTestId("toast-success")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Trigger Error"));
    expect(screen.getByText("Terjadi kesalahan")).toBeInTheDocument();
    expect(screen.getByTestId("toast-error")).toBeInTheDocument();
  });
});
