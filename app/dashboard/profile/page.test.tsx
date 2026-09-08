import { render, screen } from "@testing-library/react";
import CandidateProfilePage from "./page";
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
      data: { data: { fullName: "Test User", nim: "12345" } },
    }),
    uploadDocument: vi.fn(),
    upsertCandidateProfile: vi.fn(),
  },
}));

describe("app/dashboard/profile", () => {
  it("renders profile form", async () => {
    render(<CandidateProfilePage />);
    
    // Check loading state first
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
