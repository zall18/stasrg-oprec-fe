import { describe, it, expect, beforeEach } from "vitest";
import { apiClient, BASE_API_URL, api } from "./client";

describe("lib/api/client", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("has correct base url configured", () => {
    expect(apiClient.defaults.baseURL).toBe(BASE_API_URL);
  });

  it("attaches Authorization header when token is present", async () => {
    localStorage.setItem("stasrg_token", "sample-jwt-token");
    const config = await apiClient.interceptors.request.handlers[0].fulfilled({
      headers: {} as any,
    });
    expect(config.headers.Authorization).toBe("Bearer sample-jwt-token");
  });

  it("handles 429 rate limiting error message cleanly", async () => {
    const errorInterceptor = apiClient.interceptors.response.handlers[0].rejected;
    const mock429 = {
      response: {
        status: 429,
        data: {},
      },
    };

    await expect(errorInterceptor(mock429)).rejects.toThrow(
      "Terlalu banyak permintaan (Rate limit). Silakan tunggu sejenak."
    );
  });

  it("exports all candidate and admin endpoint methods", () => {
    expect(typeof api.getAnnouncements).toBe("function");
    expect(typeof api.getRegistrationsHistory).toBe("function");
    expect(typeof api.submitGoldenApplication).toBe("function");
    expect(typeof api.getGoldenApplication).toBe("function");
    expect(typeof api.updateGoldenApplication).toBe("function");
    expect(typeof api.getCandidateNotifications).toBe("function");
    expect(typeof api.getUnreadNotificationCount).toBe("function");
    expect(typeof api.markNotificationRead).toBe("function");
    expect(typeof api.getCandidateInterviews).toBe("function");
    expect(typeof api.confirmInterview).toBe("function");
    expect(typeof api.getBatches).toBe("function");
    expect(typeof api.createBatch).toBe("function");
    expect(typeof api.getBatchById).toBe("function");
    expect(typeof api.updateBatch).toBe("function");
    expect(typeof api.deleteBatch).toBe("function");
    expect(typeof api.activateBatch).toBe("function");
    expect(typeof api.bulkUpdateCandidateStatus).toBe("function");
    expect(typeof api.getCandidateNotes).toBe("function");
    expect(typeof api.addCandidateNote).toBe("function");
    expect(typeof api.deleteCandidateNote).toBe("function");
    expect(typeof api.getAdminInterviews).toBe("function");
    expect(typeof api.createInterview).toBe("function");
    expect(typeof api.updateInterview).toBe("function");
    expect(typeof api.cancelInterview).toBe("function");
    expect(typeof api.getActivityLogs).toBe("function");
    expect(typeof api.createAnnouncement).toBe("function");
    expect(typeof api.updateAnnouncement).toBe("function");
    expect(typeof api.deleteAnnouncement).toBe("function");
    expect(typeof api.getAdmins).toBe("function");
    expect(typeof api.createAdmin).toBe("function");
    expect(typeof api.deleteAdmin).toBe("function");
    expect(typeof api.resetAdminPassword).toBe("function");
  });
});
