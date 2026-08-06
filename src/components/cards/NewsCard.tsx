import React from "react";
import { NewsArticle } from "../../types";
import { ExternalLink, Newspaper, Clock, Bookmark, Check } from "lucide-react";

interface NewsCardProps {
  article: NewsArticle;
  onBookmark?: (article: NewsArticle) => void;
  isBookmarked?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onBookmark,
  isBookmarked = false,
}) => {
  return (
    <div className="group rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {article.source}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Recent"}
          </span>
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-white text-base group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors line-clamp-2">
          {article.title}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {article.description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        {onBookmark && (
          <button
            onClick={() => onBookmark(article)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isBookmarked ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        )}

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto px-3.5 py-1.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white font-medium flex items-center gap-1 transition-colors"
        >
          <span>Read Story</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
