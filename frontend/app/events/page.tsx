"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { eventApi } from "@/lib/api";
import { Event } from "@/types/event";
import { useEventsRefresh } from "@/hooks/use-realtime";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventApi.searchEvents({
        search: searchTerm || undefined,
        status: "APPROVED",
      });
      if (response.success) {
        setEvents(response.data);
      } else {
        console.error("Failed to fetch events:", response.message);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEventsRefresh(() => {
    fetchEvents();
  });

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-3">Tất cả sự kiện</h1>
            <p className="text-muted-foreground text-lg">Khám phá các cơ hội tình nguyện đang chờ bạn</p>
          </div>

          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <Input
              type="search"
              placeholder="Tìm kiếm sự kiện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button className="bg-primary hover:bg-primary/90 md:w-auto" onClick={fetchEvents}>
              Tìm kiếm
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải sự kiện...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Không tìm thấy sự kiện nào</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  <img
                    src={event.thumbnailUrl || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {event.category || "Sự kiện"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {event.status === "APPROVED" ? "Đã duyệt" : event.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <p>📅 {formatDate(event.startDate)}</p>
                      <p>📍 {event.location}</p>
                      <p>
                        👥 {event.currentParticipants || 0}/{event.maxParticipants} tình nguyện viên
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                    <Link href={`/events/${event.id}`} className="mt-auto">
                      <Button className="w-full bg-primary hover:bg-primary/90">Xem chi tiết</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
