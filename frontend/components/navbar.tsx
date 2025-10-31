"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

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

          {/* Auth Buttons */}
          <div className="hidden md:flex gap-4">
            <Link href="/login" className="btn-secondary">
              Đăng nhập
            </Link>
            <Link href="/register" className="btn-primary">
              Đăng ký
            </Link>
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
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1 btn-secondary text-center">
                Đăng nhập
              </Link>
              <Link href="/register" className="flex-1 btn-primary text-center">
                Đăng ký
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
