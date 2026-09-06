import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth.store";

describe("lib/store/auth.store", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearAuth();
  });

  it("initializes with unauthenticated empty state", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it("sets auth user and token correctly", () => {
    const mockUser = {
      id: "u-1",
      email: "candidate@stasrg.org",
      role: "CANDIDATE" as const,
    };
    useAuthStore.getState().setAuth(mockUser, "token-123");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe("candidate@stasrg.org");
    expect(state.token).toBe("token-123");
    expect(localStorage.getItem("stasrg_token")).toBe("token-123");
  });

  it("clears auth correctly", () => {
    useAuthStore.getState().setAuth(
      { id: "u-1", email: "admin@stasrg.org", role: "ADMIN" },
      "token-456"
    );
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(localStorage.getItem("stasrg_token")).toBeNull();
  });
});
