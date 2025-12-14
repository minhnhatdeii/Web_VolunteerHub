import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { WebPushManagerWrapper } from '@/components/WebPushManagerWrapper'

// Register service worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope)
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
  })
}

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VolunteerHub - Kết nối - Cống hiến - Lan tỏa",
  description: "Nền tảng quản lý tình nguyện viên toàn diện",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={`${geistSans.className} bg-background text-foreground`}>
        <WebPushManagerWrapper>
          {children}
        </WebPushManagerWrapper>
      </body>
    </html>
  )
}
