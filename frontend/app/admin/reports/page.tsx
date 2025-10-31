"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Calendar, Users, TrendingUp, CheckCircle } from "lucide-react"

export default function AdminReportsPage() {
  const eventData = [
    { month: "Tháng 1", events: 5, volunteers: 45 },
    { month: "Tháng 2", events: 8, volunteers: 72 },
    { month: "Tháng 3", events: 6, volunteers: 58 },
    { month: "Tháng 4", events: 10, volunteers: 95 },
    { month: "Tháng 5", events: 12, volunteers: 120 },
    { month: "Tháng 6", events: 9, volunteers: 85 },
  ]

  const categoryData = [
    { name: "Môi trường", value: 35, color: "#10b981" },
    { name: "Giáo dục", value: 25, color: "#3b82f6" },
    { name: "Y tế", value: 20, color: "#ef4444" },
    { name: "Cộng đồng", value: 20, color: "#f59e0b" },
  ]

  const stats = [
    { label: "Tổng sự kiện", value: 50, icon: Calendar },
    { label: "Tổng tình nguyện viên", value: 1250, icon: Users },
    { label: "Tổng lượt đăng ký", value: 3420, icon: TrendingUp },
    { label: "Sự kiện đã duyệt", value: 42, icon: CheckCircle },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-8">Báo cáo và thống kê</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, idx) => {
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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Events and Volunteers Trend */}
            <div className="card-base p-8">
              <h2 className="text-xl font-bold mb-6">Xu hướng sự kiện và tình nguyện viên</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={eventData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="events" stroke="#2563eb" name="Sự kiện" />
                  <Line type="monotone" dataKey="volunteers" stroke="#10b981" name="Tình nguyện viên" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="card-base p-8">
              <h2 className="text-xl font-bold mb-6">Phân bố theo danh mục</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Events Chart */}
          <div className="card-base p-8">
            <h2 className="text-xl font-bold mb-6">Số lượng sự kiện theo tháng</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventData}>
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
