import axios, { AxiosError } from "axios";

export const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("stasrg_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("stasrg_token");
          localStorage.removeItem("stasrg_user");
        }
      } else if (status === 429) {
        return Promise.reject(
          new Error("Terlalu banyak permintaan (Rate limit). Silakan tunggu sejenak.")
        );
      }
      const message =
        error.response.data?.message ||
        error.message ||
        "Terjadi kesalahan pada server";
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  }
);

// Specific API Services
export const api = {
  // Public
  getHealth: () => apiClient.get("/health"),
  getOprecStatus: () => apiClient.get("/public/oprec-status"),

  // Auth
  login: (data: { email: string; password: string }) =>
    apiClient.post("/auth/login", data),
  register: (data: { email: string; password: string; role?: string }) =>
    apiClient.post("/auth/register", data),

  // Candidate
  getCandidateProfile: () => apiClient.get("/candidate/profile"),
  upsertCandidateProfile: (data: Record<string, unknown>) =>
    apiClient.post("/candidate/profile", data),
  applyOprec: (batchName?: string) =>
    apiClient.post("/candidate/apply-oprec", { batchName }),

  // Upload
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/upload/document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Admin
  getDashboardStats: (batch?: string) =>
    apiClient.get("/admin/dashboard/stats", { params: { batch } }),
  getRecruitmentSetting: () => apiClient.get("/admin/settings/oprec"),
  updateRecruitmentSetting: (data: Record<string, unknown>) =>
    apiClient.patch("/admin/settings/oprec", data),
  getCandidates: (params?: {
    search?: string;
    batch?: string;
    status?: string;
    roleInterest?: string;
    isGolden?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get("/admin/candidates", { params }),
  getCandidateById: (id: string) => apiClient.get(`/admin/candidates/${id}`),
  updateCandidateStatus: (registrationId: string, status: string) =>
    apiClient.patch(`/admin/candidates/${registrationId}/status`, { status }),
  assignProject: (registrationId: string, assignedProject: string) =>
    apiClient.patch(`/admin/candidates/${registrationId}/project`, {
      assignedProject,
    }),
  exportCandidates: () =>
    apiClient.get("/admin/candidates/export", { responseType: "blob" }),
};
