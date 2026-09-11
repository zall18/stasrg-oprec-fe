import { render, screen } from "@testing-library/react";
import GoldenCandidatePage from "./page";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock("@/lib/api/client", () => ({
  api: {
    getCandidateProfile: vi.fn().mockResolvedValue({
      data: { data: { fullName: "Test User", nim: "12345", cvUrl: "http://cv" } },
    }),
    getGoldenApplication: vi.fn().mockResolvedValue({
      data: { data: null },
    }),
    getOprecStatus: vi.fn().mockResolvedValue({
      data: { data: { isActive: true, currentBatch: "Batch 1" } }
    }),
    getRegistrationsHistory: vi.fn().mockResolvedValue({
      data: { data: [] }
    }),
    submitGoldenApplication: vi.fn(),
  },
}));

describe("app/dashboard/golden-candidate", () => {
  it("renders golden candidate form", async () => {
    render(<GoldenCandidatePage />);
    
    // Check loading state first
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
