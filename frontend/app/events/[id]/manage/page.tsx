"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Edit2,
  Trash2,
  MessageSquare,
} from "lucide-react"
import { eventApi, registrationApi } from "@/lib/api"
import { Event } from "@/types/event"
import { Registration } from "@/types/registration"
import { useEventRealtime } from "@/hooks/use-realtime"

export default function EventManagePage() {
  const params = useParams()
  const eventId = Array.isArray(params.id) ? params.id[0] : (params.id as string)

  const [event, setEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editData, setEditData] = useState<Event | null>(null)

  const fetchEventData = useCallback(async () => {
    if (!eventId) return
    try {
      setLoading(true)
      const eventRes = await eventApi.getEventById(eventId)
      setEvent(eventRes.data)
      setEditData(eventRes.data)

      const regRes = await registrationApi.getEventRegistrations(eventId, {
        status: ["PENDING", "APPROVED"],
        managerToken: localStorage.getItem("accessToken") || undefined,
      })
      setRegistrations(regRes.data)
    } catch (err) {
      console.error("Failed to load event data:", err)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchEventData()
  }, [fetchEventData])

  useEventRealtime(eventId, {
    onEventUpdate: (updated) => {
      setEvent((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev))
      setEditData((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev))
    },
  })

  const handleApproveRegistration = async (registrationId: string) => {
    try {
      const token = localStorage.getItem("accessToken") || ""

      const res: any = await registrationApi.approveRegistration(eventId, registrationId, token)

      if (res.success) {
        alert(`Duyệt ${res.registration.user.firstName} thành công!`)
        setRegistrations(
          registrations.map((r) => (r.id === registrationId ? { ...r, status: "APPROVED" } : r)),
        )
      } else {
        console.error("Approve failed:", res.message)
        alert("Duyệt thất bại!")
      }
    } catch (err) {
      console.error("Approve error:", err)
      alert("Đã xảy ra lỗi khi duyệt đăng ký.")
    }
  }

  const handleRejectRegistration = async (registrationId: string) => {
    try {
      const token = localStorage.getItem("accessToken") || ""

      const res: any = await registrationApi.rejectRegistration(eventId, registrationId, token)

      if (res.success) {
        alert(`Đã từ chối ${res.registration.user.firstName}!`)
        setRegistrations(registrations.filter((r) => r.id !== registrationId))
      } else {
        console.error("Reject failed:", res.message)
        alert("Từ chối thất bại!")
      }
    } catch (err) {
      console.error("Reject error:", err)
      alert("Đã xảy ra lỗi khi từ chối đăng ký.")
    }
  }

  const handleUpdateEvent = () => {
    if (editData) {
      setEvent(editData)
      setShowEditForm(false)
      alert("Sự kiện đã được cập nhật!")
    }
  }

  const handleDeleteEvent = () => {
    if (confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      alert("Sự kiện đã được xóa!")
      // redirect về dashboard
    }
  }

  if (loading || !event) return <p className="text-center mt-20">Đang tải dữ liệu...</p>

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
                        event.status === "APPROVED"
                          ? "bg-green-100 text-success"
                          : "bg-yellow-100 text-warning"
                      }`}
                    >
                      {event.status === "APPROVED" ? "Đã duyệt" : "Chờ duyệt"}
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
                        value={editData?.title || ""}
                        onChange={(e) => setEditData({ ...editData!, title: e.target.value })}
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Mô tả</label>
                      <textarea
                        value={editData?.description || ""}
                        onChange={(e) => setEditData({ ...editData!, description: e.target.value })}
                        className="input-base"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Ngày bắt đầu</label>
                        <input
                          type="text"
                          value={new Date(editData?.startDate || "").toLocaleDateString()}
                          className="input-base"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Ngày kết thúc</label>
                        <input
                          type="text"
                          value={new Date(editData?.endDate || "").toLocaleDateString()}
                          className="input-base"
                          readOnly
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
                          {new Date(event.startDate).toLocaleString()} -{" "}
                          {new Date(event.endDate).toLocaleString()}
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
                          {registrations.filter((r) => r.status === "APPROVED").length}/
                          {event.maxParticipants}
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

              {/* Registrations List */}
              <div className="card-base p-8">
                <h2 className="text-2xl font-bold mb-6">
                  Danh sách đăng ký ({registrations.length})
                </h2>
                <div className="space-y-4">
                  {registrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {reg.user.firstName} {reg.user.lastName}
                        </h3>
                        <p className="text-sm text-muted">{reg.user.email}</p>
                        <p className="text-xs text-muted mt-1">
                          Đăng ký: {new Date(reg.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            reg.status === "APPROVED"
                              ? "bg-green-100 text-success"
                              : "bg-yellow-100 text-warning"
                          }`}
                        >
                          {reg.status === "APPROVED" ? "Đã duyệt" : "Chờ duyệt"}
                        </span>
                        {reg.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveRegistration(reg.id)}
                              className="btn-primary text-xs"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleRejectRegistration(reg.id)}
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
                          width: `${
                            (registrations.filter((r) => r.status === "APPROVED").length /
                              event.maxParticipants) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted mt-2">
                      {registrations.filter((r) => r.status === "APPROVED").length}/
                      {event.maxParticipants} chỗ
                    </p>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <p className="text-sm text-muted mb-3">Tình trạng</p>
                    <p className="font-semibold text-lg">
                      {event.status === "APPROVED" ? "Đã duyệt" : "Chờ duyệt"}
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
