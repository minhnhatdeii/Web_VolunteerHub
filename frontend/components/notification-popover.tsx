"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle, XCircle, AlertCircle, Info, ExternalLink } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationApi } from "@/lib/api";
import { Notification, NotificationType } from "@/types/notification";

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'event_approved':
        case 'registration_approved':
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'event_rejected':
        case 'registration_rejected':
            return <XCircle className="h-5 w-5 text-red-500" />;
        case 'reminder':
            return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        case 'new_registration':
        case 'event_submitted':
            return <Info className="h-5 w-5 text-blue-500" />;
        default:
            return <Bell className="h-5 w-5 text-gray-500" />;
    }
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};

export default function NotificationPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            setIsLoading(true);
            const response = await notificationApi.getNotifications(token, { limit: 10 });
            if (response.success) {
                setNotifications(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            const response = await notificationApi.getUnreadCount(token);
            if (response.success) {
                setUnreadCount(response.data.count);
            }
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        // Refresh unread count every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            await notificationApi.markAsRead(token, notificationId);
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            await notificationApi.markAllAsRead(token);
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read first
        if (!notification.isRead) {
            await handleMarkAsRead(notification.id);
        }

        // Navigate to related event if available
        if (notification.data?.eventId) {
            setIsOpen(false);
            router.push(`/events/${notification.data.eventId}`);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-xs font-bold text-white bg-red-500 rounded-full px-1">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-semibold text-sm">Thông báo</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-primary hover:underline"
                        >
                            Đánh dấu đã đọc
                        </button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <Bell className="h-10 w-10 mb-2 opacity-50" />
                            <p className="text-sm">Không có thông báo</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? "bg-blue-50" : ""
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-medium text-sm truncate">
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xs text-gray-400">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </p>
                                                {notification.data?.eventId && (
                                                    <span className="flex items-center gap-1 text-xs text-primary">
                                                        <ExternalLink className="h-3 w-3" />
                                                        Xem sự kiện
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="border-t p-2">
                    <Link href="/notifications" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full text-sm">
                            Xem tất cả thông báo
                        </Button>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
