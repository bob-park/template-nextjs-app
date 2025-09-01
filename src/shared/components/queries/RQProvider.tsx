'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { OverlayProvider } from 'overlay-kit';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retryOnMount: true,
      refetchOnReconnect: true,
      staleTime: 60 * 1_000,
      gcTime: 120 * 1_000,
    },
  },
});

export default function RQProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>{children}</OverlayProvider>
      <ReactQueryDevtools initialIsOpen={process.env.NODE_ENV !== 'production'} />
    </QueryClientProvider>
  );
}
