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
    <div className="group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-2xs hover:shadow-lg hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {article.source}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Recent"}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {article.title}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
          {article.description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
        {onBookmark && (
          <button
            onClick={() => onBookmark(article)}
            className="p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
          className="ml-auto px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1 shadow-xs transition-colors"
        >
          <span>Read Full Story</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
