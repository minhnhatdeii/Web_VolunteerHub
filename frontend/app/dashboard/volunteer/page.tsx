"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Calendar, Users, Heart, LogOut, Settings, User } from "lucide-react";
import { registrationApi, userApi } from "@/lib/api";

type RegistrationWithEvent = {
  id: string;
  status: string;
  appliedAt: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    location: string;
    status: string;
    thumbnailUrl?: string;
  };
};

export default function VolunteerDashboard() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role?: string }>({
    id: "",
    name: "",
    email: "",
    role: "",
  });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");
      if (storedToken) setAccessToken(storedToken);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const fullName =
          [parsed.firstName, parsed.lastName].filter(Boolean).join(" ").trim() ||
          parsed.name ||
          parsed.email ||
          "";
        setUser({ id: parsed.id, name: fullName, email: parsed.email, role: parsed.role });
      }
    } catch (_) {
      // ignore
    }
  }, []);

  // sync auth on storage/focus
  useEffect(() => {
    const syncAuth = () => {
      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");
        if (storedToken) setAccessToken(storedToken);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const fullName =
            [parsed.firstName, parsed.lastName].filter(Boolean).join(" ").trim() ||
            parsed.name ||
            parsed.email ||
            "";
          setUser({ id: parsed.id, name: fullName, email: parsed.email, role: parsed.role });
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

  useEffect(() => {
    const loadProfile = async () => {
      if (!accessToken) return;
      try {
        const res = await userApi.getProfile(accessToken);
        const data = res?.data;
        if (data) {
          const fullName =
            [data.firstName, data.lastName].filter(Boolean).join(" ").trim() ||
            data.name ||
            data.email ||
            "";
          setUser({
            id: data.id || user.id,
            name: fullName,
            email: data.email || user.email,
            role: data.role || user.role,
          });
          try {
            localStorage.setItem("user", JSON.stringify(data));
          } catch (_) {
            // ignore
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await registrationApi.getMyRegistrations(accessToken);
        // Handle both response formats: direct array or wrapped in {data}
        const registrations = Array.isArray(res) ? res : (res?.data || []);
        setRegistrations(registrations as RegistrationWithEvent[]);
      } catch (err) {
        console.error("Failed to load registrations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accessToken]);

  const totalEvents = registrations.length;
  const approvedEvents = registrations.filter((r) => r.status === "APPROVED").length;
  const favoriteEvents = 0; // chưa có API yêu thích

  const stats = [
    { label: "Sự kiện đã tham gia", value: totalEvents, icon: Calendar },
    { label: "Giờ tình nguyện", value: approvedEvents * 4, icon: Users }, // giả định 4h/sự kiện
    { label: "Sự kiện yêu thích", value: favoriteEvents, icon: Heart },
  ];

  const displayedEvents = useMemo(() => {
    return registrations
      .sort((a, b) => new Date(b.event.startDate).getTime() - new Date(a.event.startDate).getTime())
      .map((r) => ({
        id: r.event.id,
        title: r.event.title,
        date: new Date(r.event.startDate).toLocaleDateString("vi-VN"),
        status: r.status?.toLowerCase(),
        image: r.event.thumbnailUrl || "/placeholder.svg",
        location: r.event.location,
      }))
      .slice(0, 5);
  }, [registrations]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Dashboard Tình nguyện viên</h1>
              <p className="text-muted mt-2">Chào mừng, {user.name || "bạn"}!</p>
            </div>
            <div className="flex gap-4">
              <Link href="/profile" className="p-2 hover:bg-white rounded-lg transition-colors">
                <User size={24} />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="card-base p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted text-sm mb-2">{stat.label}</p>
                      <p className="text-4xl font-bold text-primary">{stat.value}</p>
                    </div>
                    <Icon className="text-accent" size={40} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="card-base p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Sự kiện đã đăng ký</h2>
                <div className="space-y-4">
                  {loading && <p className="text-muted">Đang tải...</p>}
                  {!loading && displayedEvents.length === 0 && (
                    <p className="text-muted">Bạn chưa đăng ký sự kiện nào.</p>
                  )}
                  {displayedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex gap-4 p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <img
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{event.title}</h3>
                        <p className="text-sm text-muted mb-2">{event.date}</p>
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${event.status === "approved" ? "bg-green-100 text-success" : "bg-yellow-100 text-warning"
                            }`}
                        >
                          {event.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                        </span>
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
            <div>
              <div className="card-base p-8 sticky top-20">
                <h3 className="text-xl font-bold mb-4">Thông tin cá nhân</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted">Tên</p>
                    <p className="font-semibold">{user.name || "Người dùng"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Email</p>
                    <p className="font-semibold">{user.email || "Đang cập nhật"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Vai trò</p>
                    <p className="font-semibold">Tình nguyện viên</p>
                  </div>
                </div>
                <Link href="/profile" className="block w-full btn-primary mt-6 text-center">
                  Chỉnh sửa hồ sơ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
