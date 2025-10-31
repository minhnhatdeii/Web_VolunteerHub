"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Send, Search, MessageCircle } from "lucide-react"

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(1)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "NA",
      lastMessage: "Cảm ơn bạn đã tham gia sự kiện!",
      timestamp: "10:30",
      unread: 2,
      messages: [
        { id: 1, sender: "Nguyễn Văn A", content: "Xin chào! Bạn khỏe không?", timestamp: "10:15" },
        { id: 2, sender: "Bạn", content: "Khỏe, cảm ơn bạn hỏi!", timestamp: "10:20" },
        { id: 3, sender: "Nguyễn Văn A", content: "Cảm ơn bạn đã tham gia sự kiện!", timestamp: "10:30" },
      ],
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "TB",
      lastMessage: "Bạn có thể giúp tôi không?",
      timestamp: "09:45",
      unread: 0,
      messages: [{ id: 1, sender: "Trần Thị B", content: "Bạn có thể giúp tôi không?", timestamp: "09:45" }],
    },
    {
      id: 3,
      name: "Lê Văn C",
      avatar: "LC",
      lastMessage: "Hẹn gặp bạn vào ngày mai!",
      timestamp: "08:20",
      unread: 0,
      messages: [{ id: 1, sender: "Lê Văn C", content: "Hẹn gặp bạn vào ngày mai!", timestamp: "08:20" }],
    },
  ])

  const currentConversation = conversations.find((c) => c.id === selectedConversation)
  const filteredConversations = conversations.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSendMessage = () => {
    if (newMessage.trim() && currentConversation) {
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === selectedConversation) {
          return {
            ...conv,
            messages: [
              ...conv.messages,
              {
                id: conv.messages.length + 1,
                sender: "Bạn",
                content: newMessage,
                timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
              },
            ],
            lastMessage: newMessage,
            timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          }
        }
        return conv
      })
      setConversations(updatedConversations)
      setNewMessage("")
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-8">Tin nhắn</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className="card-base overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-muted" size={18} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-base pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full text-left p-4 border-b border-border hover:bg-neutral-50 transition-colors ${
                      selectedConversation === conversation.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold flex-shrink-0">
                        {conversation.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{conversation.name}</p>
                        <p className="text-xs text-muted truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unread > 0 && (
                        <div className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {conversation.unread}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            {currentConversation ? (
              <div className="lg:col-span-2 card-base overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-primary text-white p-4 border-b border-border">
                  <h2 className="font-semibold">{currentConversation.name}</h2>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "Bạn" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.sender === "Bạn" ? "bg-primary text-white" : "bg-neutral-200 text-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="border-t border-border p-4 bg-neutral-50">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Viết tin nhắn..."
                      className="input-base flex-1"
                    />
                    <button onClick={handleSendMessage} className="btn-primary flex items-center gap-2 px-4">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 card-base flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle size={48} className="mx-auto text-muted mb-4" />
                  <p className="text-muted">Chọn một cuộc trò chuyện để bắt đầu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
