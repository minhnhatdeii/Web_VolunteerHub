"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Plus, Users, Calendar, CheckCircle, LogOut, Settings } from "lucide-react";
import { eventApi, registrationApi, userApi } from "@/lib/api";
import { Event } from "@/types/event";

interface EventWithCount extends Event {
  volunteerCount: number;
}

export default function ManagerDashboard() {
  const [user, setUser] = useState({ id: "", name: "", email: "" });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(
    () => [
      { label: "Su kien da tao", value: 0, icon: Calendar },
      { label: "Tinh nguyen vien dang ky", value: 0, icon: Users },
      { label: "Su kien da duyet", value: 0, icon: CheckCircle },
    ],
    []
  );

  // Hydrate from localStorage (token + user)
  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");
      if (token) setAccessToken(token);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const fullName = [parsed.firstName, parsed.lastName].filter(Boolean).join(" ").trim() || parsed.name || parsed.email || "";
        setUser({ id: parsed.id || parsed.userId || "", name: fullName, email: parsed.email || "" });
      }
    } catch (err) {
      console.error("Failed to read auth from localStorage:", err);
    }
  }, []);

  // Keep auth in sync across tabs/focus
  useEffect(() => {
    const syncAuth = () => {
      try {
        const token = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");
        setAccessToken(token);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const fullName = [parsed.firstName, parsed.lastName].filter(Boolean).join(" ").trim() || parsed.name || parsed.email || "";
          setUser({ id: parsed.id || parsed.userId || "", name: fullName, email: parsed.email || "" });
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

  // Fetch profile from API for accurate name/email
  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) return;
      try {
        const res = await userApi.getProfile(accessToken);
        const data = res?.data;
        if (data) {
          const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim() || data.email || "";
          const nextUser = { id: data.id || data.userId || "", name: fullName, email: data.email || "" };
          setUser(nextUser);
          try {
            localStorage.setItem("user", JSON.stringify(data));
          } catch (_) {
            // ignore storage errors
          }
        }
      } catch (err) {
        console.error("Failed to load manager profile:", err);
      }
    };
    fetchProfile();
  }, [accessToken]);

  // Fetch manager events and approved registration counts
  useEffect(() => {
    if (!user.id) return;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await eventApi.getManagerEvents(user.id);
        const eventsData: Event[] = res.data || [];

        const eventsWithCount: EventWithCount[] = await Promise.all(
          eventsData.map(async (ev) => {
            const regRes = await registrationApi.getEventRegistrationCount(ev.id, { status: ["APPROVED"] });
            return { ...ev, volunteerCount: regRes.data?.count || 0 };
          })
        );

        setEvents(eventsWithCount);
      } catch (err) {
        console.error("Failed to load manager events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user.id]);

  const totalEvents = events.length;
  const totalVolunteers = events.reduce((sum, ev) => sum + ev.volunteerCount, 0);
  const approvedEvents = events.filter((ev) => ev.status === "APPROVED").length;

  const displayStats = stats.map((stat, idx) => {
    if (idx === 0) return { ...stat, value: totalEvents };
    if (idx === 1) return { ...stat, value: totalVolunteers };
    if (idx === 2) return { ...stat, value: approvedEvents };
    return stat;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Dashboard Nguoi to chuc</h1>
              <p className="text-muted mt-2">Chao mung, {user.name || user.email || "ban"}!</p>
            </div>
            <div className="flex gap-4">
              <Link href="/events/create" className="btn-primary flex items-center gap-2">
                <Plus size={20} /> Tao su kien
              </Link>
              <Link href="/settings" className="p-2 hover:bg-white rounded-lg transition-colors">
                <Settings size={24} />
              </Link>
              <button className="p-2 hover:bg-white rounded-lg transition-colors">
                <LogOut size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {displayStats.map((stat, idx) => {
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
            <div className="lg:col-span-2">
              <div className="card-base p-8">
                <h2 className="text-2xl font-bold mb-6">Su kien cua toi</h2>

                {loading ? (
                  <p className="text-muted">Dang tai du lieu...</p>
                ) : events.length === 0 ? (
                  <p className="text-muted">Chua co su kien nao.</p>
                ) : (
                  <div className="space-y-4">
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex gap-4 p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <img
                          src={ev.thumbnailUrl || "/placeholder.svg"}
                          alt={ev.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{ev.title}</h3>
                          <p className="text-sm text-muted mb-2">
                            {new Date(ev.startDate).toLocaleDateString("vi-VN")} | {ev.volunteerCount} tinh nguyen vien
                          </p>
                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              ev.status === "APPROVED" ? "bg-green-100 text-success" : "bg-yellow-100 text-warning"
                            }`}
                          >
                            {ev.status === "APPROVED" ? "Da duyet" : "Cho duyet"}
                          </span>
                        </div>

                        <div className="flex gap-2 self-center">
                          <Link href={`/events/${ev.id}/manage`} className="btn-secondary text-sm">
                            Quan ly
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="card-base p-8 sticky top-20">
                <h3 className="text-xl font-bold mb-4">Thong tin ca nhan</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted">Ten</p>
                    <p className="font-semibold">{user.name || "Dang cap nhat"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Email</p>
                    <p className="font-semibold">{user.email || "Dang cap nhat"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Vai tro</p>
                    <p className="font-semibold">Nguoi to chuc su kien</p>
                  </div>
                </div>
                <Link href="/profile" className="block w-full btn-primary mt-6 text-center">
                  Chinh sua ho so
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
