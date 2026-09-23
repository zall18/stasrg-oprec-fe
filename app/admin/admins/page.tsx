"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth.store";
import { useToast } from "@/components/ui/toast";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  createAdminSchema,
  resetPasswordSchema,
  CreateAdminInput,
  ResetPasswordInput,
} from "@/lib/schemas/admin-management.schema";
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Search,
  Users,
  Shield,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminItem {
  id: string;
  email: string;
  role: "ADMIN";
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminManagementPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [adminToReset, setAdminToReset] = useState<AdminItem | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminItem | null>(null);

  // Password visibility state
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Keyboard accessibility for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCreateModalOpen(false);
        setAdminToReset(null);
        setAdminToDelete(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Form: Create Admin
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreateForm,
    formState: { errors: createErrors },
  } = useForm<CreateAdminInput>({
    resolver: zodResolver(createAdminSchema),
  });

  // Form: Reset Password
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    reset: resetResetForm,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Query: Get all admins
  const { data: adminsData, isLoading, isError } = useQuery({
    queryKey: ["adminAccounts"],
    queryFn: async () => {
      const res = await api.getAdmins();
      const raw = res.data?.data ?? res.data;
      return Array.isArray(raw) ? (raw as AdminItem[]) : [];
    },
  });

  const adminsList = useMemo(() => adminsData || [], [adminsData]);

  // Filtered admins
  const filteredAdmins = useMemo(() => {
    if (!searchQuery.trim()) return adminsList;
    const q = searchQuery.toLowerCase();
    return adminsList.filter((adm) => adm.email.toLowerCase().includes(q));
  }, [adminsList, searchQuery]);

  // Mutation: Create Admin
  const createMutation = useMutation({
    mutationFn: async (values: CreateAdminInput) => {
      return api.createAdmin({
        email: values.email.trim(),
        password: values.password,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["adminAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["activityLogs"] });
      const msg = res.data?.message || "Akun admin baru berhasil dibuat!";
      toast.success(msg);
      setIsCreateModalOpen(false);
      resetCreateForm();
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Gagal mendaftarkan akun admin";
      toast.error(message);
    },
  });

  // Mutation: Reset Password
  const resetPasswordMutation = useMutation({
    mutationFn: async (values: ResetPasswordInput) => {
      if (!adminToReset) throw new Error("Akun target tidak valid");
      return api.resetAdminPassword(adminToReset.id, values.newPassword);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["activityLogs"] });
      const msg = res.data?.message || "Password admin berhasil diperbarui!";
      toast.success(msg);
      setAdminToReset(null);
      resetResetForm();
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Gagal memperbarui password admin";
      toast.error(message);
    },
  });

  // Mutation: Delete Admin
  const deleteMutation = useMutation({
    mutationFn: async (adminId: string) => {
      return api.deleteAdmin(adminId);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["adminAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["activityLogs"] });
      const msg = res.data?.message || "Akun admin berhasil dihapus!";
      toast.success(msg);
      setAdminToDelete(null);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus akun admin";
      toast.error(message);
    },
  });

  const onSubmitCreate = (data: CreateAdminInput) => {
    createMutation.mutate(data);
  };

  const onSubmitReset = (data: ResetPasswordInput) => {
    resetPasswordMutation.mutate(data);
  };

  const confirmDelete = () => {
    if (!adminToDelete) return;
    deleteMutation.mutate(adminToDelete.id);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#274432]/10 flex items-center justify-center text-[#274432] shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1A201C]">
                Kelola Akun Admin
              </h1>
              <p className="text-xs text-[#64746A]">
                Manajemen akun pengelola, registrasi admin baru, dan pengaturan kata sandi laboratorium STAS-RG.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => {
            resetCreateForm();
            setShowCreatePassword(false);
            setIsCreateModalOpen(true);
          }}
          className="self-start sm:self-auto shadow-sm"
        >
          Tambah Admin Baru
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600/10 text-emerald-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-[#64746A] uppercase tracking-wider">
              Total Administrator
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#1A201C]">
                {isLoading ? "-" : adminsList.length}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">
                ({adminsList.filter((a) => a.isActive !== false).length} Aktif)
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-[#64746A] uppercase tracking-wider">
              Menunggu Konfirmasi
            </span>
            <span className="text-2xl font-black text-[#1A201C]">
              {isLoading
                ? "-"
                : adminsList.filter((a) => a.isActive === false).length}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#274432]/10 text-[#274432] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[11px] font-semibold text-[#64746A] uppercase tracking-wider">
              Akun Anda Saat Ini
            </span>
            <span className="text-xs font-bold text-[#1A201C] truncate" title={currentUser?.email}>
              {currentUser?.email || "Admin Terverifikasi"}
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Search & Actions Bar */}
      <GlassCard className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-white/50">
        <div className="relative w-full sm:max-w-md">
          <Input
            placeholder="Cari admin berdasarkan alamat email..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs py-2 bg-white/50"
          />
        </div>

        <div className="text-xs text-[#64746A] self-end sm:self-center">
          Menampilkan <strong>{filteredAdmins.length}</strong> dari{" "}
          <strong>{adminsList.length}</strong> administrator
        </div>
      </GlassCard>

      {/* Admins Table List */}
      <GlassCard className="overflow-hidden border-white/60 p-0 shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#274432]" />
            <span className="text-xs text-[#64746A]">Memuat daftar administrator...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
            <span className="text-sm font-semibold text-rose-700">
              Gagal mengambil data akun admin.
            </span>
            <span className="text-xs text-[#64746A]">
              Pastikan Anda memiliki izin akses administrator dan koneksi ke backend stabil.
            </span>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-4">
            <Users className="w-8 h-8 text-[#64746A]/50" />
            <span className="text-sm font-bold text-[#1A201C]">
              Tidak ada akun admin yang sesuai
            </span>
            <span className="text-xs text-[#64746A]">
              {searchQuery ? `Tidak ditemukan admin dengan kata kunci "${searchQuery}"` : "Belum ada administrator yang terdaftar."}
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#274432]/5 text-[#274432] uppercase tracking-wider text-[11px] font-bold border-b border-black/5">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Administrator</th>
                  <th className="py-3.5 px-4">Hak Akses</th>
                  <th className="py-3.5 px-4">Status Akun</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Terdaftar Pada</th>
                  <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredAdmins.map((admin) => {
                  const isSelf =
                    admin.id === currentUser?.id ||
                    admin.email === currentUser?.email;
                  const isOnlyOneAdmin = adminsList.length <= 1;

                  return (
                    <tr
                      key={admin.id}
                      className={cn(
                        "transition-colors hover:bg-white/50",
                        isSelf && "bg-emerald-50/40"
                      )}
                    >
                      {/* Admin Email & Badge */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#274432]/10 text-[#274432] flex items-center justify-center font-bold text-xs shrink-0">
                            {admin.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col truncate">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-[#1A201C] truncate">
                                {admin.email}
                              </span>
                              {isSelf && (
                                <Badge variant="DITERIMA" className="text-[10px] py-0 px-2">
                                  Akun Anda
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-[#64746A] truncate">
                              ID: {admin.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        <Badge variant="GOLDEN" className="text-[10px] font-bold">
                          ADMIN
                        </Badge>
                      </td>

                      {/* Status Akun */}
                      <td className="py-4 px-4">
                        {admin.isActive === false ? (
                          <Badge
                            variant="PENDING"
                            className="text-[10px] font-bold py-0.5 px-2 bg-amber-50 text-amber-800 border-amber-300 flex items-center gap-1 w-fit"
                          >
                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                            Menunggu Konfirmasi
                          </Badge>
                        ) : (
                          <Badge
                            variant="DITERIMA"
                            className="text-[10px] font-bold py-0.5 px-2 flex items-center gap-1 w-fit"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Aktif
                          </Badge>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-4 text-[#64746A] hidden md:table-cell">
                        {admin.createdAt
                          ? new Date(admin.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Reset Password Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                            onClick={() => {
                              resetResetForm();
                              setShowResetPassword(false);
                              setAdminToReset(admin);
                            }}
                            className="text-xs h-8 px-3"
                            title="Reset / Ganti Password Admin"
                          >
                            Ganti Password
                          </Button>

                          {/* Delete Button with Safety Protection */}
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                            disabled={isSelf || isOnlyOneAdmin}
                            onClick={() => setAdminToDelete(admin)}
                            className={cn(
                              "text-xs h-8 px-3",
                              (isSelf || isOnlyOneAdmin) && "opacity-40 cursor-not-allowed"
                            )}
                            title={
                              isSelf
                                ? "Anda tidak dapat menghapus akun Anda sendiri (Anti Self-Deletion)"
                                : isOnlyOneAdmin
                                ? "Tidak dapat menghapus: Minimal harus tersisa 1 admin aktif"
                                : "Hapus Akun Administrator"
                            }
                          >
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Safety Notice Footer */}
      <div className="p-4 rounded-2xl bg-white/40 border border-black/5 flex items-start gap-3 text-xs text-[#64746A]">
        <ShieldCheck className="w-4 h-4 text-[#274432] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-[#1A201C]">
            Ketentuan Keamanan Administrator STAS-RG:
          </span>
          <p className="leading-relaxed">
            Setiap pembuatan admin baru, pergantian kata sandi, dan penghapusan akun akan secara otomatis terekam dalam{" "}
            <strong>Log Aktivitas</strong> untuk keperluan audit rekrutmen. Penghapusan akun diri sendiri serta penghapusan admin terakhir dicegah secara ketat oleh sistem.
          </p>
        </div>
      </div>

      {/* ========================================================== */}
      {/* MODAL 1: Tambah Admin Baru                                  */}
      {/* ========================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <GlassCard className="max-w-md w-full p-6 bg-white/95 border-white shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#274432]/10 text-[#274432] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#1A201C]">
                  Tambah Administrator Baru
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#64746A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitCreate(onSubmitCreate)}
              className="flex flex-col gap-4"
            >
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950">
                <Mail className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 leading-relaxed">
                  <strong className="font-semibold text-emerald-950 text-xs">
                    Undangan Resmi & Proteksi Akun
                  </strong>
                  <span className="text-[11px] text-emerald-800">
                    Akun baru otomatis berstatus <em>Menunggu Konfirmasi</em> demi keamanan. Email undangan resmi berisi kredensial akses dan tombol aktivasi CTA (berlaku 24 jam) akan langsung dikirimkan ke email target.
                  </span>
                </div>
              </div>

              <Input
                label="Email Administrator"
                type="email"
                placeholder="nama.admin@stas-rg.ac.id"
                leftIcon={<Mail className="w-4 h-4" />}
                error={createErrors.email?.message}
                {...registerCreate("email")}
              />

              <div className="flex flex-col gap-1">
                <Input
                  label="Kata Sandi Awal"
                  type={showCreatePassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="cursor-pointer hover:text-[#1A201C]"
                      tabIndex={-1}
                    >
                      {showCreatePassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  error={createErrors.password?.message}
                  {...registerCreate("password")}
                />
                <span className="text-[11px] text-[#64746A] ml-2">
                  Kata sandi harus minimal 8 karakter.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={createMutation.isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={createMutation.isPending}
                >
                  Daftarkan Admin
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 2: Reset Password Admin                               */}
      {/* ========================================================== */}
      {adminToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <GlassCard className="max-w-md w-full p-6 bg-white/95 border-white shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-900 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#1A201C]">
                  Ganti Password Admin
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAdminToReset(null)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#64746A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#F5F7EC] border border-black/5 text-xs">
              <span className="text-[#64746A] block">Target Akun Administrator:</span>
              <span className="font-bold text-[#1A201C] text-sm break-all">
                {adminToReset.email}
              </span>
            </div>

            <form
              onSubmit={handleSubmitReset(onSubmitReset)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <Input
                  label="Password Baru"
                  type={showResetPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="cursor-pointer hover:text-[#1A201C]"
                      tabIndex={-1}
                    >
                      {showResetPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  error={resetErrors.newPassword?.message}
                  {...registerReset("newPassword")}
                />
                <span className="text-[11px] text-[#64746A] ml-2">
                  Masukkan kata sandi baru yang kuat (minimal 8 karakter).
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setAdminToReset(null)}
                  disabled={resetPasswordMutation.isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={resetPasswordMutation.isPending}
                >
                  Simpan Password Baru
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 3: Konfirmasi Hapus Admin                            */}
      {/* ========================================================== */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <GlassCard className="max-w-md w-full p-6 bg-white/95 border-rose-200 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-[#1A201C]">
                  Hapus Akun Administrator?
                </h2>
                <span className="text-xs text-rose-600 font-medium">
                  Tindakan ini tidak dapat dibatalkan.
                </span>
              </div>
            </div>

            <p className="text-xs text-[#64746A] leading-relaxed">
              Anda akan menghapus akun administrator dengan email{" "}
              <strong className="text-[#1A201C]">{adminToDelete.email}</strong>. Akun ini tidak akan dapat lagi mengakses panel seleksi laboratorium.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5">
              <Button
                variant="outline"
                size="md"
                onClick={() => setAdminToDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="md"
                isLoading={deleteMutation.isPending}
                onClick={confirmDelete}
              >
                Ya, Hapus Akun
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
