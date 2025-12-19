"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userApi } from "@/lib/api";
import { Toaster, toast } from "sonner";

interface Profile {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  pushNotifications?: boolean;
}

export default function ProfilePage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string>("volunteer");
  const [formData, setFormData] = useState<Profile>({
    email: "",
    firstName: "",
    lastName: "",
    bio: "",
    avatarUrl: "",
    pushNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fullName = useMemo(() => {
    const combined = [formData.firstName, formData.lastName].filter(Boolean).join(" ").trim();
    return combined || formData.email || "Nguoi dung";
  }, [formData.email, formData.firstName, formData.lastName]);

  // Read token once and hydrate from stored user if available
  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");
      if (token) setAccessToken(token);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setFormData((prev) => ({
          ...prev,
          email: parsed.email || prev.email,
          firstName: parsed.firstName || prev.firstName,
          lastName: parsed.lastName || prev.lastName,
        }));
        if (parsed.role) setRole((parsed.role as string).toLowerCase());
      }
    } catch (err) {
      console.error("Failed to read auth from localStorage:", err);
    }
  }, []);

  // Fetch profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await userApi.getProfile(accessToken);
        if (res?.data) {
          const data = res.data as Profile;
          setProfile(data);
          setFormData({
            email: data.email || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            bio: data.bio || "",
            avatarUrl: data.avatarUrl || "",
            pushNotifications: data.pushNotifications ?? true,
          });
          try {
            localStorage.setItem("user", JSON.stringify(data));
          } catch (_) {
            // ignore storage errors
          }
          if ((data as any).role) setRole(((data as any).role as string).toLowerCase());
        }
      } catch (err) {
        setError("Khong the tai ho so. Vui long thu lai hoac dang nhap lai.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [accessToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSuccess(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!accessToken) {
      setError("Ban can dang nhap de cap nhat ho so.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        pushNotifications: formData.pushNotifications,
      };
      const res = await userApi.updateProfile(accessToken, payload);
      if (res?.data) {
        const updated = res.data as Profile;
        setProfile(updated);
        setFormData((prev) => ({
          ...prev,
          email: updated.email || prev.email,
          firstName: updated.firstName ?? prev.firstName,
          lastName: updated.lastName ?? prev.lastName,
          bio: updated.bio ?? prev.bio,
        }));
        setSuccess("Da luu thay doi ho so.");
        toast.success("Đã lưu hồ sơ");
        try {
          localStorage.setItem("user", JSON.stringify(updated));
        } catch (_) {
          // ignore
        }
      }
    } catch (err) {
      setError("Cap nhat that bai. Vui long thu lai.");
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        email: profile.email || "",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        bio: profile.bio || "",
        avatarUrl: profile.avatarUrl || "",
        pushNotifications: profile.pushNotifications ?? true,
      });
    }
    setSuccess(null);
    setError(null);
  };

  return (
    <>
      <Toaster position="top-center" />
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom max-w-3xl">
          <Link
            href={`/dashboard/${role || "volunteer"}`}
            className="inline-flex items-center text-primary hover:text-primary-dark mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay lai dashboard
          </Link>

          <div className="card-base p-8">
            <div className="flex items-start gap-4 mb-8">
              <Avatar className="h-16 w-16">
                <AvatarImage src={formData.avatarUrl || "/placeholder.svg"} alt={fullName} />
                <AvatarFallback>{fullName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{fullName}</h1>
                <p className="text-muted">{formData.email || "Chua co email"}</p>
              </div>
            </div>

            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
            {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Ho</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-base"
                    placeholder="Nhap ho"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ten</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-base"
                    placeholder="Nhap ten"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input type="email" name="email" value={formData.email} disabled className="input-base bg-neutral-100" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tieu su</label>
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  rows={4}
                  className="input-base"
                  placeholder="Chia se doi net ve ban..."
                />
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={!!formData.pushNotifications}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                Nhan thong bao day ve su kien va dang ky
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="btn-primary flex items-center gap-2 disabled:opacity-70"
                >
                  <Save size={18} />
                  {saving ? "Dang luu..." : "Luu thay doi"}
                </button>
                <button onClick={handleReset} className="btn-secondary" disabled={loading || saving}>
                  Huy
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
