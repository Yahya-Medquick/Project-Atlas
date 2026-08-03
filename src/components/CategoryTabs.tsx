import React, { useEffect, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Newspaper,
  Code2,
  Video,
  Library,
  FileText,
  MessageSquare,
  Network,
  Sparkles,
  History,
  Lock,
  Activity,
  Clock,
} from "lucide-react";
import { CategoryInfo, CategoryType, TabUsage } from "../types";
import { useUser } from "../context/UserContext";
import { fetchTabUsage } from "../services/api";

export const CATEGORIES: CategoryInfo[] = [
  { id: "overview", label: "Overview", shortLabel: "Overview", iconName: "BookOpen", description: "Synthesis, facts, timeline & key figures" },
  { id: "education", label: "Education", shortLabel: "Education", iconName: "GraduationCap", description: "Learning roadmaps & interactive quizzes", badge: "Interactive" },
  { id: "news", label: "News", shortLabel: "News", iconName: "Newspaper", description: "Recent discoveries & news articles" },
  { id: "software", label: "Software", shortLabel: "Software", iconName: "Code2", description: "GitHub repos, tools & frameworks", badge: "Auth Only" },
  { id: "videos", label: "Videos", shortLabel: "Videos", iconName: "Video", description: "Lectures, documentaries & video explainers" },
  { id: "books", label: "Books", shortLabel: "Books", iconName: "Library", description: "Google Books, textbooks & previews" },
  { id: "research", label: "Research Papers", shortLabel: "Research", iconName: "FileText", description: "OpenAlex peer-reviewed paper archive", badge: "Auth Only" },
  { id: "communities", label: "Communities", shortLabel: "Communities", iconName: "MessageSquare", description: "Reddit discussions, forums & Q&A" },
  { id: "related", label: "Related Topics", shortLabel: "Graph", iconName: "Network", description: "Knowledge graph & connected node network" },
  { id: "recommendations", label: "Recommendations", shortLabel: "Recs", iconName: "Sparkles", description: "Smart AI recommendations & curated topics", badge: "Smart AI" },
  { id: "history", label: "History", shortLabel: "History", iconName: "History", description: "Your persistent search history, pins & stars", badge: "User" },
];

interface CategoryTabsProps {
  activeCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  loadedCategories?: Set<CategoryType>;
  currentTopic?: string;
  dataTrigger?: any;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  loadedCategories = new Set(),
  currentTopic,
  dataTrigger,
}) => {
  const { isLoggedIn } = useUser();
  const [usageInfo, setUsageInfo] = useState<TabUsage | null>(null);

  const isGatedTab = activeCategory === "research" || activeCategory === "software";

  useEffect(() => {
    let isMounted = true;
    if (isGatedTab && isLoggedIn) {
      fetchTabUsage(activeCategory).then((data) => {
        if (isMounted && data) {
          setUsageInfo(data);
        }
      });
    } else {
      setUsageInfo(null);
    }
    return () => {
      isMounted = false;
    };
  }, [activeCategory, isLoggedIn, currentTopic, dataTrigger]);

  const formatResetTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "BookOpen": return <BookOpen className="w-4 h-4" />;
      case "GraduationCap": return <GraduationCap className="w-4 h-4" />;
      case "Newspaper": return <Newspaper className="w-4 h-4" />;
      case "Code2": return <Code2 className="w-4 h-4" />;
      case "Video": return <Video className="w-4 h-4" />;
      case "Library": return <Library className="w-4 h-4" />;
      case "FileText": return <FileText className="w-4 h-4" />;
      case "MessageSquare": return <MessageSquare className="w-4 h-4" />;
      case "Network": return <Network className="w-4 h-4" />;
      case "Sparkles": return <Sparkles className="w-4 h-4" />;
      case "History": return <History className="w-4 h-4 text-amber-500" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const isLoaded = loadedCategories.has(cat.id);
            const isProtected = (cat.id === "research" || cat.id === "software") && !isLoggedIn;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                aria-label={`Switch to ${cat.label} tab`}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 select-none ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : isProtected
                    ? "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
                title={cat.description}
              >
                <span>{getIcon(cat.iconName)}</span>
                <span>{cat.label}</span>

                {/* Protected tab lock icon */}
                {isProtected && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}

                {/* Badge if present */}
                {cat.badge && (
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : isProtected
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                        : "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}

                {/* Loaded Indicator Dot */}
                {isLoaded && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Data cached" />
                )}
              </button>
            );
          })}
        </div>

        {/* Real-time Usage Display Indicator for Gated Tabs */}
        {isGatedTab && isLoggedIn && usageInfo && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/60 text-xs text-purple-800 dark:text-purple-300 font-medium shrink-0 animate-in fade-in duration-200 self-start md:self-auto">
            <Activity className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-pulse shrink-0" />
            <span>
              {usageInfo.limit >= 1000 ? (
                <strong className="font-bold">Unlimited Searches Today</strong>
              ) : (
                <>
                  <strong className="font-bold">{usageInfo.count} of {usageInfo.limit}</strong> searches used today · resets in {formatResetTime(usageInfo.resetInSeconds)}
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
