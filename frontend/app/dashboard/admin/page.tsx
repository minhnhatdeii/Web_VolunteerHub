"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { CheckCircle, Users, Calendar, TrendingUp, LogOut, Settings } from "lucide-react";
import { eventApi, userApi } from "@/lib/api";

type AdminEvent = {
  id: string;
  title: string;
  status: string;
  location?: string;
  startDate?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  category?: string;
  description?: string;
};

export default function AdminDashboard() {
  const [user, setUser] = useState<{ name: string; email: string; role?: string; token?: string }>({
    name: "",
    email: "",
    role: "",
    token: "",
  });
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Hydrate auth from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const fullName =
            [parsed.firstName, parsed.lastName].filter(Boolean).join(" ").trim() ||
            parsed.name ||
            parsed.email ||
            "";
          setUser({ name: fullName, email: parsed.email, role: parsed.role, token: storedToken });
        } else {
          setUser((prev) => ({ ...prev, token: storedToken }));
        }
      }
    } catch (_) {
      // ignore
    }
  }, []);

  // Sync auth on storage/focus
  useEffect(() => {
    const syncAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) {
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            const fullName =
              [parsed.firstName, parsed.lastName].filter(Boolean).join(" ").trim() ||
              parsed.name ||
              parsed.email ||
              "";
            setUser({ name: fullName, email: parsed.email, role: parsed.role, token: storedToken });
          } else {
            setUser((prev) => ({ ...prev, token: storedToken }));
          }
        }
      } catch (_) {
        // ignore
      }
    };
    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  // Refresh profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user.token) return;
      try {
        const res = await userApi.getProfile(user.token);
        const data: any = res?.data;
        if (data) {
          const fullName =
            [data.firstName, data.lastName].filter(Boolean).join(" ").trim() ||
            data.name ||
            data.email ||
            "";
          setUser((prev) => ({ ...prev, name: fullName, email: data.email || prev.email, role: data.role || prev.role }));
          try {
            localStorage.setItem("user", JSON.stringify(data));
          } catch (_) {
            // ignore storage errors
          }
        }
      } catch (err) {
        console.error("Failed to refresh admin profile:", err);
      }
    };
    fetchProfile();
  }, [user.token]);

  useEffect(() => {
    const fetchAdminEvents = async () => {
      if (!user.token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await eventApi.getAdminEvents(user.token);
        // controller returns { data: events, pagination }
        const list = (res as any)?.data || [];
        setEvents(list);
      } catch (err) {
        console.error("Failed to load admin events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminEvents();
  }, [user.token]);

  const stats = useMemo(() => {
    const totalUsers = 0; // chưa có API users
    const pending = events.filter((e) => e.status === "PENDING_APPROVAL").length;
    const approved = events.filter((e) => e.status === "APPROVED").length;
    const totalRegs = 0; // chưa có API registrations tổng
    return [
      { label: "Tổng người dùng", value: totalUsers, icon: Users },
      { label: "Sự kiện chờ duyệt", value: pending, icon: Calendar },
      { label: "Tổng lượt đăng ký", value: totalRegs, icon: TrendingUp },
      { label: "Sự kiện đã duyệt", value: approved, icon: CheckCircle },
    ];
  }, [events]);

  const pendingList = useMemo(() => events.filter((e) => e.status === "PENDING_APPROVAL"), [events]);
  const approvedList = useMemo(() => events.filter((e) => e.status === "APPROVED"), [events]);
  const rejectedList = useMemo(() => events.filter((e) => e.status === "REJECTED"), [events]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-muted mt-2">Chào mừng, {user.name || "Admin"}!</p>
            </div>
            <div className="flex gap-4">
              <Link href="/admin/reports" className="btn-primary">
                Xem báo cáo
              </Link>
              <Link href="/dashboard/admin/events" className="btn-secondary">
                Quản lý sự kiện
              </Link>
              <Link href="/settings" className="p-2 hover:bg-white rounded-lg transition-colors">
                <Settings size={24} />
              </Link>
              <button className="p-2 hover:bg-white rounded-lg transition-colors">
                <LogOut size={24} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="card-base p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted text-sm mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-primary">{stat.value}</p>
                    </div>
                    <Icon className="text-accent" size={32} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="card-base p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Sự kiện chờ duyệt</h2>
                {loading && <p className="text-muted">Đang tải...</p>}
                {!loading && pendingList.length === 0 && (
                  <p className="text-muted">Không có sự kiện chờ duyệt</p>
                )}
                <div className="space-y-4">
                  {pendingList.map((event) => (
                    <div
                      key={event.id}
                      className="flex gap-4 p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <img
                        src={event.thumbnailUrl || "/placeholder.svg"}
                        alt={event.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{event.title}</h3>
                        <p className="text-sm text-muted mb-2">{event.location || "Đang cập nhật"}</p>
                        <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-warning">Chờ duyệt</span>
                      </div>
                      <Link href={`/events/${event.id}`} className="btn-primary self-center">
                        Xem chi tiết
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="card-base p-6">
                <h3 className="text-xl font-bold mb-4">Sự kiện đã duyệt</h3>
                {approvedList.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-xs text-muted">ID: {event.id}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-success">Đã duyệt</span>
                  </div>
                ))}
                {approvedList.length === 0 && <p className="text-muted text-sm">Chưa có</p>}
              </div>

              <div className="card-base p-6">
                <h3 className="text-xl font-bold mb-4">Sự kiện đã từ chối</h3>
                {rejectedList.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-xs text-muted">ID: {event.id}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-destructive">Từ chối</span>
                  </div>
                ))}
                {rejectedList.length === 0 && <p className="text-muted text-sm">Chưa có</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
