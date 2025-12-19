"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { AlertCircle } from "lucide-react"
import { Toaster, toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Store user data and tokens in localStorage or cookies
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("accessToken", data.accessToken)
        localStorage.setItem("refreshToken", data.refreshToken)
        window.location.href = `/dashboard/${data.user.role.toLowerCase()}`
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Đăng nhập thất bại. Vui lòng thử lại.")
      }
    } catch (error) {
      setError("Lỗi kết nối. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <Navbar />
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md card-base p-8">
          <h1 className="text-3xl font-bold mb-2">Đăng nhập</h1>
          <p className="text-muted mb-8">Đăng nhập vào tài khoản VolunteerHub của bạn</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-error flex-shrink-0" size={20} />
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p className="text-center text-muted mt-6">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-primary hover:text-primary-dark font-semibold">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}

