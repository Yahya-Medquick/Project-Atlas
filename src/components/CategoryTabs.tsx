import React from "react";
import {
  BookOpen,
  GraduationCap,
  Newspaper,
  Code2,
  Gamepad2,
  Video,
  Library,
  FileText,
  MessageSquare,
  Network,
} from "lucide-react";
import { CategoryInfo, CategoryType } from "../types";

export const CATEGORIES: CategoryInfo[] = [
  { id: "overview", label: "Overview", shortLabel: "Overview", iconName: "BookOpen", description: "Synthesis, facts, timeline & key figures" },
  { id: "education", label: "Education", shortLabel: "Education", iconName: "GraduationCap", description: "Learning roadmaps & interactive quizzes", badge: "Interactive" },
  { id: "news", label: "News", shortLabel: "News", iconName: "Newspaper", description: "Recent discoveries & news articles" },
  { id: "software", label: "Software", shortLabel: "Software", iconName: "Code2", description: "GitHub repos, tools & frameworks" },
  { id: "games", label: "Games & Sims", shortLabel: "Simulations", iconName: "Gamepad2", description: "Interactive physics & concept sandboxes", badge: "Live Lab" },
  { id: "videos", label: "Videos", shortLabel: "Videos", iconName: "Video", description: "Lectures, documentaries & video explainers" },
  { id: "books", label: "Books", shortLabel: "Books", iconName: "Library", description: "Google Books, textbooks & previews" },
  { id: "research", label: "Research Papers", shortLabel: "Research", iconName: "FileText", description: "OpenAlex peer-reviewed paper archive", badge: "Live DOIs" },
  { id: "communities", label: "Communities", shortLabel: "Communities", iconName: "MessageSquare", description: "Reddit discussions, forums & Q&A" },
  { id: "related", label: "Related Topics", shortLabel: "Graph", iconName: "Network", description: "Knowledge graph & connected node network" },
];

interface CategoryTabsProps {
  activeCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  loadedCategories?: Set<CategoryType>;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  loadedCategories = new Set(),
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "BookOpen": return <BookOpen className="w-4 h-4" />;
      case "GraduationCap": return <GraduationCap className="w-4 h-4" />;
      case "Newspaper": return <Newspaper className="w-4 h-4" />;
      case "Code2": return <Code2 className="w-4 h-4" />;
      case "Gamepad2": return <Gamepad2 className="w-4 h-4" />;
      case "Video": return <Video className="w-4 h-4" />;
      case "Library": return <Library className="w-4 h-4" />;
      case "FileText": return <FileText className="w-4 h-4" />;
      case "MessageSquare": return <MessageSquare className="w-4 h-4" />;
      case "Network": return <Network className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const isLoaded = loadedCategories.has(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 select-none ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
                title={cat.description}
              >
                <span>{getIcon(cat.iconName)}</span>
                <span>{cat.label}</span>

                {/* Badge if present */}
                {cat.badge && (
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
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
      </div>
    </div>
  );
};
