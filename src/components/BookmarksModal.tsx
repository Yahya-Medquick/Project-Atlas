import React from "react";
import { BookmarkItem } from "../types";
import { X, Trash2, ExternalLink, Bookmark, Compass } from "lucide-react";

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkItem[];
  onRemove: (id: string) => void;
  onSelectTopic: (topic: string) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemove,
  onSelectTopic,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">
              Saved Bookmarks ({bookmarks.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {bookmarks.length > 0 ? (
            bookmarks.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 space-y-2 group"
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <span
                    onClick={() => {
                      onSelectTopic(b.topic);
                      onClose();
                    }}
                    className="cursor-pointer hover:underline flex items-center gap-1"
                  >
                    <Compass className="w-3 h-3" />
                    <span>{b.topic}</span>
                  </span>
                  <span>{b.category}</span>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                  {b.title}
                </h4>

                {b.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {b.description}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onRemove(b.id)}
                    className="text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>

                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-medium flex items-center gap-1 text-[11px]"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <Bookmark className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-medium">No saved bookmarks yet.</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Save papers, repos, books, or articles while exploring topics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
