"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/lib/constants";
import type { TrailerListItem } from "@/lib/types";

export interface UseTrailersResult {
  data: TrailerListItem[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTrailers(): UseTrailersResult {
  const [data, setData] = useState<TrailerListItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrailers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/trailers`);
      if (!res.ok) {
        throw new Error(`Failed to load trailers: ${res.status}`);
      }
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load trailers"));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrailers();
  }, [fetchTrailers]);

  return { data, isLoading, error, refetch: fetchTrailers };
}
