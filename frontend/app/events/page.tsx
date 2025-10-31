"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Search, MapPin, Calendar, Users } from "lucide-react"

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const events = [
    {
      id: 1,
      title: "Dọn dẹp công viên thành phố",
      date: "15/11/2024",
      location: "Công viên Tao Đàn, Hà Nội",
      category: "environment",
      status: "approved",
      volunteers: 24,
      image: "/park-cleanup.jpg",
    },
    {
      id: 2,
      title: "Dạy kèm cho trẻ em vùng sâu",
      date: "20/11/2024",
      location: "Trường tiểu học Sơn La",
      category: "education",
      status: "approved",
      volunteers: 18,
      image: "/tutoring-session.png",
    },
    {
      id: 3,
      title: "Chương trình hiến máu tình nguyện",
      date: "25/11/2024",
      location: "Bệnh viện Bạch Mai",
      category: "health",
      status: "approved",
      volunteers: 32,
      image: "/blood-donation.jpg",
    },
    {
      id: 4,
      title: "Xây dựng nhà cho gia đình khó khăn",
      date: "01/12/2024",
      location: "Huyện Mù Cang Chải",
      category: "community",
      status: "approved",
      volunteers: 15,
      image: "/house-building.jpg",
    },
  ]

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

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
                <option value="approved">Đã duyệt</option>
                <option value="pending">Chờ duyệt</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="card-base overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-3">{event.title}</h3>
                    <div className="space-y-2 text-sm text-muted mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        {event.volunteers} tình nguyện viên
                      </div>
                    </div>
                    <button className="w-full btn-primary text-sm">Xem chi tiết</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredEvents.length === 0 && (
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
