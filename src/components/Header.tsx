import React from "react";
import { Compass, Moon, Sun, Bookmark, Cpu, User, Search, Code2 } from "lucide-react";

interface HeaderProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
  onOpenBookmarks: () => void;
  bookmarksCount: number;
  onGoHome: () => void;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  onOpenApiDocs?: () => void;
  currentQuery?: string;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  onOpenBookmarks,
  bookmarksCount,
  onGoHome,
  onOpenAdmin,
  onOpenProfile,
  onOpenApiDocs,
  currentQuery,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-200">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white font-sans">
                Project Atlas
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
                Entity Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium hidden sm:block">
              Universal Knowledge Engine
            </p>
          </div>
        </div>

        {/* Current Search Chip indicator */}
        {currentQuery && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <Search className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-slate-400">Exploring:</span>
            <span className="font-semibold text-slate-900 dark:text-white max-w-[180px] truncate">
              {currentQuery}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* API Docs Trigger */}
          {onOpenApiDocs && (
            <button
              onClick={onOpenApiDocs}
              aria-label="Public REST API Documentation"
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Public REST API v1 Documentation"
            >
              <Code2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="hidden lg:inline">API</span>
            </button>
          )}

          {/* Admin Dashboard Trigger */}
          <button
            onClick={onOpenAdmin}
            aria-label="Open Admin Dashboard"
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-2 text-xs font-semibold"
            title="Admin & Telemetry Dashboard"
          >
            <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Admin</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* User Profile Button */}
          <button
            onClick={onOpenProfile}
            aria-label="Open User Profile"
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-2 text-xs font-semibold"
            title="User Profile & History"
          >
            <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="hidden md:inline">Profile</span>
          </button>

          {/* Saved Bookmarks Button */}
          <button
            onClick={onOpenBookmarks}
            aria-label={`View ${bookmarksCount} saved bookmarks`}
            className="relative p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-2 text-xs font-medium"
            title="Saved Bookmarks"
          >
            <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span className="hidden sm:inline">Saved</span>
            {bookmarksCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center justify-center text-xs"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


