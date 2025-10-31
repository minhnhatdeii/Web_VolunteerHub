"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { CheckCircle, Users, Calendar, TrendingUp, LogOut, Settings } from "lucide-react"

export default function AdminDashboard() {
  const [user] = useState({ name: "Admin User", email: "admin@test.com" })

  const stats = [
    { label: "Tổng người dùng", value: 1250, icon: Users },
    { label: "Sự kiện chờ duyệt", value: 5, icon: Calendar },
    { label: "Tổng lượt đăng ký", value: 3420, icon: TrendingUp },
    { label: "Sự kiện đã duyệt", value: 42, icon: CheckCircle },
  ]

  const pendingEvents = [
    {
      id: 1,
      title: "Dọn dẹp công viên thành phố",
      organizer: "Tổ chức Xanh Việt",
      date: "15/11/2024",
      image: "/sunny-city-park.png",
    },
    {
      id: 2,
      title: "Dạy kèm cho trẻ em vùng sâu",
      organizer: "Tổ chức Giáo dục",
      date: "20/11/2024",
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
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-muted mt-2">Chào mừng, {user.name}!</p>
            </div>
            <div className="flex gap-4">
              <Link href="/admin/reports" className="btn-primary">
                Xem báo cáo
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
              const Icon = stat.icon
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
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="card-base p-8">
                <h2 className="text-2xl font-bold mb-6">Sự kiện chờ duyệt</h2>
                <div className="space-y-4">
                  {pendingEvents.map((event) => (
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
                        <p className="text-sm text-muted mb-2">{event.organizer}</p>
                        <p className="text-sm text-muted">{event.date}</p>
                      </div>
                      <div className="flex gap-2 self-center">
                        <button className="btn-primary text-sm">Duyệt</button>
                        <button className="btn-secondary text-sm">Từ chối</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="card-base p-8 sticky top-20">
                <h3 className="text-xl font-bold mb-4">Thông tin quản trị</h3>
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
                    <p className="font-semibold">Quản trị viên</p>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <Link href="/admin/users" className="w-full btn-secondary block text-center">
                    Quản lý người dùng
                  </Link>
                  <Link href="/admin/events" className="w-full btn-secondary block text-center">
                    Quản lý sự kiện
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
