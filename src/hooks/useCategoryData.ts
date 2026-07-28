import { useState, useEffect, useCallback, useRef } from "react";
import { CategoryApiResponse, CategoryType } from "../types";
import { fetchCategoryData } from "../services/api";

export function useCategoryData(topic: string, activeCategory: CategoryType) {
  const [data, setData] = useState<CategoryApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Track the current active request to prevent race conditions when tabs switch quickly
  const lastRequestRef = useRef<{ topic: string; category: CategoryType; page: number }>({
    topic: "",
    category: activeCategory,
    page: 1,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset and load first page on category or topic change
  const loadCategory = useCallback(
    async (pageNum = 1, append = false) => {
      if (!topic) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      lastRequestRef.current = { topic, category: activeCategory, page: pageNum };

      if (pageNum === 1 && !append) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await fetchCategoryData(topic, activeCategory, pageNum, 10, false, controller.signal);

        // Verify request is still relevant
        if (
          lastRequestRef.current.topic.toLowerCase() !== topic.toLowerCase() ||
          lastRequestRef.current.category !== activeCategory
        ) {
          return;
        }

        setData((prevData) => {
          if (append && prevData) {
            return {
              ...response,
              items: [...prevData.items, ...response.items],
            };
          }
          return response;
        });

        setPage(pageNum);
        setHasMore(response.pagination?.hasMore || false);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        if (
          lastRequestRef.current.topic.toLowerCase() === topic.toLowerCase() &&
          lastRequestRef.current.category === activeCategory
        ) {
          setError(err.message || `Failed to load ${activeCategory} data.`);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [topic, activeCategory]
  );

  useEffect(() => {
    setData(null);
    setPage(1);
    setHasMore(false);
    loadCategory(1, false);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [topic, activeCategory, loadCategory]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadCategory(page + 1, true);
    }
  }, [isLoadingMore, hasMore, page, loadCategory]);

  return {
    data,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refetch: () => loadCategory(1, false),
  };
}
