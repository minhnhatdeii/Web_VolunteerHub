"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Bell, Trash2, CheckCircle, XCircle, AlertCircle, Info, ExternalLink } from "lucide-react"
import { notificationApi } from "@/lib/api"
import { Notification, NotificationType } from "@/types/notification"

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'event_approved':
    case 'registration_approved':
      return { icon: CheckCircle, bgColor: "bg-green-100", textColor: "text-green-600" }
    case 'event_rejected':
    case 'registration_rejected':
      return { icon: XCircle, bgColor: "bg-red-100", textColor: "text-red-600" }
    case 'reminder':
      return { icon: AlertCircle, bgColor: "bg-yellow-100", textColor: "text-yellow-600" }
    case 'new_registration':
    case 'event_submitted':
      return { icon: Info, bgColor: "bg-blue-100", textColor: "text-blue-600" }
    default:
      return { icon: Bell, bgColor: "bg-purple-100", textColor: "text-purple-600" }
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Vừa xong"
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/login")
        return
      }

      setIsLoading(true)
      setError(null)
      const response = await notificationApi.getNotifications(token, { limit: 50 })
      if (response.success) {
        setNotifications(response.data)
      } else {
        setError("Không thể tải thông báo")
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
      setError("Đã xảy ra lỗi khi tải thông báo")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) return

      await notificationApi.markAsRead(token, id)
      setNotifications(notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      ))
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) return

      await notificationApi.markAllAsRead(token)
      setNotifications(notifications.map((notif) => ({ ...notif, isRead: true })))
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id)
    }

    // Navigate to related event if available
    if (notification.data?.eventId) {
      router.push(`/events/${notification.data.eventId}`)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom max-w-2xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Thông báo</h1>
              <p className="text-muted mt-2">
                {isLoading
                  ? "Đang tải..."
                  : unreadCount > 0
                    ? `Bạn có ${unreadCount} thông báo chưa đọc`
                    : "Không có thông báo mới"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="btn-secondary">
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-600">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const { icon: Icon, bgColor, textColor } = getNotificationIcon(notification.type)
                return (
                  <div
                    key={notification.id}
                    className={`card-base p-6 flex gap-4 transition-colors cursor-pointer hover:shadow-md ${!notification.isRead ? "bg-blue-50 border-blue-200" : ""
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor} ${textColor}`}
                      >
                        <Icon size={24} />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>}
                      </div>
                      <p className="text-foreground mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted">{formatTimeAgo(notification.createdAt)}</p>
                        <div className="flex gap-2 items-center">
                          {notification.data?.eventId && (
                            <span className="flex items-center gap-1 text-xs text-primary">
                              <ExternalLink size={14} />
                              Xem sự kiện
                            </span>
                          )}
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsRead(notification.id)
                              }}
                              className="text-xs text-primary hover:text-primary-dark font-semibold"
                            >
                              Đánh dấu đã đọc
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
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
