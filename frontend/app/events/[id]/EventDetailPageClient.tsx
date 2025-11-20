"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Calendar, MapPin, Users, ArrowLeft, Heart } from "lucide-react"
import { eventApi } from "@/lib/api";
import { Event } from "@/types/event";

export default function EventDetailPageClient({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventId = params.id;
        console.log('Attempting to fetch event with ID:', eventId);

        // Validate that eventId exists before making the API call
        if (!eventId) {
          console.error('Event ID is undefined or empty');
          setLoading(false);
          return;
        }

        const response = await eventApi.getEventById(eventId);
        console.log('API response:', response);

        if (response.success) {
          setEvent(response.data);
        } else {
          console.error('Failed to fetch event:', response.message);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false); // Always set loading to false in the finally block
      }
    };

    fetchEvent();
  }, [params.id]);

  // Format the date to Vietnamese format (DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Format the time range
  const formatTime = (startDateString: string, endDateString: string) => {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    const startHours = startDate.getHours().toString().padStart(2, '0');
    const startMinutes = startDate.getMinutes().toString().padStart(2, '0');
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');

    return `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
  };

  const handleRegister = () => {
    if (!isRegistered) {
      setIsRegistered(true);
      alert("Đăng ký tham gia thành công!");
    } else {
      setIsRegistered(false);
      alert("Hủy đăng ký thành công!");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-50 py-12">
          <div className="container-custom">
            <p className="text-muted text-lg">Đang tải sự kiện...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-50 py-12">
          <div className="container-custom">
            <p className="text-error text-lg">Sự kiện không tồn tại</p>
            <Link href="/events" className="inline-flex items-center text-primary hover:text-primary-dark">
              <ArrowLeft size={20} className="mr-2" />
              Quay lại danh sách sự kiện
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <Link href="/events" className="inline-flex items-center text-primary hover:text-primary-dark mb-8">
            <ArrowLeft size={20} className="mr-2" />
            Quay lại danh sách
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <img
                src={event.thumbnailUrl || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-96 object-cover rounded-lg mb-8"
              />

              <div className="card-base p-8 mb-8">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-4xl font-bold">{event.title}</h1>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Heart size={24} className={isFavorite ? "fill-error text-error" : "text-muted"} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-primary" size={20} />
                    <div>
                      <p className="text-sm text-muted">Ngày giờ</p>
                      <p className="font-semibold">
                        {formatDate(event.startDate)} {formatTime(event.startDate, event.endDate)}
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
                        {event.currentParticipants}/{event.maxParticipants}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Người tổ chức</p>
                    <p className="font-semibold">{event.creator?.firstName || 'Unknown'} {event.creator?.lastName || ''}</p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-4">Mô tả</h2>
                <p className="text-foreground mb-8 leading-relaxed">{event.description}</p>

                {event.requirements && Array.isArray(event.requirements) && event.requirements.length > 0 && (
                  <>
                    <h2 className="text-2xl font-bold mb-4">Yêu cầu</h2>
                    <ul className="space-y-2">
                      {event.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="card-base p-8 sticky top-20">
                <div className="mb-6">
                  <p className="text-sm text-muted mb-2">Tiến độ đăng ký</p>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${event.maxParticipants ? (event.currentParticipants / event.maxParticipants) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted mt-2">
                    {event.currentParticipants}/{event.maxParticipants} chỗ
                  </p>
                </div>

                <button
                  onClick={handleRegister}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors mb-4 ${
                    isRegistered ? "bg-neutral-200 text-foreground hover:bg-neutral-300" : "btn-primary"
                  }`}
                >
                  {isRegistered ? "Hủy đăng ký" : "Đăng ký tham gia"}
                </button>

                {isRegistered && (
                  <Link href="/dashboard/volunteer" className="block text-center py-2 btn-secondary">
                    Xem dashboard
                  </Link>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted mb-3">Chia sẻ sự kiện này</p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors">
                      Facebook
                    </button>
                    <button className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors">
                      Twitter
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