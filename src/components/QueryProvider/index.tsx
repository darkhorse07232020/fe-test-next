"use client";

import { ReactNode, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface QueryProviderProps {
  children: ReactNode;
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry(failureCount, error) {
          if (failureCount > 3) {
            return false;
          }

          if (error instanceof Error) {
            const message = error.message;
            if (message.includes("429") || message.includes("5")) {
              return true;
            }
          }

          return false;
        },
        retryDelay(attemptIndex) {
          const baseDelay = 1000;
          const maxDelay = 30000;
          const delay = baseDelay * 2 ** attemptIndex;
          return Math.min(delay, maxDelay);
        },
        staleTime: 1000 * 60,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
  });
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState<QueryClient>(() => createQueryClient());

  return (
    <QueryErrorResetBoundary>
      {() => (
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      )}
    </QueryErrorResetBoundary>
  );
}

