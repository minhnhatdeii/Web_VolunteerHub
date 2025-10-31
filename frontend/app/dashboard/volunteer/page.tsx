"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Calendar, Users, Heart, LogOut, Settings, User } from "lucide-react"

export default function VolunteerDashboard() {
  const [user] = useState({ name: "Nguyễn Văn A", email: "volunteer@test.com" })

  const stats = [
    { label: "Sự kiện đã tham gia", value: 5, icon: Calendar },
    { label: "Giờ tình nguyện", value: 24, icon: Users },
    { label: "Sự kiện yêu thích", value: 3, icon: Heart },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: "Dọn dẹp công viên thành phố",
      date: "15/11/2024",
      status: "approved",
      image: "/sunny-city-park.png",
    },
    {
      id: 2,
      title: "Dạy kèm cho trẻ em vùng sâu",
      date: "20/11/2024",
      status: "pending",
      image: "/tutoring-session.png",
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Dashboard Tình nguyện viên</h1>
              <p className="text-muted mt-2">Chào mừng, {user.name}!</p>
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
              <div className="card-base p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Sự kiện sắp diễn ra</h2>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
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
                          className={`text-xs px-3 py-1 rounded-full ${
                            event.status === "approved" ? "bg-green-100 text-success" : "bg-yellow-100 text-warning"
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

              <div className="card-base p-8">
                <h2 className="text-2xl font-bold mb-6">Thông báo</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-blue-900">Đăng ký được duyệt</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Đăng ký của bạn cho sự kiện "Dọn dẹp công viên" đã được duyệt!
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-900">Sự kiện mới</p>
                    <p className="text-sm text-green-700 mt-1">Có sự kiện mới phù hợp với sở thích của bạn</p>
                  </div>
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
                    <p className="font-semibold">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Email</p>
                    <p className="font-semibold">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Vai trò</p>
                    <p className="font-semibold">Tình nguyện viên</p>
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
