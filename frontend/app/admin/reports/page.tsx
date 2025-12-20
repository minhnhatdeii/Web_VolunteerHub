"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Calendar, Users, TrendingUp, CheckCircle, Download, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

interface DashboardStats {
  totalUsers: number
  totalEvents: number
  totalRegistrations: number
  pendingApprovals: number
  approvedEvents: number
  activeRegistrations: number
}

interface MonthlyData {
  month: number
  monthName: string
  count: number
}

interface EventsByMonthResponse {
  year: number
  data: MonthlyData[]
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [exportingEvents, setExportingEvents] = useState(false)
  const [exportingRegistrations, setExportingRegistrations] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("accessToken")

      if (!token) {
        toast.error("Bạn cần đăng nhập để xem trang này")
        return
      }

      // Fetch dashboard stats
      const statsResponse = await fetch("http://localhost:5000/api/admin/reports/dashboard-stats", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!statsResponse.ok) {
        throw new Error("Failed to fetch dashboard stats")
      }

      const statsData = await statsResponse.json()
      setStats(statsData)

      // Fetch monthly events data
      const currentYear = new Date().getFullYear()
      const monthlyResponse = await fetch(
        `http://localhost:5000/api/admin/reports/events-by-month?year=${currentYear}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      )

      if (!monthlyResponse.ok) {
        throw new Error("Failed to fetch monthly data")
      }

      const monthlyResultData: EventsByMonthResponse = await monthlyResponse.json()
      setMonthlyData(monthlyResultData.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Không thể tải dữ liệu báo cáo")
    } finally {
      setLoading(false)
    }
  }

  const handleExportEvents = async () => {
    try {
      setExportingEvents(true)
      const token = localStorage.getItem("accessToken")

      if (!token) {
        toast.error("Bạn cần đăng nhập để xuất dữ liệu")
        return
      }

      const response = await fetch("http://localhost:5000/api/admin/export/events.csv", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to export events")
      }

      // Create a blob from the response
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `events-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Đã xuất danh sách sự kiện thành công!")
    } catch (error) {
      console.error("Error exporting events:", error)
      toast.error("Không thể xuất danh sách sự kiện")
    } finally {
      setExportingEvents(false)
    }
  }

  const handleExportRegistrations = async () => {
    try {
      setExportingRegistrations(true)
      const token = localStorage.getItem("accessToken")

      if (!token) {
        toast.error("Bạn cần đăng nhập để xuất dữ liệu")
        return
      }

      const response = await fetch("http://localhost:5000/api/admin/export/registrations.csv", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to export registrations")
      }

      // Create a blob from the response
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Đã xuất danh sách đăng ký thành công!")
    } catch (error) {
      console.error("Error exporting registrations:", error)
      toast.error("Không thể xuất danh sách đăng ký")
    } finally {
      setExportingRegistrations(false)
    }
  }

  // Transform monthly data for chart
  const chartData = monthlyData.map(item => ({
    month: item.monthName.substring(0, 3), // Shorten month names
    events: item.count,
  }))

  const statsCards = stats ? [
    { label: "Tổng người dùng", value: stats.totalUsers, icon: Users },
    { label: "Tổng sự kiện", value: stats.totalEvents, icon: Calendar },
    { label: "Tổng lượt đăng ký", value: stats.totalRegistrations, icon: TrendingUp },
    { label: "Sự kiện đã duyệt", value: stats.approvedEvents, icon: CheckCircle },
  ] : []

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-50 py-12">
          <div className="container-custom">
            <h1 className="text-4xl font-bold mb-8">Báo cáo và thống kê</h1>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted">Đang tải dữ liệu...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Báo cáo và thống kê</h1>

            {/* Export Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleExportEvents}
                disabled={exportingEvents}
                className="btn-primary flex items-center gap-2"
              >
                <FileSpreadsheet size={18} />
                {exportingEvents ? "Đang xuất..." : "Xuất sự kiện"}
              </button>
              <button
                onClick={handleExportRegistrations}
                disabled={exportingRegistrations}
                className="btn-secondary flex items-center gap-2"
              >
                <Download size={18} />
                {exportingRegistrations ? "Đang xuất..." : "Xuất đăng ký"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {statsCards.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="card-base p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted text-sm mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-primary">{stat.value}</p>
                    </div>
                    <Icon className="text-accent" size={40} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Additional Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="card-base p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted text-sm mb-2">Sự kiện chờ duyệt</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.pendingApprovals}</p>
                  </div>
                  <Calendar className="text-orange-600" size={40} />
                </div>
              </div>
              <div className="card-base p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted text-sm mb-2">Đăng ký đang hoạt động</p>
                    <p className="text-3xl font-bold text-green-600">{stats.activeRegistrations}</p>
                  </div>
                  <TrendingUp className="text-green-600" size={40} />
                </div>
              </div>
            </div>
          )}

          {/* Monthly Events Chart */}
          <div className="card-base p-8">
            <h2 className="text-xl font-bold mb-6">Số lượng sự kiện theo tháng ({new Date().getFullYear()})</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="events" fill="#2563eb" name="Sự kiện" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
