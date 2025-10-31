"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ArrowLeft, Send, Heart, MessageCircle } from "lucide-react"

export default function EventChannelPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      author: "Nguyễn Văn A",
      avatar: "NA",
      content: "Ai cũng sẵn sàng cho sự kiện này chưa? Tôi rất hào hứng!",
      timestamp: "10:30",
      likes: 5,
      replies: 2,
    },
    {
      id: 2,
      author: "Trần Thị B",
      avatar: "TB",
      content: "Mình cũng vậy! Có ai biết cần mang theo những gì không?",
      timestamp: "10:45",
      likes: 3,
      replies: 1,
    },
    {
      id: 3,
      author: "Lê Văn C",
      avatar: "LC",
      content: "Theo thông báo thì cần mang nước uống và đi giày thể thao. Mình sẽ mang thêm túi rác.",
      timestamp: "11:00",
      likes: 8,
      replies: 0,
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [likedMessages, setLikedMessages] = useState<number[]>([])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        author: "Bạn",
        avatar: "BN",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        likes: 0,
        replies: 0,
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  const handleLikeMessage = (id: number) => {
    if (likedMessages.includes(id)) {
      setLikedMessages(likedMessages.filter((mid) => mid !== id))
    } else {
      setLikedMessages([...likedMessages, id])
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom max-w-3xl">
          <Link
            href={`/events/${params.id}`}
            className="inline-flex items-center text-primary hover:text-primary-dark mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay lại sự kiện
          </Link>

          <div className="card-base overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-primary text-white p-6 border-b border-border">
              <h1 className="text-2xl font-bold">Kênh thảo luận sự kiện</h1>
              <p className="text-primary-light text-sm mt-1">Dọn dẹp công viên thành phố</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold flex-shrink-0">
                    {message.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{message.author}</p>
                      <p className="text-xs text-muted">{message.timestamp}</p>
                    </div>
                    <p className="text-foreground mb-2">{message.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <button
                        onClick={() => handleLikeMessage(message.id)}
                        className={`flex items-center gap-1 hover:text-primary transition-colors ${
                          likedMessages.includes(message.id) ? "text-error" : ""
                        }`}
                      >
                        <Heart size={14} className={likedMessages.includes(message.id) ? "fill-current" : ""} />
                        {message.likes + (likedMessages.includes(message.id) ? 1 : 0)}
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <MessageCircle size={14} />
                        {message.replies}
                      </button>
                    </div>
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
                  placeholder="Viết tin nhắn của bạn..."
                  className="input-base flex-1"
                />
                <button onClick={handleSendMessage} className="btn-primary flex items-center gap-2 px-4">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
