import { describe, it, expect, beforeEach } from "vitest";
import { apiClient, BASE_API_URL } from "./client";

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
});
