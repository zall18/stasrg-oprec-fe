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
  getAnnouncements: () => apiClient.get("/public/announcements"),

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
  getRegistrationsHistory: () => apiClient.get("/candidate/registrations"),
  submitGoldenApplication: (data: {
    motivasi: string;
    pencapaian?: string;
    rekomendasi?: string;
    registrationId?: string;
  }) => apiClient.post("/candidate/golden-application", data),
  getGoldenApplication: () => apiClient.get("/candidate/golden-application"),
  updateGoldenApplication: (data: {
    motivasi: string;
    pencapaian?: string;
    rekomendasi?: string;
  }) => apiClient.put("/candidate/golden-application", data),
  getCandidateNotifications: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/candidate/notifications", { params }),
  getUnreadNotificationCount: () =>
    apiClient.get("/candidate/notifications/unread-count"),
  markNotificationRead: (id: string) =>
    apiClient.patch(`/candidate/notifications/${id}/read`),
  getCandidateInterviews: () => apiClient.get("/candidate/interviews"),
  confirmInterview: (id: string) =>
    apiClient.patch(`/candidate/interviews/${id}/confirm`),

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
  updateGoldenStatus: (id: string, status: string) =>
    apiClient.patch(`/admin/candidates/${id}/golden-status`, { status }),
  assignProject: (registrationId: string, assignedProject: string) =>
    apiClient.patch(`/admin/candidates/${registrationId}/project`, {
      assignedProject,
    }),
  exportCandidates: () =>
    apiClient.get("/admin/candidates/export", { responseType: "blob" }),

  // Admin: Batch Management
  getBatches: () => apiClient.get("/admin/oprec/batches"),
  createBatch: (data: {
    name: string;
    description?: string;
    startDate?: string | null;
    endDate?: string | null;
    quota?: number;
    isActive?: boolean;
  }) => apiClient.post("/admin/oprec/batches", data),
  getBatchById: (id: string) => apiClient.get(`/admin/oprec/batches/${id}`),
  updateBatch: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/admin/oprec/batches/${id}`, data),
  deleteBatch: (id: string) => apiClient.delete(`/admin/oprec/batches/${id}`),
  activateBatch: (id: string) =>
    apiClient.patch(`/admin/oprec/batches/${id}/activate`),

  // Admin: Bulk Status
  bulkUpdateCandidateStatus: (ids: string[], status: string) =>
    apiClient.patch("/admin/candidates/bulk-status", { ids, status }),

  // Admin: Candidate Internal Notes
  getCandidateNotes: (candidateId: string) =>
    apiClient.get(`/admin/candidates/${candidateId}/notes`),
  addCandidateNote: (
    candidateId: string,
    data: { content: string; registrationId?: string }
  ) => apiClient.post(`/admin/candidates/${candidateId}/notes`, data),
  deleteCandidateNote: (candidateId: string, noteId: string) =>
    apiClient.delete(`/admin/candidates/${candidateId}/notes/${noteId}`),

  // Admin: Interviews
  getAdminInterviews: (params?: {
    batch?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get("/admin/interviews", { params }),
  createInterview: (data: {
    candidateId: string;
    registrationId?: string;
    datetime: string;
    type?: "ONLINE" | "OFFLINE";
    link?: string;
    location?: string;
    notes?: string;
  }) => apiClient.post("/admin/interviews", data),
  updateInterview: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/admin/interviews/${id}`, data),
  cancelInterview: (id: string) => apiClient.delete(`/admin/interviews/${id}`),

  // Admin: Activity Logs
  getActivityLogs: (params?: {
    userId?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get("/admin/activity-logs", { params }),

  // Admin: Announcements
  createAnnouncement: (data: {
    title: string;
    content: string;
    isActive?: boolean;
  }) => apiClient.post("/admin/announcements", data),
  updateAnnouncement: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id: string) =>
    apiClient.delete(`/admin/announcements/${id}`),
};
