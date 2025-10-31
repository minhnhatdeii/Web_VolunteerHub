"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ArrowLeft, Users, Calendar, MapPin, Edit2, Trash2, MessageSquare } from "lucide-react"

export default function EventManagePage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState({
    id: params.id,
    title: "Dọn dẹp công viên thành phố",
    date: "15/11/2024",
    time: "08:00 - 12:00",
    location: "Công viên Tao Đàn, Hà Nội",
    category: "Môi trường",
    status: "approved",
    volunteers: 24,
    maxVolunteers: 50,
    description: "Chúng tôi tổ chức một sự kiện dọn dẹp công viên để bảo vệ môi trường.",
    image: "/park-cleanup-event.jpg",
  })

  const [volunteers, setVolunteers] = useState([
    { id: 1, name: "Nguyễn Văn A", email: "a@test.com", status: "approved", joinedDate: "10/11/2024" },
    { id: 2, name: "Trần Thị B", email: "b@test.com", status: "approved", joinedDate: "11/11/2024" },
    { id: 3, name: "Lê Văn C", email: "c@test.com", status: "pending", joinedDate: "12/11/2024" },
  ])

  const [showEditForm, setShowEditForm] = useState(false)
  const [editData, setEditData] = useState(event)

  const handleApproveVolunteer = (id: number) => {
    setVolunteers(volunteers.map((v) => (v.id === id ? { ...v, status: "approved" } : v)))
  }

  const handleRejectVolunteer = (id: number) => {
    setVolunteers(volunteers.filter((v) => v.id !== id))
  }

  const handleUpdateEvent = () => {
    setEvent(editData)
    setShowEditForm(false)
    alert("Sự kiện đã được cập nhật!")
  }

  const handleDeleteEvent = () => {
    if (confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      alert("Sự kiện đã được xóa!")
      // Redirect to manager dashboard
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <Link
            href="/dashboard/manager"
            className="inline-flex items-center text-primary hover:text-primary-dark mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay lại dashboard
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Event Info */}
              <div className="card-base p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        event.status === "approved" ? "bg-green-100 text-success" : "bg-yellow-100 text-warning"
                      }`}
                    >
                      {event.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEditForm(!showEditForm)}
                      className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={20} className="text-primary" />
                    </button>
                    <button
                      onClick={handleDeleteEvent}
                      className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} className="text-error" />
                    </button>
                  </div>
                </div>

                {showEditForm ? (
                  <div className="space-y-4 mb-6 pb-6 border-b border-border">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tên sự kiện</label>
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Mô tả</label>
                      <textarea
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="input-base"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Ngày</label>
                        <input
                          type="text"
                          value={editData.date}
                          onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                          className="input-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Giờ</label>
                        <input
                          type="text"
                          value={editData.time}
                          onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                          className="input-base"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleUpdateEvent} className="btn-primary">
                        Lưu thay đổi
                      </button>
                      <button onClick={() => setShowEditForm(false)} className="btn-secondary">
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-primary" size={20} />
                      <div>
                        <p className="text-sm text-muted">Ngày giờ</p>
                        <p className="font-semibold">
                          {event.date} {event.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="text-primary" size={20} />
                      <div>
                        <p className="text-sm text-muted">Địa điểm</p>
                        <p className="font-semibold">{event.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="text-primary" size={20} />
                      <div>
                        <p className="text-sm text-muted">Tình nguyện viên</p>
                        <p className="font-semibold">
                          {event.volunteers}/{event.maxVolunteers}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted">Danh mục</p>
                      <p className="font-semibold">{event.category}</p>
                    </div>
                  </div>
                )}

                <h2 className="text-2xl font-bold mb-4">Mô tả</h2>
                <p className="text-foreground leading-relaxed">{event.description}</p>
              </div>

              {/* Volunteers List */}
              <div className="card-base p-8">
                <h2 className="text-2xl font-bold mb-6">Danh sách tình nguyện viên ({volunteers.length})</h2>
                <div className="space-y-4">
                  {volunteers.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{volunteer.name}</h3>
                        <p className="text-sm text-muted">{volunteer.email}</p>
                        <p className="text-xs text-muted mt-1">Đăng ký: {volunteer.joinedDate}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            volunteer.status === "approved" ? "bg-green-100 text-success" : "bg-yellow-100 text-warning"
                          }`}
                        >
                          {volunteer.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                        </span>
                        {volunteer.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveVolunteer(volunteer.id)}
                              className="btn-primary text-xs"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleRejectVolunteer(volunteer.id)}
                              className="btn-secondary text-xs"
                            >
                              Từ chối
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="card-base p-8 sticky top-20">
                <h3 className="text-xl font-bold mb-6">Thống kê sự kiện</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted mb-2">Tiến độ đăng ký</p>
                    <div className="w-full bg-neutral-200 rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full"
                        style={{
                          width: `${(event.volunteers / event.maxVolunteers) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted mt-2">
                      {event.volunteers}/{event.maxVolunteers} chỗ
                    </p>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <p className="text-sm text-muted mb-3">Tình trạng</p>
                    <p className="font-semibold text-lg">
                      {event.status === "approved" ? "✓ Đã duyệt" : "⏳ Chờ duyệt"}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <Link href={`/events/${event.id}`} className="w-full btn-secondary block text-center">
                      Xem trang công khai
                    </Link>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <button className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <MessageSquare size={18} />
                      Gửi thông báo
                    </button>
                  </div>
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
