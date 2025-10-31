"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Search, Trash2, Mail } from "lucide-react"

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "a@test.com",
      role: "volunteer",
      joinedDate: "01/10/2024",
      events: 5,
      status: "active",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "b@test.com",
      role: "manager",
      joinedDate: "15/09/2024",
      events: 8,
      status: "active",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "c@test.com",
      role: "volunteer",
      joinedDate: "20/10/2024",
      events: 2,
      status: "active",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "d@test.com",
      role: "volunteer",
      joinedDate: "05/11/2024",
      events: 0,
      status: "inactive",
    },
  ])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const handleDeleteUser = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      setUsers(users.filter((u) => u.id !== id))
    }
  }

  const stats = [
    { label: "Tổng người dùng", value: users.length },
    { label: "Tình nguyện viên", value: users.filter((u) => u.role === "volunteer").length },
    { label: "Người tổ chức", value: users.filter((u) => u.role === "manager").length },
    { label: "Hoạt động", value: users.filter((u) => u.status === "active").length },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-8">Quản lý người dùng</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="card-base p-4">
                <p className="text-muted text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="card-base p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-muted" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-base pl-10"
                  />
                </div>
              </div>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="input-base">
                <option value="all">Tất cả vai trò</option>
                <option value="volunteer">Tình nguyện viên</option>
                <option value="manager">Người tổ chức</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-100 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Người dùng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Vai trò</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Ngày tham gia</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Sự kiện</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-muted flex items-center gap-1">
                              <Mail size={14} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            user.role === "manager" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {user.role === "manager" ? "Người tổ chức" : "Tình nguyện viên"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.joinedDate}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{user.events}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            user.status === "active" ? "bg-green-100 text-success" : "bg-gray-100 text-muted"
                          }`}
                        >
                          {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-error" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted text-lg">Không tìm thấy người dùng nào</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
