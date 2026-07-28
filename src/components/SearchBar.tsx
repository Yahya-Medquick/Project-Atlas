import React, { useState, useRef, useEffect } from "react";
import { Search, X, Sparkles, ArrowRight, Loader2, Compass } from "lucide-react";
import { useAutocomplete } from "../hooks/useAutocomplete";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
  isCompact?: boolean;
}

const FEATURED_TOPICS = [
  "Gravity",
  "Quantum Computing",
  "Photosynthesis",
  "Machine Learning",
  "Black Holes",
  "Gene Editing",
  "Special Relativity",
  "Dark Matter",
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialQuery = "",
  placeholder = "Search any topic (e.g., Gravity, Quantum Mechanics, Photosynthesis)...",
  isCompact = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading } = useAutocomplete(query);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Handle click outside to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setIsOpen(false);
    onSearch(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSubmit(suggestions[selectedIndex].title);
      } else {
        handleSubmit(query);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto relative">
      <div className="relative group">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(query);
          }}
          className={`relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border ${
            isOpen
              ? "border-indigo-500 ring-4 ring-indigo-500/10 dark:ring-indigo-500/20"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          } shadow-lg shadow-slate-200/50 dark:shadow-none transition-all duration-200 overflow-hidden ${
            isCompact ? "p-1.5" : "p-2"
          }`}
        >
          {/* Left Search Icon */}
          <div className="pl-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full bg-transparent border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 ${
              isCompact ? "px-3 py-1.5 text-sm" : "px-4 py-3 text-base"
            } font-medium`}
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Submit Search Button */}
          <button
            type="submit"
            disabled={!query.trim()}
            className={`rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
              isCompact ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm"
            }`}
          >
            <span>Explore</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (query.trim().length >= 2 || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/50">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Intelligent Suggestions</span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {suggestions.length > 0 ? (
              suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSubmit(item.title)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors ${
                    selectedIndex === idx
                      ? "bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <Compass className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {item.title}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div
                onClick={() => handleSubmit(query)}
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm font-medium text-indigo-600 dark:text-indigo-400"
              >
                <span>Search knowledge for "{query}"</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Featured Suggestion Chips on Home view */}
      {!isCompact && (
        <div className="mt-4 flex items-center flex-wrap justify-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Popular Topics:</span>
          {FEATURED_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => {
                setQuery(topic);
                handleSubmit(topic);
              }}
              className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 font-medium transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
