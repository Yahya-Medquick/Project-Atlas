import React from "react";
import { BookItem } from "../../types";
import { ExternalLink, Star, Bookmark, Check, BookOpen } from "lucide-react";

interface BookCardProps {
  book: BookItem;
  onBookmark?: (book: BookItem) => void;
  isBookmarked?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onBookmark,
  isBookmarked = false,
}) => {
  return (
    <div className="group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-2xs hover:shadow-lg hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between space-y-4">
      <div className="flex items-start gap-4">
        {/* Cover Thumbnail */}
        <div className="w-20 h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs flex items-center justify-center">
          {book.thumbnail ? (
            <img
              src={book.thumbnail}
              alt={book.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <BookOpen className="w-8 h-8 text-slate-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {book.publishedDate}
            </span>
            {book.rating && (
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{book.rating}</span>
              </div>
            )}
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
            {book.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
            {book.authors.join(", ")}
          </p>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 pt-1 leading-normal">
            {book.description}
          </p>
        </div>
      </div>

      {/* Footer Links */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
        {book.pageCount && (
          <span className="text-slate-400 font-medium text-[11px]">
            {book.pageCount} pages
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {onBookmark && (
            <button
              onClick={() => onBookmark(book)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isBookmarked ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}

          <a
            href={book.previewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1 shadow-xs transition-colors"
          >
            <span>Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
