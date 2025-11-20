"use client"

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { ArrowRight, Heart, Users, Zap } from "lucide-react"
import { eventApi } from "@/lib/api";
import { Event } from "@/types/event";

type AppUser = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role?: string
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check authentication state from localStorage
    try {
      const u = localStorage.getItem("user")
      const at = localStorage.getItem("accessToken")
      if (u) setUser(JSON.parse(u))
      if (at) setAccessToken(at)
    } catch (_) {
      // ignore
    } finally {
      setHydrated(true)
    }
  }, []);

  const isAuthenticated = !!user && !!accessToken;

  // Determine the dashboard URL based on user role
  const dashboardHref = () => {
    const role = user?.role?.toLowerCase()
    if (!role) return "/dashboard/volunteer"
    if (["admin", "manager", "volunteer"].includes(role)) return `/dashboard/${role}`
    return "/dashboard/volunteer"
  };

  useEffect(() => {
    const fetchHighlightedEvents = async () => {
      try {
        const response = await eventApi.getEvents();
        if (response.success) {
          // Show the first 3 events as highlights (or fewer if less available)
          setEvents(response.data.slice(0, 3));
        } else {
          console.error('Failed to fetch events:', response.message);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightedEvents();
  }, []);

  // Format the date to Vietnamese format (DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Get number of registrations for an event
  const getVolunteerCount = (event: Event) => {
    return event.currentParticipants || 0;
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
          <div className="container-custom">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold mb-6">Kết nối - Cống hiến - Lan tỏa</h1>
              <p className="text-xl mb-8 text-neutral-100">
                Tham gia cộng đồng tình nguyện viên và tạo nên sự thay đổi tích cực cho xã hội.
              </p>
              {hydrated && isAuthenticated ? (
                <Link
                  href={dashboardHref()}
                  className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Tham gia ngay
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-neutral-50">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-12 text-center">Tại sao chọn VolunteerHub?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card-base p-6">
                <Heart className="text-accent mb-4" size={32} />
                <h3 className="text-xl font-semibold mb-2">Tạo tác động</h3>
                <p className="text-muted">Tham gia các sự kiện tình nguyện có ý nghĩa và tạo nên sự khác biệt.</p>
              </div>
              <div className="card-base p-6">
                <Users className="text-accent mb-4" size={32} />
                <h3 className="text-xl font-semibold mb-2">Kết nối cộng đồng</h3>
                <p className="text-muted">Gặp gỡ những người có cùng đam mê và xây dựng mối quan hệ bền vững.</p>
              </div>
              <div className="card-base p-6">
                <Zap className="text-accent mb-4" size={32} />
                <h3 className="text-xl font-semibold mb-2">Phát triển kỹ năng</h3>
                <p className="text-muted">Nâng cao kỹ năng cá nhân thông qua các hoạt động tình nguyện đa dạng.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Highlighted Events */}
        <section className="py-16">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-12">Sự kiện nổi bật</h2>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted text-lg">Đang tải sự kiện...</p>
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {events.map((event) => (
                  <div key={event.id} className="card-base overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={event.thumbnailUrl || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                      <p className="text-sm text-muted mb-4">
                        {formatDate(event.startDate)} • {event.location}
                      </p>
                      <p className="text-sm text-muted mb-4">{getVolunteerCount(event)} tình nguyện viên đã đăng ký</p>
                      <Link
                        href={`/events/${event.id}`}
                        className="inline-flex items-center text-primary hover:text-primary-dark font-semibold"
                      >
                        Xem chi tiết <ArrowRight size={16} className="ml-2" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted text-lg">Hiện chưa có sự kiện nào</p>
              </div>
            )}
            <div className="text-center">
              <Link href="/events" className="btn-primary">
                Xem tất cả sự kiện
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
