"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { CheckCircle, XCircle, Eye, Calendar, Users, MapPin } from "lucide-react"

export default function AdminEventsPage() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Dọn dẹp công viên thành phố",
      organizer: "Tổ chức Xanh Việt",
      date: "15/11/2024",
      location: "Công viên Tao Đàn",
      volunteers: 24,
      status: "pending",
      image: "/park-cleanup-event.jpg",
    },
    {
      id: 2,
      title: "Dạy kèm cho trẻ em vùng sâu",
      organizer: "Tổ chức Giáo dục",
      date: "20/11/2024",
      location: "Trường tiểu học Sơn La",
      volunteers: 18,
      status: "pending",
      image: "/tutoring-session.png",
    },
    {
      id: 3,
      title: "Chương trình hiến máu tình nguyện",
      organizer: "Bệnh viện Bạch Mai",
      date: "25/11/2024",
      location: "Bệnh viện Bạch Mai",
      volunteers: 32,
      status: "approved",
      image: "/blood-donation.jpg",
    },
  ])

  const handleApprove = (id: number) => {
    setEvents(events.map((e) => (e.id === id ? { ...e, status: "approved" } : e)))
    alert("Sự kiện đã được duyệt!")
  }

  const handleReject = (id: number) => {
    setEvents(events.filter((e) => e.id !== id))
    alert("Sự kiện đã bị từ chối!")
  }

  const pendingEvents = events.filter((e) => e.status === "pending")
  const approvedEvents = events.filter((e) => e.status === "approved")

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-8">Quản lý duyệt sự kiện</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card-base p-6">
              <p className="text-muted text-sm mb-2">Tổng sự kiện</p>
              <p className="text-4xl font-bold text-primary">{events.length}</p>
            </div>
            <div className="card-base p-6">
              <p className="text-muted text-sm mb-2">Chờ duyệt</p>
              <p className="text-4xl font-bold text-warning">{pendingEvents.length}</p>
            </div>
            <div className="card-base p-6">
              <p className="text-muted text-sm mb-2">Đã duyệt</p>
              <p className="text-4xl font-bold text-success">{approvedEvents.length}</p>
            </div>
          </div>

          {/* Pending Events */}
          <div className="card-base p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Sự kiện chờ duyệt ({pendingEvents.length})</h2>
            {pendingEvents.length > 0 ? (
              <div className="space-y-4">
                {pendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-4 p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{event.title}</h3>
                      <div className="space-y-1 text-sm text-muted mb-3">
                        <p className="flex items-center gap-2">
                          <Users size={16} />
                          Tổ chức: {event.organizer}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={16} />
                          {event.date}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={16} />
                          {event.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 self-center">
                      <button
                        onClick={() => handleApprove(event.id)}
                        className="flex items-center gap-2 bg-green-100 text-success px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <CheckCircle size={18} />
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(event.id)}
                        className="flex items-center gap-2 bg-red-100 text-error px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <XCircle size={18} />
                        Từ chối
                      </button>
                      <Link
                        href={`/events/${event.id}`}
                        className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye size={18} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-8">Không có sự kiện chờ duyệt</p>
            )}
          </div>

          {/* Approved Events */}
          <div className="card-base p-8">
            <h2 className="text-2xl font-bold mb-6">Sự kiện đã duyệt ({approvedEvents.length})</h2>
            {approvedEvents.length > 0 ? (
              <div className="space-y-4">
                {approvedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-4 p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{event.title}</h3>
                      <div className="space-y-1 text-sm text-muted">
                        <p className="flex items-center gap-2">
                          <Users size={16} />
                          Tổ chức: {event.organizer}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={16} />
                          {event.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-center">
                      <span className="bg-green-100 text-success px-3 py-1 rounded-full text-sm font-semibold">
                        ✓ Đã duyệt
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-8">Không có sự kiện đã duyệt</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
