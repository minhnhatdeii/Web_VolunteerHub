"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Plus, Users, Calendar, CheckCircle, LogOut, Settings } from "lucide-react"
import { eventApi, registrationApi } from "@/lib/api"
import { Event } from "@/types/event"
import { Registration } from "@/types/registration"

interface EventWithCount extends Event {
  volunteerCount: number
}

export default function ManagerDashboard() {
  const [user, setUser] = useState({ id: "", name: "", email: "" })
  const [events, setEvents] = useState<EventWithCount[]>([])
  const [loading, setLoading] = useState(true)

  const stats = [
    { label: "Sự kiện đã tạo", value: 0, icon: Calendar },
    { label: "Tình nguyện viên đăng ký", value: 0, icon: Users },
    { label: "Sự kiện đã duyệt", value: 0, icon: CheckCircle },
  ]

  // Lấy user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setUser({ id: parsed.id, name: parsed.name, email: parsed.email })
    }
  }, [])

  // Lấy sự kiện của manager và số lượng đăng ký
  useEffect(() => {
    if (!user.id) return

    const fetchEvents = async () => {
      try {
        setLoading(true)
        const res = await eventApi.getManagerEvents(user.id)
        const eventsData: Event[] = res.data || []

        // Lấy số lượng approved registrations cho từng event
        const eventsWithCount: EventWithCount[] = await Promise.all(
          eventsData.map(async (ev) => {
            const regRes = await registrationApi.getEventRegistrationCount(ev.id, { status: ['APPROVED'] })
            return { ...ev, volunteerCount: regRes.data?.count || 0 }
          })
        )


        setEvents(eventsWithCount)
      } catch (err) {
        console.error("Failed to load manager events:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [user.id])

  // Tính tổng stats
  const totalEvents = events.length
  const totalVolunteers = events.reduce((sum, ev) => sum + ev.volunteerCount, 0)
  const approvedEvents = events.filter(ev => ev.status === "APPROVED").length

  stats[0].value = totalEvents
  stats[1].value = totalVolunteers
  stats[2].value = approvedEvents

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Dashboard Người tổ chức</h1>
              <p className="text-muted mt-2">Chào mừng, {user.name}!</p>
            </div>
            <div className="flex gap-4">
              <Link href="/events/create" className="btn-primary flex items-center gap-2">
                <Plus size={20} /> Tạo sự kiện
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
              const Icon = stat.icon
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
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="card-base p-8">
                <h2 className="text-2xl font-bold mb-6">Sự kiện của tôi</h2>

                {loading ? (
                  <p>Đang tải dữ liệu...</p>
                ) : events.length === 0 ? (
                  <p>Chưa có sự kiện nào.</p>
                ) : (
                  <div className="space-y-4">
                    {events.map(ev => (
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
                            {new Date(ev.startDate).toLocaleDateString("vi-VN")} • {ev.volunteerCount} tình nguyện viên
                          </p>
                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              ev.status === "APPROVED" ? "bg-green-100 text-success" : "bg-yellow-100 text-warning"
                            }`}
                          >
                            {ev.status === "APPROVED" ? "Đã duyệt" : "Chờ duyệt"}
                          </span>
                        </div>

                        <div className="flex gap-2 self-center">
                          <Link href={`/events/${ev.id}/manage`} className="btn-secondary text-sm">
                            Quản lý
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="card-base p-8 sticky top-20">
                <h3 className="text-xl font-bold mb-4">Thông tin cá nhân</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted">Tên</p>
                    <p className="font-semibold">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Email</p>
                    <p className="font-semibold">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Vai trò</p>
                    <p className="font-semibold">Người tổ chức sự kiện</p>
                  </div>
                </div>
                <Link href="/profile" className="w-full btn-primary mt-6">
                  Chỉnh sửa hồ sơ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
