import { QueryClient } from '@tanstack/react-query';

// Single app-wide client, importable outside React (login/logout clear it so
// one device switching accounts never shows the previous user's cached data).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
