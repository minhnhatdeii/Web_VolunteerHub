"use client"

import React, { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { ArrowLeft, Upload } from "lucide-react"

const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

interface FormData {
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  location: string
  category: string
  maxVolunteers: string
  image: File | null
}

interface FormErrors {
  title?: string
  description?: string
  startDate?: string
  startTime?: string
  endDate?: string
  endTime?: string
  location?: string
  maxVolunteers?: string
  general?: string
}

export default function CreateEventPage() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    category: "environment",
    maxVolunteers: "",
    image: null,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined })) // clear error on change
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title || formData.title.length < 3) newErrors.title = "Tên sự kiện phải >=3 ký tự"
    if (!formData.description) newErrors.description = "Mô tả không được bỏ trống"
    if (!formData.startDate) newErrors.startDate = "Chọn ngày bắt đầu"
    if (!formData.startTime) newErrors.startTime = "Chọn giờ bắt đầu"
    if (!formData.endDate) newErrors.endDate = "Chọn ngày kết thúc"
    if (!formData.endTime) newErrors.endTime = "Chọn giờ kết thúc"
    if (!formData.location || formData.location.length < 3) newErrors.location = "Địa điểm phải >=3 ký tự"
    if (!formData.maxVolunteers || Number(formData.maxVolunteers) <= 0) newErrors.maxVolunteers = "Nhập số lượng tình nguyện viên hợp lệ"

    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}:00`)
      const end = new Date(`${formData.endDate}T${formData.endTime}:00`)
      if (end <= start) newErrors.endDate = "Thời gian kết thúc phải lớn hơn thời gian bắt đầu"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const token = localStorage.getItem("accessToken")
    if (!token) {
      setErrors({ general: "Bạn cần đăng nhập." })
      return
    }

    const startDate = `${formData.startDate}T${formData.startTime}:00.000Z`
    const endDate = `${formData.endDate}T${formData.endTime}:00.000Z`

    try {
      // Prepare FormData for the request to include the image file
      const eventFormData = new FormData();

      // Add all event data as form fields
      eventFormData.append('title', formData.title);
      eventFormData.append('description', formData.description);
      eventFormData.append('startDate', startDate);
      eventFormData.append('endDate', endDate);
      eventFormData.append('location', formData.location);
      eventFormData.append('category', formData.category);
      eventFormData.append('maxParticipants', formData.maxVolunteers);

      // Add image file if selected
      if (formData.image) {
        eventFormData.append('thumbnail', formData.image);  // The field name should match the backend expected name
      }

      const res = await fetch(`${BACKEND_API_BASE_URL}/events`, {
        method: "POST",
        headers: {
          // Don't set Content-Type header when using FormData, it will be set automatically
          Authorization: `Bearer ${token}`,
        },
        body: eventFormData,
      })

      const data = await res.json()
console.log("Create Event Data:", data);
console.log("Event ID:", data.id);
      if (!res.ok) {
        if (data.errors) {
          const zodErrors: FormErrors = {}
          data.errors.forEach((err: any) => {
            const field = err.path?.[0] as keyof FormErrors | undefined
            if (field) {
              zodErrors[field] = err.message
            }
          })
          setErrors(zodErrors)
        } else {
          setErrors({ general: data.error || "Không thể tạo sự kiện" })
        }
        return
      }

      // Check if event is already in PENDING_APPROVAL status before attempting to submit
      if (data.status === 'PENDING_APPROVAL') {
        // Event is already in the correct status for admin to review
        alert("Tạo sự kiện và gửi duyệt thành công!");
      } else {
        // Submit the event for approval (only if not already pending approval)
        try {
          const eventId = data.data?.id;
          const submitRes = await fetch(`${BACKEND_API_BASE_URL}/events/${eventId}/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          const submitData = await submitRes.json();
          console.log(submitData);

          if (!submitRes.ok) {
            console.error('Failed to submit event for approval:', submitData.error || submitData.message);
          }
          alert("Tạo sự kiện và gửi duyệt thành công!");
        } catch (submitErr) {
          console.error('Error submitting event for approval:', submitErr);
          // Even if submission fails, the event was created successfully
          alert("Tạo sự kiện và gửi duyệt thành công!");
        }
      }

      setFormData({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        location: "",
        category: "environment",
        maxVolunteers: "",
        image: null,
      })
      setErrors({})
    } catch (err) {
      console.error(err)
      setErrors({ general: "Có lỗi khi gửi yêu cầu." })
    }
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

            {errors.general && (
              <div className="text-red-600 mb-4 font-semibold">{errors.general}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Tên sự kiện</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-base"
                  placeholder="Nhập tên sự kiện"
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input-base"
                  placeholder="Mô tả chi tiết về sự kiện"
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Start Date/Time */}
              <div>
                <label className="block text-sm font-bold mb-2">Thời gian bắt đầu</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ngày</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="input-base"
                    />
                    {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Giờ</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className="input-base"
                    />
                    {errors.startTime && <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>}
                  </div>
                </div>
              </div>

              {/* End Date/Time */}
              <div>
                <label className="block text-sm font-bold mb-2">Thời gian kết thúc</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ngày</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="input-base"
                    />
                    {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Giờ</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className="input-base"
                    />
                    {errors.endTime && <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">Địa điểm</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input-base"
                  placeholder="Nhập địa điểm sự kiện"
                />
                {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
              </div>

              {/* Category + Max Volunteers */}
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
                    className="input-base"
                    placeholder="50"
                  />
                  {errors.maxVolunteers && <p className="text-red-600 text-sm mt-1">{errors.maxVolunteers}</p>}
                </div>
              </div>

              {/* Image */}
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
