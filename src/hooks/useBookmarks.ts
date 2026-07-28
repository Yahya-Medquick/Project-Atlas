import { useState, useEffect } from "react";
import { BookmarkItem, CategoryType } from "../types";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("atlas_bookmarks");
        return saved ? JSON.parse(saved) : [];
      } catch (err) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("atlas_bookmarks", JSON.stringify(bookmarks));
    } catch (err) {
      console.warn("Failed to persist bookmarks:", err);
    }
  }, [bookmarks]);

  const addBookmark = (item: Omit<BookmarkItem, "id" | "savedAt">) => {
    const id = `${item.topic}-${item.category}-${encodeURIComponent(item.title)}`;
    if (bookmarks.some((b) => b.id === id)) return;

    const newBookmark: BookmarkItem = {
      ...item,
      id,
      savedAt: Date.now(),
    };
    setBookmarks((prev) => [newBookmark, ...prev]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const isBookmarked = (topic: string, title: string, category: CategoryType) => {
    const id = `${topic}-${category}-${encodeURIComponent(title)}`;
    return bookmarks.some((b) => b.id === id);
  };

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
