"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Send, ImageIcon } from "lucide-react";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

export default function EventDiscussionFeed() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: {
        name: "Nguyễn Văn A",
        avatar: "/placeholder.svg",
        role: "Organizer",
      },
      content:
        "Chào mừng mọi người đến với sự kiện! Hãy cùng trao đổi và chia sẻ ý tưởng về việc làm sạch công viên. Ai có kinh nghiệm về phân loại rác thải thì chia sẻ nhé! 🌱",
      timestamp: "2 giờ trước",
      likes: 12,
      comments: [
        {
          id: "c1",
          author: {
            name: "Trần Thị B",
            avatar: "/placeholder.svg",
          },
          content: "Mình đã tham gia sự kiện tương tự rồi, có kinh nghiệm về phân loại nhựa và giấy!",
          timestamp: "1 giờ trước",
        },
      ],
      isLiked: false,
    },
    {
      id: "2",
      author: {
        name: "Lê Văn C",
        avatar: "/placeholder.svg",
        role: "Volunteer",
      },
      content: "Có ai ở quận 1 muốn đi cùng không? Mình có thể đón mọi người trên đường đi!",
      timestamp: "5 giờ trước",
      likes: 8,
      comments: [],
      isLiked: true,
    },
    {
      id: "3",
      author: {
        name: "Phạm Thị D",
        avatar: "/placeholder.svg",
        role: "Volunteer",
      },
      content: "Mình sẽ mang theo găng tay và túi rác dự phòng. Ai cần thì nhắn mình nhé!",
      image: "/placeholder.svg",
      timestamp: "1 ngày trước",
      likes: 15,
      comments: [
        {
          id: "c2",
          author: {
            name: "Hoàng Văn E",
            avatar: "/placeholder.svg",
          },
          content: "Cảm ơn bạn! Mình sẽ liên hệ với bạn trước sự kiện nhé!",
          timestamp: "20 giờ trước",
        },
        {
          id: "c3",
          author: {
            name: "Nguyễn Thị F",
            avatar: "/placeholder.svg",
          },
          content: "Mình cũng cần mượn găng tay được không bạn?",
          timestamp: "18 giờ trước",
        },
      ],
      isLiked: false,
    },
  ]);

  const [newPost, setNewPost] = useState("");
  const [activeComments, setActiveComments] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleAddPost = () => {
    if (newPost.trim()) {
      const post: Post = {
        id: Date.now().toString(),
        author: {
          name: "Bạn",
          avatar: "/placeholder.svg",
          role: "Volunteer",
        },
        content: newPost,
        timestamp: "Vừa xong",
        likes: 0,
        comments: [],
        isLiked: false,
      };
      setPosts((prev) => [post, ...prev]);
      setNewPost("");
    }
  };

  const handleAddComment = (postId: string) => {
    const commentContent = activeComments[postId];
    if (commentContent?.trim()) {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: Date.now().toString(),
                  author: {
                    name: "Bạn",
                    avatar: "/placeholder.svg",
                  },
                  content: commentContent,
                  timestamp: "Vừa xong",
                },
              ],
            };
          }
          return post;
        })
      );
      setActiveComments({ ...activeComments, [postId]: "" });
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <Card className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" alt="Your avatar" />
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Chia sẻ suy nghĩ của bạn về sự kiện này..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ImageIcon className="h-4 w-4 mr-2" />
                Thêm ảnh
              </Button>
              <Button onClick={handleAddPost} disabled={!newPost.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Đăng bài
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-6">
            {/* Post Header */}
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{post.author.name}</p>
                  {post.author.role === "Organizer" && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Tổ chức
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{post.timestamp}</p>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-base leading-relaxed mb-3">{post.content}</p>
              {post.image && (
                <img
                  src={post.image || "/placeholder.svg"}
                  alt="Post image"
                  className="w-full rounded-lg object-cover max-h-96"
                />
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-6 pt-4 border-t">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  post.isLiked ? "text-red-500 font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className={`h-5 w-5 ${post.isLiked ? "fill-current" : ""}`} />
                <span>{post.likes > 0 ? post.likes : "Thích"}</span>
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments.length > 0 ? post.comments.length : "Bình luận"}</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="h-5 w-5" />
                <span>Chia sẻ</span>
              </button>
            </div>

            {/* Comments Section */}
            {showComments[post.id] && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                      <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="font-semibold text-sm">{comment.author.name}</p>
                        <p className="text-sm leading-relaxed">{comment.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-3">{comment.timestamp}</p>
                    </div>
                  </div>
                ))}

                {/* Add Comment */}
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt="Your avatar" />
                    <AvatarFallback>B</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Viết bình luận..."
                      value={activeComments[post.id] || ""}
                      onChange={(e) => setActiveComments({ ...activeComments, [post.id]: e.target.value })}
                      onKeyPress={(e) => e.key === "Enter" && handleAddComment(post.id)}
                      className="flex-1 px-4 py-2 text-sm bg-muted rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(post.id)}
                      disabled={!activeComments[post.id]?.trim()}
                      className="rounded-full"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
