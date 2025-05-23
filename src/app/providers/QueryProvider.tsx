"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Much more aggressive caching for faster loads
            staleTime: 10 * 60 * 1000, // 10 minutes fresh
            gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
            retry: 1, // Fewer retries for faster failures
            retryDelay: 500, // Faster retry delay
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Don't refetch if data exists
            refetchOnReconnect: false,
            networkMode: "online",
          },
          mutations: {
            retry: 1,
            retryDelay: 500,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 