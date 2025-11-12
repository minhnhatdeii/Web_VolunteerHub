"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Menu, X } from "lucide-react"

type AppUser = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role?: string
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [user, setUser] = useState<AppUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    try {
      const u = localStorage.getItem("user")
      const at = localStorage.getItem("accessToken")
      if (u) setUser(JSON.parse(u))
      if (at) setAccessToken(at)
    } catch (_) {
      // ignore
    } finally {
      setHydrated(true)
    }
  }, [])

  const isAuthenticated = !!user && !!accessToken

  const dashboardHref = useMemo(() => {
    const role = user?.role?.toLowerCase()
    if (!role) return "/dashboard/volunteer"
    if (["admin", "manager", "volunteer"].includes(role)) return `/dashboard/${role}`
    return "/dashboard/volunteer"
  }, [user])

  const displayName = useMemo(() => {
    if (!user) return ""
    const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
    return full || user.email || ""
  }, [user])

  const logout = () => {
    try {
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    } catch (_) {}
    setUser(null)
    setAccessToken(null)
    if (typeof window !== "undefined") window.location.href = "/"
  }

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-xl text-primary">
            VolunteerHub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link href="/events" className="text-foreground hover:text-primary transition-colors">
              Sự kiện
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
              Liên hệ
            </Link>
          </div>

          {/* Auth Area */}
          <div className="hidden md:flex gap-4 items-center">
            {!hydrated ? null : isAuthenticated ? (
              <>
                <Link href={dashboardHref} className="btn-secondary">
                  Dashboard
                </Link>
                <Link href="/profile" className="btn-secondary">
                  {displayName || "Tài khoản"}
                </Link>
                <button onClick={logout} className="btn-primary">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary">
                  Đăng nhập
                </Link>
                <Link href="/register" className="btn-primary">
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block py-2 text-foreground hover:text-primary">
              Trang chủ
            </Link>
            <Link href="/events" className="block py-2 text-foreground hover:text-primary">
              Sự kiện
            </Link>
            <Link href="/contact" className="block py-2 text-foreground hover:text-primary">
              Liên hệ
            </Link>
            {hydrated && (
              isAuthenticated ? (
                <div className="flex gap-2 pt-2">
                  <Link href={dashboardHref} className="flex-1 btn-secondary text-center">
                    Dashboard
                  </Link>
                  <button onClick={() => { setIsOpen(false); logout(); }} className="flex-1 btn-primary text-center">
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1 btn-secondary text-center">
                    Đăng nhập
                  </Link>
                  <Link href="/register" className="flex-1 btn-primary text-center">
                    Đăng ký
                  </Link>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

