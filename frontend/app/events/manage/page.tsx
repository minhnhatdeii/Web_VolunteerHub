"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Plus, Search, Filter, Edit2, Eye, Trash2, Calendar, Users, CheckCircle, Clock } from "lucide-react"

export default function ManageEventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Dọn dẹp công viên thành phố",
      date: "15/11/2024",
      location: "Công viên Tao Đàn",
      status: "approved",
      volunteers: 24,
      maxVolunteers: 50,
      image: "/park-cleanup-event.jpg",
    },
    {
      id: 2,
      title: "Dạy kèm cho trẻ em vùng sâu",
      date: "20/11/2024",
      location: "Trường tiểu học Sơn La",
      status: "pending",
      volunteers: 18,
      maxVolunteers: 30,
      image: "/tutoring-session.png",
    },
    {
      id: 3,
      title: "Chương trình hiến máu tình nguyện",
      date: "25/11/2024",
      location: "Bệnh viện Bạch Mai",
      status: "approved",
      volunteers: 32,
      maxVolunteers: 40,
      image: "/blood-donation.jpg",
    },
  ])

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || event.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleDeleteEvent = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      setEvents(events.filter((e) => e.id !== id))
    }
  }

  const stats = [
    { label: "Tổng sự kiện", value: events.length, icon: Calendar },
    { label: "Đã duyệt", value: events.filter((e) => e.status === "approved").length, icon: CheckCircle },
    { label: "Chờ duyệt", value: events.filter((e) => e.status === "pending").length, icon: Clock },
    { label: "Tổng tình nguyện viên", value: events.reduce((sum, e) => sum + e.volunteers, 0), icon: Users },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Quản lý sự kiện</h1>
              <p className="text-muted mt-2">Quản lý tất cả sự kiện của bạn</p>
            </div>
            <Link href="/events/create" className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              Tạo sự kiện mới
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="card-base p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted text-sm mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    </div>
                    <Icon className="text-accent" size={32} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Search and Filter */}
          <div className="card-base p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-muted" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sự kiện..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-base pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-muted" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-base flex-1"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="pending">Chờ duyệt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Events Table */}
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-100 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Sự kiện</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Ngày</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tình nguyện viên</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="border-b border-border hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={event.image || "/placeholder.svg"}
                            alt={event.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-semibold">{event.title}</p>
                            <p className="text-sm text-muted">{event.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{event.date}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-neutral-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${(event.volunteers / event.maxVolunteers) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs whitespace-nowrap">
                            {event.volunteers}/{event.maxVolunteers}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            event.status === "approved" ? "bg-green-100 text-success" : "bg-yellow-100 text-warning"
                          }`}
                        >
                          {event.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/events/${event.id}/manage`}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Quản lý"
                          >
                            <Edit2 size={18} className="text-primary" />
                          </Link>
                          <Link
                            href={`/events/${event.id}`}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Xem"
                          >
                            <Eye size={18} className="text-muted" />
                          </Link>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={18} className="text-error" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted text-lg">Không tìm thấy sự kiện nào</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
