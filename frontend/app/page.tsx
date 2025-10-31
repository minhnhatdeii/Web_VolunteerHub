"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { ArrowRight, Heart, Users, Zap } from "lucide-react"

export default function Home() {
  const highlightedEvents = [
    {
      id: 1,
      title: "Dọn dẹp công viên thành phố",
      date: "15/11/2024",
      location: "Công viên Tao Đàn",
      volunteers: 24,
      image: "/park-cleanup-event.jpg",
    },
    {
      id: 2,
      title: "Dạy kèm cho trẻ em vùng sâu",
      date: "20/11/2024",
      location: "Trường tiểu học Sơn La",
      volunteers: 18,
      image: "/tutoring-event.jpg",
    },
    {
      id: 3,
      title: "Chương trình hiến máu tình nguyện",
      date: "25/11/2024",
      location: "Bệnh viện Bạch Mai",
      volunteers: 32,
      image: "/blood-donation-event.jpg",
    },
  ]

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
          <div className="container-custom">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold mb-6">Kết nối - Cống hiến - Lan tỏa</h1>
              <p className="text-xl mb-8 text-neutral-100">
                Tham gia cộng đồng tình nguyện viên và tạo nên sự thay đổi tích cực cho xã hội.
              </p>
              <Link
                href="/register"
                className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
              >
                Tham gia ngay
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-neutral-50">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-12 text-center">Tại sao chọn VolunteerHub?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card-base p-6">
                <Heart className="text-accent mb-4" size={32} />
                <h3 className="text-xl font-semibold mb-2">Tạo tác động</h3>
                <p className="text-muted">Tham gia các sự kiện tình nguyện có ý nghĩa và tạo nên sự khác biệt.</p>
              </div>
              <div className="card-base p-6">
                <Users className="text-accent mb-4" size={32} />
                <h3 className="text-xl font-semibold mb-2">Kết nối cộng đồng</h3>
                <p className="text-muted">Gặp gỡ những người có cùng đam mê và xây dựng mối quan hệ bền vững.</p>
              </div>
              <div className="card-base p-6">
                <Zap className="text-accent mb-4" size={32} />
                <h3 className="text-xl font-semibold mb-2">Phát triển kỹ năng</h3>
                <p className="text-muted">Nâng cao kỹ năng cá nhân thông qua các hoạt động tình nguyện đa dạng.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Highlighted Events */}
        <section className="py-16">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-12">Sự kiện nổi bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {highlightedEvents.map((event) => (
                <div key={event.id} className="card-base overflow-hidden hover:shadow-lg transition-shadow">
                  <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                    <p className="text-sm text-muted mb-4">
                      {event.date} • {event.location}
                    </p>
                    <p className="text-sm text-muted mb-4">{event.volunteers} tình nguyện viên đã đăng ký</p>
                    <Link
                      href={`/events/${event.id}`}
                      className="inline-flex items-center text-primary hover:text-primary-dark font-semibold"
                    >
                      Xem chi tiết <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/events" className="btn-primary">
                Xem tất cả sự kiện
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
