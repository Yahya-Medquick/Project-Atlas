import React, { useState, useEffect, lazy, Suspense } from "react";
import { CategoryType, Entity, Persona } from "./types";
import { useTheme } from "./hooks/useTheme";
import { useBookmarks } from "./hooks/useBookmarks";
import { useCategoryData } from "./hooks/useCategoryData";
import { useUser } from "./context/UserContext";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { PersonaSuggestions } from "./components/PersonaSuggestions";
import { CategoryTabs } from "./components/CategoryTabs";
import { TopicHero } from "./components/TopicHero";
import { CategoryViewer } from "./components/CategoryViewer";
import { SidebarInsights } from "./components/SidebarInsights";
import { AuthModal } from "./components/AuthModal";
import { Footer } from "./components/Footer";
import { NotesSidePanel } from "./components/NotesSidePanel";
import { useNotes } from "./hooks/useNotes";
import {
  Sparkles,
  Network,
  GraduationCap,
  FileText,
} from "lucide-react";

// Lazy-loaded components for Bundle Optimization
const VerifyPage = lazy(() =>
  import("./components/VerifyPage").then((m) => ({ default: m.VerifyPage }))
);
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

const LearningQACard = lazy(() =>
  import("./components/cards/LearningQACard").then((m) => ({ default: m.LearningQACard }))
);

const CounselingCard = lazy(() =>
  import("./components/cards/CounselingCard").then((m) => ({ default: m.CounselingCard }))
);

const NotesCard = lazy(() =>
  import("./components/cards/NotesCard").then((m) => ({ default: m.NotesCard }))
);

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { profile, mode, setMode } = useUser();

  const [query, setQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<CategoryType>("overview");
  const [searchCategory, setSearchCategory] = useState<CategoryType | "all">("all");
  const [loadedCategories, setLoadedCategories] = useState<Set<CategoryType>>(new Set());

  // Counseling Personas Cache & Pre-selection State
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | undefined>(undefined);

  // Fetch personas on initial load
  useEffect(() => {
    let isMounted = true;
    const loadPersonas = async () => {
      setIsLoadingPersonas(true);
      try {
        const res = await fetch("/api/personas");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setPersonas(data);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch counseling personas:", err);
      } finally {
        if (isMounted) setIsLoadingPersonas(false);
      }
    };
    loadPersonas();
    return () => {
      isMounted = false;
    };
  }, []);

  // Automatically reset category if not allowed in the current mode and reset dropdown on mode switch
  useEffect(() => {
    const allowed = mode === "research"
      ? ["overview", "research", "software", "news", "communities", "related"]
      : ["overview", "education", "videos", "qa", "counseling"];
    if (!allowed.includes(activeCategory)) {
      setActiveCategory("overview");
    }
    // On mode switch, dropdown resets to "All Categories"
    setSearchCategory("all");
  }, [mode]);

  // Modal States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);

  // Notes Sidebar state
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const { notes } = useNotes();

  // Routing State
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

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
      setCurrentPath(pathname);
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

  // Trigger automatic search query persistence and synthesis into Supabase PostgreSQL (Step 2)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed) {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => {
          if (!res.ok) console.warn("Failed to persist search query:", res.statusText);
        })
        .catch((err) => {
          console.warn("Error calling search persistence endpoint:", err);
        });
    }
  }, [query]);

  const updateUrlParams = (newQuery: string, newCat: CategoryType) => {
    const params = new URLSearchParams();
    if (newQuery) params.set("q", newQuery);
    if (newCat && newCat !== "overview") params.set("cat", newCat);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  const handleSearch = (newQuery: string, category?: CategoryType | "all") => {
    const chosenCat = category !== undefined ? category : searchCategory;
    const catToActivate: CategoryType = (chosenCat && chosenCat !== "all") ? chosenCat : "overview";

    setQuery(newQuery);
    setActiveCategory(catToActivate);
    setLoadedCategories(new Set([catToActivate]));
    setSelectedPersonaId(undefined);
    setSearchCategory(chosenCat || "all");
    addRecentSearch(newQuery);
    updateUrlParams(newQuery, catToActivate);
    fetchEntityData(newQuery);
  };

  const handleSelectCategory = (cat: CategoryType) => {
    setActiveCategory(cat);
    setLoadedCategories((prev) => new Set(prev).add(cat));
    setSearchCategory(cat);
    updateUrlParams(query, cat);
  };

  const handleSelectSearchCategory = (cat: CategoryType | "all") => {
    setSearchCategory(cat);
    if (query && cat !== "all") {
      setActiveCategory(cat);
      setLoadedCategories((prev) => new Set(prev).add(cat));
      updateUrlParams(query, cat);
    }
  };

  const handleSelectPersona = (persona: Persona) => {
    if (mode === "research") {
      setMode("learning");
    }
    setSelectedPersonaId(persona.id);
    setActiveCategory("counseling");
    setSearchCategory("counseling");
    setLoadedCategories((prev) => new Set(prev).add("counseling"));
    const targetTopic = persona.subject_tag || persona.name || "Academic Counseling";
    const nextQuery = query || targetTopic;
    setQuery(nextQuery);
    updateUrlParams(nextQuery, "counseling");
  };

  const handleGoHome = () => {
    setQuery("");
    setActiveCategory("overview");
    setLoadedCategories(new Set());
    setCurrentEntity(null);
    setSelectedPersonaId(undefined);
    setSearchCategory("all");
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

  if (currentPath === "/verify") {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">Loading Verification...</div>}>
        <VerifyPage />
      </Suspense>
    );
  }

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
              <SearchBar
                onSearch={handleSearch}
                selectedCategory={searchCategory}
                onSelectCategory={handleSelectSearchCategory}
                mode={mode}
              />
            </div>

            {/* Counseling Personas Suggestions below Search */}
            <PersonaSuggestions
              personas={personas}
              mode={mode}
              onSelectPersona={handleSelectPersona}
              isLoading={isLoadingPersonas}
            />
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
                selectedCategory={searchCategory}
                onSelectCategory={handleSelectSearchCategory}
                mode={mode}
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
                {activeCategory === "qa" ? (
                  <Suspense fallback={
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl p-8 text-center space-y-4 shadow-xs">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
                      <p className="text-xs text-slate-500">Loading AI Learning Q&A...</p>
                    </div>
                  }>
                    <LearningQACard />
                  </Suspense>
                ) : activeCategory === "counseling" ? (
                  <Suspense fallback={
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl p-8 text-center space-y-4 shadow-xs">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
                      <p className="text-xs text-slate-500">Loading AI Expert Counseling...</p>
                    </div>
                  }>
                    <CounselingCard
                      defaultPersonaId={selectedPersonaId}
                      onClearDefaultPersona={() => setSelectedPersonaId(undefined)}
                    />
                  </Suspense>
                ) : activeCategory === "notes" ? (
                  <Suspense fallback={
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl p-8 text-center space-y-4 shadow-xs">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
                      <p className="text-xs text-slate-500">Loading Student Notes...</p>
                    </div>
                  }>
                    <NotesCard />
                  </Suspense>
                ) : (
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
                )}
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

      {/* Authentication Modal */}
      <AuthModal
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

      {/* Floating Notes Trigger Button */}
      <button
        onClick={() => setIsNotesOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center group"
        title="Open My Notes"
      >
        <span className="text-xl">📝</span>
        {notes.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-50 dark:border-slate-950 animate-pulse">
            {notes.length}
          </span>
        )}
      </button>

      {/* Notes Sidebar Drawer Panel */}
      <NotesSidePanel
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
      />
    </div>
  );
}

