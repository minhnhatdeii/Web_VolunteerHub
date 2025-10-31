"use client"

import type React from "react"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: "Nguyễn Văn A",
    email: "volunteer@test.com",
    phone: "0123456789",
    bio: "Tôi yêu tình nguyện và muốn tạo nên sự thay đổi tích cực",
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    alert("Hồ sơ đã được cập nhật!")
    setIsEditing(false)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom max-w-2xl">
          <Link
            href="/dashboard/volunteer"
            className="inline-flex items-center text-primary hover:text-primary-dark mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay lại dashboard
          </Link>

          <div className="card-base p-8">
            <h1 className="text-3xl font-bold mb-8">Hồ sơ cá nhân</h1>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Họ tên</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input-base ${!isEditing && "bg-neutral-100 cursor-not-allowed"}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input-base ${!isEditing && "bg-neutral-100 cursor-not-allowed"}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`input-base ${!isEditing && "bg-neutral-100 cursor-not-allowed"}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tiểu sử</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  className={`input-base ${!isEditing && "bg-neutral-100 cursor-not-allowed"}`}
                />
              </div>

              <div className="flex gap-4 pt-4">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="btn-primary">
                    Chỉnh sửa
                  </button>
                ) : (
                  <>
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                      <Save size={20} />
                      Lưu thay đổi
                    </button>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary">
                      Hủy
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="text-2xl font-bold mb-6">Bảo mật</h2>
              <button className="btn-secondary">Đổi mật khẩu</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
