"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Send, ImageIcon } from "lucide-react";
import { postApi } from "@/lib/api";
import { Toaster, toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];

type Post = {
  id: string;
  author: { name: string; avatar: string; role?: string };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
};

type Comment = {
  id: string;
  author: { name: string; avatar: string };
  content: string;
  image?: string;
  timestamp: string;
};

type Props = { eventId: string };

export default function EventDiscussionFeed({ eventId }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeComments, setActiveComments] = useState<{ [key: string]: string }>({});
  const [activeCommentFiles, setActiveCommentFiles] = useState<{ [key: string]: File | null }>({});
  const [activeCommentPreviews, setActiveCommentPreviews] = useState<{ [key: string]: string | null }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [userName, setUserName] = useState<string>("Ban");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const commentFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");
      if (storedToken) setAccessToken(storedToken);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const full = [parsed.firstName, parsed.lastName].filter(Boolean).join(" ").trim() || parsed.name || parsed.email;
        if (full) setUserName(full);
        if (parsed.avatarUrl) setUserAvatar(parsed.avatarUrl);
      }
    } catch (_) {
      // ignore
    }
  }, []);

  const mapPosts = (items: any[]): Post[] =>
    items.map((p) => ({
      id: p.id,
      author: {
        name: [p.author?.firstName, p.author?.lastName].filter(Boolean).join(" ").trim() || p.author?.name || "An danh",
        avatar: p.author?.avatarUrl || "/placeholder.svg",
        role: p.author?.role || "",
      },
      content: p.content || "",
      image: p.imageUrl || undefined,
      timestamp: new Date(p.createdAt || Date.now()).toLocaleString("vi-VN"),
      likes: p._count?.likes ?? p.likes ?? 0,
      comments:
        (p.comments || []).map((c: any) => ({
          id: c.id,
          author: {
            name: [c.author?.firstName, c.author?.lastName].filter(Boolean).join(" ").trim() || "An danh",
            avatar: c.author?.avatarUrl || "/placeholder.svg",
          },
          content: c.content || "",
          image: c.imageUrl || undefined,
          timestamp: new Date(c.createdAt || Date.now()).toLocaleString("vi-VN"),
        })) || [],
      isLiked: false,
    }));

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await postApi.getEventPosts(eventId, { limit: 50 });
      const items = (res?.data?.items || res?.data?.data || res?.data || []) as any[];
      setPosts(mapPosts(items));
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) loadPosts();
  }, [eventId]);

  const handleLike = async (postId: string) => {
    if (!accessToken) {
      toast.error("Vui lòng đăng nhập để thích bài viết.");
      return;
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post,
      ),
    );
    try {
      await postApi.toggleLike(postId, accessToken);
    } catch (err) {
      console.error("Toggle like failed", err);
    }
  };

  const handleAddPost = async () => {
    if (!newPost.trim() && !selectedFile) return;
    if (!accessToken) {
      toast.error("Vui long dang nhap de dang bai.");
      return;
    }
    try {
      const res = await postApi.createPost(eventId, { content: newPost, file: selectedFile }, accessToken);
      const p: any = res?.data || {};
      const mapped = mapPosts([p])[0] || {
        id: Date.now().toString(),
        author: { name: userName, avatar: userAvatar || "/placeholder.svg" },
        content: newPost,
        timestamp: new Date().toLocaleString("vi-VN"),
        likes: 0,
        comments: [],
        isLiked: false,
      };
      setPosts((prev) => [mapped, ...prev]);
      setNewPost("");
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success("Đăng bài thành công!");
    } catch (err) {
      console.error("Failed to create post", err);
      toast.error("Đăng bài thất bại, vui lòng thử lại.");
    }
  };

  const handleSelectFile = (file?: File | null) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Chỉ hỗ trợ ảnh JPG hoặc PNG.");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAddComment = async (postId: string) => {
    const commentContent = activeComments[postId];
    if (!commentContent?.trim()) return;
    if (!accessToken) {
      toast.error("Vui lòng đăng nhập để bình luận.");
      return;
    }
    try {
      const res = await postApi.addComment(postId, { content: commentContent, file: activeCommentFiles[postId] }, accessToken);
      const c: any = res?.data || {};
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: c.id || Date.now().toString(),
                  author: {
                    name:
                      [c.author?.firstName, c.author?.lastName].filter(Boolean).join(" ").trim() ||
                      c.author?.name ||
                      userName,
                    avatar: c.author?.avatarUrl || "/placeholder.svg",
                  },
                  content: c.content || commentContent,
                  image: c.imageUrl || undefined,
                  timestamp: new Date(c.createdAt || Date.now()).toLocaleString("vi-VN"),
                },
              ],
            };
          }
          return post;
        }),
      );
      setActiveComments({ ...activeComments, [postId]: "" });
      setActiveCommentFiles({ ...activeCommentFiles, [postId]: null });
      setActiveCommentPreviews({ ...activeCommentPreviews, [postId]: null });
      toast.success("Đã gửi bình luận");
    } catch (err) {
      console.error("Add comment failed", err);
      toast.error("Bình luận thất bại, vui lòng thử lại.");
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />
      <Card className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatar || "/placeholder.svg"} alt="Your avatar" />
            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Chia sẻ suy nghĩ của bạn về sự kiện này..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            {previewUrl && (
              <div className="rounded-lg overflow-hidden border">
                <img src={previewUrl} alt="Ảnh đính kèm" className="w-full max-h-64 object-cover" />
                <div className="flex justify-between items-center px-3 py-2 text-sm bg-muted">
                  <span className="truncate">{selectedFile?.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Xoa anh
                  </Button>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => handleSelectFile(e.target.files?.[0])}
                />
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Thêm ảnh
                </Button>
              </div>
              <Button onClick={handleAddPost} disabled={!newPost.trim() && !selectedFile}>
                <Send className="h-4 w-4 mr-2" />
                Đăng bài
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {loading && <p className="text-muted text-sm">Dang tai thao luan...</p>}

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{post.author.name}</p>
                  {post.author.role === "Organizer" && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">To chuc</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{post.timestamp}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-base leading-relaxed mb-3">{post.content}</p>
              {post.image && (
                <img src={post.image || "/placeholder.svg"} alt="Post image" className="w-full rounded-lg object-cover max-h-96" />
              )}
            </div>

            <div className="flex items-center gap-6 pt-4 border-t">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 text-sm transition-colors ${post.isLiked ? "text-red-500 font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Heart className={`h-5 w-5 ${post.isLiked ? "fill-current" : ""}`} />
                <span>{post.likes > 0 ? post.likes : "Thich"}</span>
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments.length > 0 ? post.comments.length : "Binh luan"}</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="h-5 w-5" />
                <span>Chia se</span>
              </button>
            </div>

            {showComments[post.id] && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar || undefined} alt={comment.author.name} />
                      <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="font-semibold text-sm">{comment.author.name}</p>
                        {comment.content && <p className="text-sm leading-relaxed">{comment.content}</p>}
                        {comment.image && (
                          <img src={comment.image} alt="Comment image" className="mt-2 rounded-lg max-h-48 object-cover" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-3">{comment.timestamp}</p>
                    </div>
                  </div>
                ))}

                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatar || "/placeholder.svg"} alt="Your avatar" />
                    <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    {activeCommentPreviews[post.id] && (
                      <div className="relative inline-block">
                        <img src={activeCommentPreviews[post.id]!} alt="Preview" className="rounded-lg max-h-32 object-cover" />
                        <button
                          onClick={() => {
                            setActiveCommentFiles({ ...activeCommentFiles, [post.id]: null });
                            setActiveCommentPreviews({ ...activeCommentPreviews, [post.id]: null });
                            if (commentFileInputRefs.current[post.id]) commentFileInputRefs.current[post.id]!.value = "";
                          }}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 text-xs hover:bg-black/70"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => { commentFileInputRefs.current[post.id] = el; }}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setActiveCommentFiles({ ...activeCommentFiles, [post.id]: file });
                            setActiveCommentPreviews({ ...activeCommentPreviews, [post.id]: URL.createObjectURL(file) });
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                        onClick={() => commentFileInputRefs.current[post.id]?.click()}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <input
                        type="text"
                        placeholder="Viet binh luan..."
                        value={activeComments[post.id] || ""}
                        onChange={(e) => setActiveComments({ ...activeComments, [post.id]: e.target.value })}
                        onKeyPress={(e) => e.key === "Enter" && handleAddComment(post.id)}
                        className="flex-1 px-4 py-2 text-sm bg-muted rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!activeComments[post.id]?.trim() && !activeCommentFiles[post.id]}
                        className="rounded-full"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
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
