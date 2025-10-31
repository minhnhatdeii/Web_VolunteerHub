"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Bell, Trash2, CheckCircle, AlertCircle, Info } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "approval",
      title: "Đăng ký được duyệt",
      message: "Đăng ký của bạn cho sự kiện 'Dọn dẹp công viên' đã được duyệt!",
      timestamp: "2 giờ trước",
      read: false,
      icon: CheckCircle,
    },
    {
      id: 2,
      type: "event",
      title: "Sự kiện mới",
      message: "Có sự kiện mới phù hợp với sở thích của bạn: 'Dạy kèm cho trẻ em vùng sâu'",
      timestamp: "5 giờ trước",
      read: false,
      icon: Info,
    },
    {
      id: 3,
      type: "reminder",
      title: "Nhắc nhở sự kiện",
      message: "Sự kiện 'Chương trình hiến máu' sẽ diễn ra vào ngày mai lúc 08:00",
      timestamp: "1 ngày trước",
      read: true,
      icon: AlertCircle,
    },
    {
      id: 4,
      type: "announcement",
      title: "Thông báo từ tổ chức",
      message: "Địa điểm sự kiện 'Xây dựng nhà' đã thay đổi. Vui lòng kiểm tra chi tiết.",
      timestamp: "2 ngày trước",
      read: true,
      icon: Bell,
    },
  ])

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter((notif) => notif.id !== id))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom max-w-2xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Thông báo</h1>
              <p className="text-muted mt-2">
                {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : "Không có thông báo mới"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="btn-secondary">
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = notification.icon
              return (
                <div
                  key={notification.id}
                  className={`card-base p-6 flex gap-4 transition-colors ${
                    !notification.read ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        notification.type === "approval"
                          ? "bg-green-100 text-success"
                          : notification.type === "event"
                            ? "bg-blue-100 text-info"
                            : notification.type === "reminder"
                              ? "bg-yellow-100 text-warning"
                              : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      <Icon size={24} />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>}
                    </div>
                    <p className="text-foreground mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted">{notification.timestamp}</p>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-primary hover:text-primary-dark font-semibold"
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 hover:bg-neutral-200 rounded transition-colors"
                        >
                          <Trash2 size={16} className="text-muted" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-muted mb-4" />
              <p className="text-muted text-lg">Không có thông báo nào</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
