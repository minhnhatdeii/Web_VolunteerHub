"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EventDiscussionFeed from "@/components/event-discussion-feed";
import { eventApi, registrationApi } from "@/lib/api";
import { Event } from "@/types/event";
import { useEventRealtime } from "@/hooks/use-realtime";

export default function EventDetailPageClient({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [volunteers, setVolunteers] = useState(0);

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventApi.getEventById(params.id);
      if (response.success) {
        setEvent(response.data);
        setVolunteers(response.data.currentParticipants || 0);
      }
    } catch (err) {
      console.error("Failed to load event:", err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEventRealtime(params.id, {
    onEventUpdate: (updated) => {
      if (updated.id !== params.id) return;
      setEvent((prev) => (prev ? { ...prev, ...updated } : updated));
      if (typeof updated.currentParticipants === "number") {
        setVolunteers(updated.currentParticipants);
      }
    },
  });

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleRegister = async () => {
    if (!event) return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập để đăng ký.");
      return;
    }
    try {
      const res = await registrationApi.registerForEvent(event.id, token);
      if (res.success) {
        setIsRegistered(true);
        setVolunteers((v) => v + 1);
      } else {
        alert(res.message || "Đăng ký thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Đăng ký thất bại");
    }
  };

  const handleCancel = async () => {
    if (!event) return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập.");
      return;
    }
    try {
      const res = await registrationApi.cancelRegistration(event.id, token);
      if (res.success) {
        setIsRegistered(false);
        setVolunteers((v) => Math.max(0, v - 1));
      } else {
        alert(res.message || "Hủy đăng ký thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Hủy đăng ký thất bại");
    }
  };

  const category = event?.category || "Sự kiện";
  const tags = useMemo(() => {
    if (!event) return [];
    const base = [event.category].filter(Boolean);
    return base;
  }, [event]);

  if (loading || !event) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-muted">Đang tải sự kiện...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const progress = event.maxParticipants
    ? Math.min(100, (volunteers / event.maxParticipants) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/events" className="text-primary hover:underline mb-6 block">
            ← Quay lại sự kiện
          </Link>

          <img
            src={event.thumbnailUrl || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />

          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            <div>
              <div className="mb-6">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {category}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{event.title}</h1>

              <div className="space-y-3 mb-8 text-muted-foreground">
                <p className="text-lg">
                  📅 {new Date(event.startDate).toLocaleDateString("vi-VN")}{" "}
                  {new Date(event.startDate).toLocaleTimeString("vi-VN")}
                </p>
                <p className="text-lg">
                  ⏰ {new Date(event.startDate).toLocaleTimeString("vi-VN")} -{" "}
                  {new Date(event.endDate).toLocaleTimeString("vi-VN")}
                </p>
                <p className="text-lg">📍 {event.location}</p>
              </div>

              <Tabs defaultValue="about" className="mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                  <TabsTrigger value="about">Về sự kiện</TabsTrigger>
                  <TabsTrigger value="requirements">Yêu cầu</TabsTrigger>
                  <TabsTrigger value="volunteers">Tình nguyện viên</TabsTrigger>
                  <TabsTrigger value="discussion">Thảo luận</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="mt-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2">Mô tả chi tiết</h3>
                    <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                  </div>
                  {tags.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3">Thẻ</h3>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="requirements" className="mt-6">
                  {Array.isArray((event as any).requirements) ? (
                    <ul className="space-y-3">
                      {(event as any).requirements.map((req: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-primary font-bold">✓</span>
                          <span className="leading-relaxed">{req}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Không có yêu cầu cụ thể.</p>
                  )}
                </TabsContent>

                <TabsContent value="volunteers" className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Tiến độ đăng ký</p>
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-sm font-semibold">
                        {volunteers} / {event.maxParticipants} tình nguyện viên
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="discussion" className="mt-6">
                  <EventDiscussionFeed />
                </TabsContent>
              </Tabs>

              <Card className="p-6 bg-secondary/10 border-secondary/20">
                <div className="flex items-start gap-4">
                  <span className="text-5xl">🌍</span>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Được tổ chức bởi</p>
                    <p className="font-bold text-xl mb-2">
                      {event.creator?.firstName} {event.creator?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Liên hệ qua email: {event.creator?.id}
                    </p>
                    <Button variant="outline" className="mt-4 bg-transparent">
                      Theo dõi
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6 sticky top-20">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Trạng thái đăng ký</p>
                    <p className="text-lg font-bold">{isRegistered ? "Đã đăng ký" : "Chưa đăng ký"}</p>
                  </div>

                  <Button
                    onClick={handleRegister}
                    className={`w-full ${
                      isRegistered ? "bg-secondary hover:bg-secondary/90" : "bg-primary hover:bg-primary/90"
                    }`}
                    disabled={isRegistered}
                  >
                    {isRegistered ? "Đã đăng ký sự kiện" : "Đăng ký sự kiện"}
                  </Button>

                  {isRegistered && (
                    <div className="pt-4 border-t border-border space-y-2">
                      <p className="text-sm text-muted-foreground mb-1">Các tùy chọn khác</p>
                      <Button variant="outline" className="w-full bg-transparent" onClick={handleCancel}>
                        Huỷ đăng ký
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        Chia sẻ sự kiện
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      ℹ️ Bạn sẽ nhận được thông báo qua email trước 24 giờ sự kiện bắt đầu
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Người tổ chức</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={event.creator?.avatarUrl || "/placeholder.svg"} alt="Organizer" />
                    <AvatarFallback>
                      {(event.creator?.firstName || "O").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {event.creator?.firstName} {event.creator?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">Quản lý sự kiện</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-primary/5">
                <h3 className="font-bold text-lg mb-3">Chia sẻ sự kiện</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Mời bạn bè của bạn tham gia sự kiện này!
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Copy
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
