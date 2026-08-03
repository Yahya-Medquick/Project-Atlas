import React from "react";
import { ResearchPaper } from "../../types";
import { ExternalLink, Bookmark, Check, Award, FileText, Download } from "lucide-react";

interface PaperCardProps {
  paper: ResearchPaper;
  onBookmark?: (item: ResearchPaper) => void;
  isBookmarked?: boolean;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  onBookmark,
  isBookmarked = false,
}) => {
  return (
    <div className="group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-2xs hover:shadow-lg hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header Metadata Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              {paper.publicationYear ?? "N/A"}
            </span>
            {paper.openAccess && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                Open Access
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>{(paper.citationCount ?? 0).toLocaleString()} citations</span>
          </div>
        </div>

        {/* Paper Title */}
        <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {paper.title || "Untitled Paper"}
        </h3>

        {/* Authors & Journal */}
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
            {Array.isArray(paper.authors) && paper.authors.length > 0
              ? paper.authors.join(", ")
              : "Unknown Author(s)"}
          </p>
          <p className="italic line-clamp-1 text-[11px]">
            {paper.journalOrVenue || "Academic Repository"}
          </p>
        </div>

        {/* Abstract */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed pt-1">
          {paper.abstract || "No abstract available for this paper."}
        </p>
      </div>

      {/* Action Links */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
        {onBookmark && (
          <button
            onClick={() => onBookmark(paper)}
            className="p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 font-medium"
            title="Save Paper to Bookmarks"
          >
            {isBookmarked ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Save</span>
              </>
            )}
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </a>
          )}

          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1 shadow-xs transition-colors"
          >
            <span>View Article</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
