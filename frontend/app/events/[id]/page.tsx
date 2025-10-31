"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Calendar, MapPin, Users, ArrowLeft, Heart } from "lucide-react"

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Mock event data
  const event = {
    id: params.id,
    title: "Dọn dẹp công viên thành phố",
    date: "15/11/2024",
    time: "08:00 - 12:00",
    location: "Công viên Tao Đàn, Hà Nội",
    category: "Môi trường",
    organizer: "Tổ chức Xanh Việt",
    volunteers: 24,
    maxVolunteers: 50,
    description:
      "Chúng tôi tổ chức một sự kiện dọn dẹp công viên để bảo vệ môi trường và tạo không gian xanh sạch cho cộng đồng. Tham gia cùng chúng tôi để tạo nên sự thay đổi tích cực!",
    image: "/park-cleanup-event.jpg",
    requirements: ["Mặc quần áo thoải mái", "Mang theo nước uống", "Đi giày thể thao", "Có tinh thần hợp tác"],
  }

  const handleRegister = () => {
    if (!isRegistered) {
      setIsRegistered(true)
      alert("Đăng ký tham gia thành công!")
    } else {
      setIsRegistered(false)
      alert("Hủy đăng ký thành công!")
    }
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
                src={event.image || "/placeholder.svg"}
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
                    <p className="text-sm text-muted">Người tổ chức</p>
                    <p className="font-semibold">{event.organizer}</p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-4">Mô tả</h2>
                <p className="text-foreground mb-8 leading-relaxed">{event.description}</p>

                <h2 className="text-2xl font-bold mb-4">Yêu cầu</h2>
                <ul className="space-y-2">
                  {event.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      {req}
                    </li>
                  ))}
                </ul>
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
                      style={{ width: `${(event.volunteers / event.maxVolunteers) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted mt-2">
                    {event.volunteers}/{event.maxVolunteers} chỗ
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
