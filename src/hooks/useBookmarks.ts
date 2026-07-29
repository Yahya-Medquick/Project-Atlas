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

  // Fetch bookmarks from PostgreSQL backend API on mount
  useEffect(() => {
    async function fetchServerBookmarks() {
      try {
        const res = await fetch("/api/bookmarks");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.bookmarks)) {
            setBookmarks(data.bookmarks);
            localStorage.setItem("atlas_bookmarks", JSON.stringify(data.bookmarks));
          }
        }
      } catch (err) {
        console.warn("Could not sync bookmarks with server persistence tier:", err);
      }
    }
    fetchServerBookmarks();
  }, []);

  const addBookmark = async (item: Omit<BookmarkItem, "id" | "savedAt">) => {
    const id = `${item.topic}-${item.category}-${encodeURIComponent(item.title)}`;
    if (bookmarks.some((b) => b.id === id)) return;

    const newBookmark: BookmarkItem = {
      ...item,
      id,
      savedAt: Date.now(),
    };

    setBookmarks((prev) => [newBookmark, ...prev]);
    localStorage.setItem("atlas_bookmarks", JSON.stringify([newBookmark, ...bookmarks]));

    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    } catch (err) {
      console.warn("Failed to save bookmark to PostgreSQL:", err);
    }
  };

  const removeBookmark = async (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    const updated = bookmarks.filter((b) => b.id !== id);
    localStorage.setItem("atlas_bookmarks", JSON.stringify(updated));

    try {
      await fetch(`/api/bookmarks/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Failed to delete bookmark from PostgreSQL:", err);
    }
  };

  const isBookmarked = (topic: string, title: string, category: CategoryType) => {
    const id = `${topic}-${category}-${encodeURIComponent(title)}`;
    return bookmarks.some((b) => b.id === id);
  };

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
