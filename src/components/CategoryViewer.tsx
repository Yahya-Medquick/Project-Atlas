import React, { lazy, Suspense } from "react";
import { CategoryApiResponse, CategoryType, ResearchPaper, SoftwareRepo, BookItem, NewsArticle, CommunityDiscussion } from "../types";
import { CardSkeleton } from "./CardSkeleton";
import { OverviewCard } from "./cards/OverviewCard";
import { PaperCard } from "./cards/PaperCard";
import { SoftwareCard } from "./cards/SoftwareCard";
import { BookCard } from "./cards/BookCard";
import { VideoCard } from "./cards/VideoCard";
import { EducationCard } from "./cards/EducationCard";
import { NewsCard } from "./cards/NewsCard";
import { CommunityCard } from "./cards/CommunityCard";
import { AIQuestionAnswerCard } from "./AIQuestionAnswerCard";
import { AlertCircle, RefreshCw, ArrowDown } from "lucide-react";

const InteractiveSim = lazy(() =>
  import("./InteractiveSim").then((m) => ({ default: m.InteractiveSim }))
);
const KnowledgeGraph = lazy(() =>
  import("./KnowledgeGraph").then((m) => ({ default: m.KnowledgeGraph }))
);

interface CategoryViewerProps {
  category: CategoryType;
  topic: string;
  data: CategoryApiResponse | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onBookmarkItem: (item: any, category: CategoryType) => void;
  isBookmarkedItem: (title: string, category: CategoryType) => boolean;
  onSelectTopic: (topic: string) => void;
}

export const CategoryViewer: React.FC<CategoryViewerProps> = ({
  category,
  topic,
  data,
  isLoading,
  isLoadingMore,
  error,
  hasMore,
  onLoadMore,
  onRetry,
  onBookmarkItem,
  isBookmarkedItem,
  onSelectTopic,
}) => {
  if (isLoading) {
    return <CardSkeleton count={6} />;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 p-8 text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-slate-900 dark:text-white text-lg">
          Failed to load {category}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs inline-flex items-center gap-2 transition-colors shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* 1. OVERVIEW */}
      {category === "overview" && (
        <div className="space-y-6">
          <AIQuestionAnswerCard topic={topic} />
          {data.overviewData && <OverviewCard data={data.overviewData} />}
        </div>
      )}


      {/* 2. EDUCATION */}
      {category === "education" && data.educationData && (
        <EducationCard educationData={data.educationData} />
      )}

      {/* 3. RESEARCH PAPERS */}
      {category === "research" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((paper: ResearchPaper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onBookmark={() => onBookmarkItem(paper, "research")}
              isBookmarked={isBookmarkedItem(paper.title, "research")}
            />
          ))}
        </div>
      )}

      {/* 4. SOFTWARE */}
      {category === "software" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((repo: SoftwareRepo) => (
            <SoftwareCard
              key={repo.id}
              repo={repo}
              onBookmark={() => onBookmarkItem(repo, "software")}
              isBookmarked={isBookmarkedItem(repo.name, "software")}
            />
          ))}
        </div>
      )}

      {/* 5. BOOKS */}
      {category === "books" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((book: BookItem) => (
            <BookCard
              key={book.id}
              book={book}
              onBookmark={() => onBookmarkItem(book, "books")}
              isBookmarked={isBookmarkedItem(book.title, "books")}
            />
          ))}
        </div>
      )}

      {/* 6. VIDEOS */}
      {category === "videos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.items.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      {/* 7. NEWS */}
      {category === "news" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((article: NewsArticle) => (
            <NewsCard
              key={article.id}
              article={article}
              onBookmark={() => onBookmarkItem(article, "news")}
              isBookmarked={isBookmarkedItem(article.title, "news")}
            />
          ))}
        </div>
      )}

      {/* 8. COMMUNITIES */}
      {category === "communities" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((discussion: CommunityDiscussion) => (
            <CommunityCard
              key={discussion.id}
              discussion={discussion}
              onBookmark={() => onBookmarkItem(discussion, "communities")}
              isBookmarked={isBookmarkedItem(discussion.title, "communities")}
            />
          ))}
        </div>
      )}

      {/* 9. GAMES / INTERACTIVE SIMULATION */}
      {category === "games" && data.simulationData && (
        <Suspense fallback={<CardSkeleton count={1} />}>
          <InteractiveSim simulation={data.simulationData} topic={topic} />
        </Suspense>
      )}

      {/* 10. RELATED TOPICS KNOWLEDGE GRAPH */}
      {category === "related" && data.knowledgeGraph && (
        <Suspense fallback={<CardSkeleton count={1} />}>
          <KnowledgeGraph
            graphData={data.knowledgeGraph}
            onSelectTopic={onSelectTopic}
          />
        </Suspense>
      )}

      {/* Infinite Scroll / Load More Action */}
      {hasMore && (
        <div className="pt-8 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors font-semibold text-xs inline-flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {isLoadingMore ? (
              <span>Loading more results...</span>
            ) : (
              <>
                <ArrowDown className="w-4 h-4" />
                <span>Load More Results</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
