import React, { useState } from "react";
import { Compass, Moon, Sun, Bookmark, Cpu, User, Search, Code2, LogIn, LogOut, History, Shield, ChevronDown } from "lucide-react";
import { useUser } from "../context/UserContext";

interface HeaderProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
  onOpenBookmarks: () => void;
  bookmarksCount: number;
  onGoHome: () => void;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  onOpenApiDocs?: () => void;
  onOpenLogin: () => void;
  onSelectCategory?: (category: any) => void;
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
  onOpenLogin,
  onSelectCategory,
  currentQuery,
}) => {
  const { user, isLoggedIn, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                Bifrost AI
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
                Engine
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

          {/* Auth User Menu or Sign In Button */}
          {isLoggedIn && user ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt={user.name}
                  className="w-6 h-6 rounded-full border border-indigo-300 dark:border-indigo-700 object-cover"
                />
                <span className="text-xs font-semibold text-slate-900 dark:text-white max-w-[100px] truncate hidden sm:inline">
                  {user.name}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-600 text-white uppercase hidden md:inline">
                  {user.tier || "Free"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onSelectCategory) onSelectCategory("history");
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <History className="w-4 h-4 text-indigo-500" />
                    <span>Search History</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Profile & Settings</span>
                  </button>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in with Google</span>
            </button>
          )}

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


