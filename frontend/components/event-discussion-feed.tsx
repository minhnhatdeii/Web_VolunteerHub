"use client";

import { useEffect, useState } from "react";

type FeedItem = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
};

export default function EventDiscussionFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    // Placeholder: hook up to realtime posts/comments later
    setItems([
      { id: "1", author: "Huy", message: "Chào mọi người, hẹn gặp ở điểm tập trung nhé!", createdAt: "10:30" },
      { id: "2", author: "Lan", message: "Nhớ mang găng tay và nước uống nha.", createdAt: "10:45" },
    ]);
  }, []);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="p-3 rounded-lg bg-neutral-100">
          <div className="flex justify-between text-sm font-semibold">
            <span>{item.author}</span>
            <span className="text-muted">{item.createdAt}</span>
          </div>
          <p className="text-sm text-foreground mt-1">{item.message}</p>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-muted">Chưa có thảo luận nào.</p>}
    </div>
  );
}
