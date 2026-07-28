import React, { useState } from "react";
import { Sparkles, Share2, Check, RefreshCw, Scale, History } from "lucide-react";

interface TopicHeroProps {
  topic: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  onOpenCompare?: () => void;
  onOpenTimeline?: () => void;
}

export const TopicHero: React.FC<TopicHeroProps> = ({
  topic,
  onRefresh,
  isLoading = false,
  onOpenCompare,
  onOpenTimeline,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Project Atlas Entity</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Multi-Source Synthesis
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white capitalize flex items-center gap-3">
            <span>{topic}</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Lazy-loaded multi-dimensional synthesis across OpenAlex research, open-source codebases, educational roadmaps, and interactive physics sandboxes.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Scale className="w-3.5 h-3.5 text-purple-500" />
              <span>Compare</span>
            </button>
          )}

          {onOpenTimeline && (
            <button
              onClick={onOpenTimeline}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <History className="w-3.5 h-3.5 text-indigo-500" />
              <span>Timeline</span>
            </button>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-2 shadow-xs"
              title="Refresh Topic Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin text-indigo-500" : ""}`} />
            </button>
          )}

          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

