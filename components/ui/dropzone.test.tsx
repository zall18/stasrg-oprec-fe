import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Dropzone } from "./dropzone";
import { MAX_FILE_SIZE } from "@/lib/schemas/candidate.schema";

describe("components/ui/dropzone", () => {
  it("renders with label and helper text", () => {
    render(
      <Dropzone
        label="Unggah CV (PDF)"
        onFileSelect={vi.fn()}
      />
    );
    expect(screen.getByText("Unggah CV (PDF)")).toBeInTheDocument();
    expect(screen.getByText(/Format PDF, maksimal 5MB/i)).toBeInTheDocument();
  });

  it("rejects non-PDF files and shows instant error", () => {
    const handleFileSelect = vi.fn();
    render(<Dropzone label="CV" onFileSelect={handleFileSelect} />);

    const input = screen.getByTestId("dropzone-input");
    const fakeFile = new File(["dummy text"], "cv.txt", { type: "text/plain" });

    fireEvent.change(input, { target: { files: [fakeFile] } });

    expect(
      screen.getByText("Format berkas wajib berupa PDF (.pdf)")
    ).toBeInTheDocument();
    expect(handleFileSelect).toHaveBeenCalledWith(null);
  });

  it("rejects files strictly exceeding 5MB without calling backend", () => {
    const handleFileSelect = vi.fn();
    render(<Dropzone label="CV" onFileSelect={handleFileSelect} />);

    const input = screen.getByTestId("dropzone-input");
    const oversizedFile = new File(["x"], "heavy_cv.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(oversizedFile, "size", {
      value: MAX_FILE_SIZE + 1024 * 1024,
    });

    fireEvent.change(input, { target: { files: [oversizedFile] } });

    expect(screen.getByText(/Ukuran file melebihi batas maksimal/i)).toBeInTheDocument();
    expect(handleFileSelect).toHaveBeenCalledWith(null);
  });

  it("accepts valid PDF file within 5MB", () => {
    const handleFileSelect = vi.fn();
    render(<Dropzone label="CV" onFileSelect={handleFileSelect} />);

    const input = screen.getByTestId("dropzone-input");
    const validFile = new File(["dummy pdf content"], "alif_cv.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(validFile, "size", { value: 1024 * 1024 }); // 1MB

    fireEvent.change(input, { target: { files: [validFile] } });

    expect(screen.getByText("alif_cv.pdf")).toBeInTheDocument();
    expect(handleFileSelect).toHaveBeenCalledWith(validFile);
  });
});
