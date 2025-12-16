"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { eventApi } from "@/lib/api";
import { Event } from "@/types/event";
import { useEventsRefresh } from "@/hooks/use-realtime";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users } from "lucide-react";

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

  const heroStyle = useMemo(
    () => ({
      backgroundColor: "rgba(14,148,136,0.04)",
      borderBottom: "1px solid rgba(14,148,136,0.08)",
    }),
    []
  );

  const formatCategory = (cat?: string) => {
    if (!cat) return "Sự kiện";
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Navbar />
      <main className="flex-1">
        <div style={heroStyle} className="py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Tất cả sự kiện</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Khám phá các cơ hội tình nguyện đang chờ bạn
            </p>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Input
                type="search"
                placeholder="Tìm kiếm sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 rounded-full px-4 py-3 bg-white shadow-inner border border-border"
              />
              <Button
                className="bg-primary hover:bg-primary/90 rounded-full px-6"
                onClick={fetchEvents}
              >
                Tìm kiếm
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải sự kiện...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Không tìm thấy sự kiện nào</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col rounded-2xl border border-border"
                >
                  <img
                    src={event.thumbnailUrl || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-52 object-cover"
                  />
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {formatCategory(event.category)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{event.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-primary" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-primary" />
                        <span>
                          {event.currentParticipants || 0} tình nguyện viên đã đăng ký
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 mb-6 line-clamp-2">{event.description}</p>
                    <Link href={`/events/${event.id}`} className="mt-auto">
                      <Button className="w-full bg-primary hover:bg-primary/90 rounded-full">
                        Xem chi tiết
                      </Button>
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
