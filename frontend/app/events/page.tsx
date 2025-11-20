"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Search, MapPin, Calendar, Users } from "lucide-react"
import { eventApi } from "@/lib/api";
import { Event } from "@/types/event";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventApi.searchEvents({
          search: searchTerm || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
        });

        if (response.success) {
          setEvents(response.data);
        } else {
          console.error('Failed to fetch events:', response.message);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Format the date to Vietnamese format (DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Get number of registrations for an event
  const getVolunteerCount = (event: Event) => {
    return event.currentParticipants || 0;
  };

  const filteredEvents = events; // All filtering is now done on the backend

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-8">Danh sách sự kiện</h1>

          {/* Search and Filters */}
          <div className="card-base p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-base"
              >
                <option value="all">Tất cả danh mục</option>
                <option value="environment">Môi trường</option>
                <option value="education">Giáo dục</option>
                <option value="health">Y tế</option>
                <option value="community">Cộng đồng</option>
              </select>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="input-base">
                <option value="all">Tất cả trạng thái</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="PENDING_APPROVAL">Chờ duyệt</option>
                <option value="DRAFT">Bản nháp</option>
                <option value="REJECTED">Từ chối</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Hủy bỏ</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted text-lg">Đang tải sự kiện...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="card-base overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <img
                      src={event.thumbnailUrl || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-3">{event.title}</h3>
                      <div className="space-y-2 text-sm text-muted mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          {formatDate(event.startDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          {getVolunteerCount(event)} tình nguyện viên
                        </div>
                      </div>
                      <button className="w-full btn-primary text-sm">Xem chi tiết</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted text-lg">Không tìm thấy sự kiện nào</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
