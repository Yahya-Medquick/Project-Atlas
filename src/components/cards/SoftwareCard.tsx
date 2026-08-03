import React from "react";
import { SoftwareRepo } from "../../types";
import { Star, GitFork, ExternalLink, Bookmark, Check, Code } from "lucide-react";

interface SoftwareCardProps {
  repo: SoftwareRepo;
  onBookmark?: (repo: SoftwareRepo) => void;
  isBookmarked?: boolean;
}

export const SoftwareCard: React.FC<SoftwareCardProps> = ({
  repo,
  onBookmark,
  isBookmarked = false,
}) => {
  return (
    <div className="group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-2xs hover:shadow-lg hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {repo.ownerAvatar ? (
              <img
                src={repo.ownerAvatar}
                alt={repo.name || "Repo owner"}
                className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <Code className="w-5 h-5 text-indigo-500" />
            )}
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
              {(repo.fullName || repo.name || "").split("/")[0] || "repository"}
            </span>
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {repo.language || "Code"}
          </span>
        </div>

        {/* Repo Name */}
        <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
          {repo.name || "Untitled Repository"}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
          {repo.description || "No description provided."}
        </p>

        {/* Topics */}
        {Array.isArray(repo.topics) && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {repo.topics.slice(0, 3).map((topic, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[10px] bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-medium"
              >
                #{topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats & Actions */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-semibold">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-amber-500/20" />
            <span>{(repo.stars ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <GitFork className="w-3.5 h-3.5" />
            <span>{(repo.forks ?? 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBookmark && (
            <button
              onClick={() => onBookmark(repo)}
              className="p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Save Repo"
            >
              {isBookmarked ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}

          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white font-medium flex items-center gap-1 transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
