"use client"

import type React from "react"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { ArrowLeft, Upload } from "lucide-react"

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "environment",
    maxVolunteers: "",
    image: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Sự kiện đã được tạo và gửi duyệt!")
    // Reset form
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "environment",
      maxVolunteers: "",
      image: null,
    })
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom max-w-2xl">
          <Link
            href="/dashboard/manager"
            className="inline-flex items-center text-primary hover:text-primary-dark mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay lại dashboard
          </Link>

          <div className="card-base p-8">
            <h1 className="text-3xl font-bold mb-8">Tạo sự kiện mới</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tên sự kiện</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="input-base"
                  placeholder="Nhập tên sự kiện"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="input-base"
                  placeholder="Mô tả chi tiết về sự kiện"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Giờ</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Địa điểm</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="input-base"
                  placeholder="Nhập địa điểm sự kiện"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Danh mục</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="input-base">
                    <option value="environment">Môi trường</option>
                    <option value="education">Giáo dục</option>
                    <option value="health">Y tế</option>
                    <option value="community">Cộng đồng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số lượng tình nguyện viên</label>
                  <input
                    type="number"
                    name="maxVolunteers"
                    value={formData.maxVolunteers}
                    onChange={handleChange}
                    required
                    className="input-base"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hình ảnh</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-neutral-50 transition-colors cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="image-input" />
                  <label htmlFor="image-input" className="cursor-pointer">
                    <Upload className="mx-auto mb-2 text-muted" size={32} />
                    <p className="font-semibold">Tải lên hình ảnh</p>
                    <p className="text-sm text-muted">hoặc kéo thả hình ảnh vào đây</p>
                    {formData.image && <p className="text-sm text-success mt-2">{formData.image.name}</p>}
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary">
                  Tạo sự kiện
                </button>
                <Link href="/dashboard/manager" className="btn-secondary">
                  Hủy
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
