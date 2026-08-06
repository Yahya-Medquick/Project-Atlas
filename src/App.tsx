import React, { useState, useEffect, lazy, Suspense } from "react";
import { CategoryType, Entity } from "./types";
import { useTheme } from "./hooks/useTheme";
import { useBookmarks } from "./hooks/useBookmarks";
import { useCategoryData } from "./hooks/useCategoryData";
import { useUser } from "./context/UserContext";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { CategoryTabs } from "./components/CategoryTabs";
import { TopicHero } from "./components/TopicHero";
import { CategoryViewer } from "./components/CategoryViewer";
import { SidebarInsights } from "./components/SidebarInsights";
import { GoogleLoginModal } from "./components/GoogleLoginModal";
import { Footer } from "./components/Footer";
import {
  Sparkles,
  Network,
  GraduationCap,
  FileText,
} from "lucide-react";

// Lazy-loaded Modal components for Bundle Optimization
const BookmarksModal = lazy(() =>
  import("./components/BookmarksModal").then((m) => ({ default: m.BookmarksModal }))
);
const AdminDashboardModal = lazy(() =>
  import("./components/AdminDashboardModal").then((m) => ({ default: m.AdminDashboardModal }))
);
const UserProfileModal = lazy(() =>
  import("./components/UserProfileModal").then((m) => ({ default: m.UserProfileModal }))
);
const TopicCompareModal = lazy(() =>
  import("./components/TopicCompareModal").then((m) => ({ default: m.TopicCompareModal }))
);
const TopicTimelineModal = lazy(() =>
  import("./components/TopicTimelineModal").then((m) => ({ default: m.TopicTimelineModal }))
);
const DeveloperApiModal = lazy(() =>
  import("./components/DeveloperApiModal").then((m) => ({ default: m.DeveloperApiModal }))
);

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { profile } = useUser();

  const [query, setQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<CategoryType>("overview");
  const [loadedCategories, setLoadedCategories] = useState<Set<CategoryType>>(new Set());

  // Modal States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);

  // Entity Resolution State
  const [currentEntity, setCurrentEntity] = useState<Entity | null>(null);
  const [matchedAlias, setMatchedAlias] = useState<string | null>(null);
  const [rankingScore, setRankingScore] = useState<number>(95);
  const [synonymsConnected, setSynonymsConnected] = useState<string[]>([]);

  // Search History LocalStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("atlas_recent_searches");
      return saved ? JSON.parse(saved) : ["Gravity", "Quantum Computing", "Machine Learning"];
    } catch (e) {
      return ["Gravity", "Quantum Computing"];
    }
  });

  const addRecentSearch = (q: string) => {
    if (!q.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== q.toLowerCase());
      const updated = [q.trim(), ...filtered].slice(0, 10);
      try {
        localStorage.setItem("atlas_recent_searches", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("atlas_recent_searches");
    } catch (e) {}
  };

  // Fetch Semantic Entity Information on Search
  const fetchEntityData = async (searchTopic: string) => {
    if (!searchTopic) return;
    try {
      const res = await fetch(`/api/entities/search?q=${encodeURIComponent(searchTopic)}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentEntity(data.matchedEntity || null);
        setMatchedAlias(data.matchedAlias || null);
        setRankingScore(data.rankingScore || 92);
        setSynonymsConnected(data.synonymsConnected || []);
      }
    } catch (err) {
      console.warn("Error fetching semantic entity data:", err);
    }
  };

  // Sync URL search params and listen for popstate (browser back/forward navigation)
  useEffect(() => {
    const syncFromUrl = () => {
      const pathname = window.location.pathname;
      let qParam = "";
      
      if (pathname.startsWith("/topic/")) {
        const slug = pathname.replace("/topic/", "").trim();
        if (slug) {
          qParam = decodeURIComponent(slug).replace(/-/g, " ");
        }
      }

      if (!qParam) {
        const params = new URLSearchParams(window.location.search);
        qParam = params.get("q") || "";
      }

      const params = new URLSearchParams(window.location.search);
      const catParam = (params.get("cat") || "overview") as CategoryType;

      setQuery(qParam);
      setActiveCategory(catParam);
      if (qParam) {
        fetchEntityData(qParam);
      }
    };

    syncFromUrl();

    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const updateUrlParams = (newQuery: string, newCat: CategoryType) => {
    const params = new URLSearchParams();
    if (newQuery) params.set("q", newQuery);
    if (newCat && newCat !== "overview") params.set("cat", newCat);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setActiveCategory("overview");
    setLoadedCategories(new Set(["overview"]));
    addRecentSearch(newQuery);
    updateUrlParams(newQuery, "overview");
    fetchEntityData(newQuery);
  };

  const handleSelectCategory = (cat: CategoryType) => {
    setActiveCategory(cat);
    setLoadedCategories((prev) => new Set(prev).add(cat));
    updateUrlParams(query, cat);
  };

  const handleGoHome = () => {
    setQuery("");
    setActiveCategory("overview");
    setLoadedCategories(new Set());
    setCurrentEntity(null);
    window.history.pushState({}, "", window.location.pathname);
  };

  // Category data fetching hook
  const {
    data,
    isLoading,
    isLoadingMore,
    error,
    isAutoRetrying,
    retryCountdown,
    autoRetryCount,
    hasMore,
    loadMore,
    refetch,
    matchMode,
    setMatchMode,
  } = useCategoryData(query, activeCategory);

  const handleBookmarkItem = (item: any, cat: CategoryType) => {
    const title = item.title || item.name || query;
    const url = item.url || item.previewLink || item.pdfUrl || window.location.href;
    const desc = item.description || item.abstract || item.summary || "";

    addBookmark({
      topic: query,
      title,
      category: cat,
      url,
      description: desc,
    });
  };

  const checkIsBookmarked = (title: string, cat: CategoryType) => {
    return isBookmarked(query, title, cat);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Skip Navigation Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Navbar */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarksCount={bookmarks.length}
        onGoHome={handleGoHome}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenApiDocs={() => setIsApiDocsOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onSelectCategory={handleSelectCategory}
        currentQuery={query}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        {!query ? (
          /* HOMEPAGE LANDING VIEW - Ultra-Minimalist & Direct */
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-32 flex flex-col items-center justify-center text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Explore <span className="text-indigo-600 dark:text-indigo-400">Knowledge</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-normal leading-relaxed">
                Multi-source intelligence across research papers, codebases, AI synthesis, and interactive roadmaps.
              </p>
            </div>

            {/* Main Search Bar */}
            <div className="w-full pt-2">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        ) : (
          /* ACTIVE TOPIC EXPLORER VIEW - Clean Layout with Entity Sidebar */
          <div className="space-y-6">
            {/* Topic Hero Banner */}
            <TopicHero
              topic={query}
              onRefresh={refetch}
              isLoading={isLoading}
              onOpenCompare={() => setIsCompareOpen(true)}
              onOpenTimeline={() => setIsTimelineOpen(true)}
            />

            {/* Compact Search bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
              <SearchBar
                onSearch={handleSearch}
                initialQuery={query}
                placeholder={`Search another topic (e.g. Gravity, Quantum Computing)...`}
                isCompact
              />
            </div>

            {/* Category Tabs Bar */}
            <CategoryTabs
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              loadedCategories={loadedCategories}
              currentTopic={query}
              dataTrigger={data}
            />

            {/* Category Content + Entity Sidebar Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-8 items-start">
              
              {/* Category Main Content */}
              <div className="flex-1 min-w-0 w-full">
                <CategoryViewer
                  category={activeCategory}
                  topic={query}
                  data={data}
                  isLoading={isLoading}
                  isLoadingMore={isLoadingMore}
                  error={error}
                  isAutoRetrying={isAutoRetrying}
                  retryCountdown={retryCountdown}
                  autoRetryCount={autoRetryCount}
                  hasMore={hasMore}
                  entity={currentEntity}
                  rankingScore={rankingScore}
                  synonymsConnected={synonymsConnected}
                  onLoadMore={loadMore}
                  onRetry={refetch}
                  onBookmarkItem={handleBookmarkItem}
                  isBookmarkedItem={checkIsBookmarked}
                  onSelectTopic={handleSearch}
                  onOpenLogin={() => setIsLoginOpen(true)}
                  matchMode={matchMode}
                  onMatchModeChange={setMatchMode}
                />
              </div>

              {/* Sidebar Insights Panel */}
              <SidebarInsights
                entity={currentEntity}
                query={query}
                matchedAlias={matchedAlias}
                rankingScore={rankingScore}
                synonymsConnected={synonymsConnected}
                onSelectSynonym={handleSearch}
              />

            </div>
          </div>
        )}
      </main>

      {/* Google Login Modal */}
      <GoogleLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Modals wrapped in Suspense for Lazy Loading */}
      <Suspense fallback={null}>
        {/* Bookmarks Modal Drawer */}
        <BookmarksModal
          isOpen={isBookmarksOpen}
          onClose={() => setIsBookmarksOpen(false)}
          bookmarks={bookmarks}
          onRemove={removeBookmark}
          onSelectTopic={handleSearch}
        />

        {/* System Admin & Telemetry Modal */}
        <AdminDashboardModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onRefreshEntityData={(slug) => fetchEntityData(slug)}
        />

        {/* User Profile & Search History Modal */}
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          recentSearches={recentSearches}
          onSelectSearch={handleSearch}
          onClearHistory={clearRecentSearches}
          bookmarksCount={bookmarks.length}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
        />

        {/* Topic Comparison Matrix Modal */}
        <TopicCompareModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          defaultTopicA={query || "Gravity"}
          onSelectTopic={handleSearch}
        />

        {/* Topic Chronological Timeline Modal */}
        <TopicTimelineModal
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          topic={query || "Gravity"}
        />

        {/* Developer REST API Documentation Modal */}
        <DeveloperApiModal
          isOpen={isApiDocsOpen}
          onClose={() => setIsApiDocsOpen(false)}
        />
      </Suspense>

      {/* Footer */}
      <Footer />
    </div>
  );
}

