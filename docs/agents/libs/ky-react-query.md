---
title: ky + React Query
scope: src/domain/*/apis/**, src/domain/*/queries/**, src/shared/api/**, src/shared/queries/**, src/app/**/layout.tsx
applies_to: HTTP requests, query / mutation hooks, pagination, server-side fetch, RQ provider setup
related:
  - ../structure.md
  - ../conventions/typescript.md
  - ../conventions/naming.md
---

# ky + React Query

> Browser 에서는 공유 `api` (ky) + React Query, server 에서는 `fetch` + React `cache()`. Query key = `[domain, ...specifier]`. Mutation hook 은 `QueryMutationHandle<T>`. RQProvider 는 `staleTime: 60s` / `gcTime: 120s` / `refetchOnWindowFocus: false` default.

## Client-side: shared `api` (ky)

- Use the shared `api` instance from `@/shared/api`. It auto-redirects on 401 to `/api/oauth2/authorization/keyflow-auth` (the `KeyFlow` login flow).
- The shared `api` is **browser-only** — it relies on `location.href` for the redirect.
- React Query keys follow `[domain, ...specifier]`:
  - `['users']`, `['users', id]`, `['users', 'check', userId]`, `['users', 'register']`, etc.
  - Sub-resource keys nest the sub-resource name: `['sessions', 'chairs', sessionId]`, `['sessions', 'reviewers', sessionId, id]`.
  - Short keys like `['me']` (the current user) are accepted as legacy exceptions but new code should prefer the `[domain, ...specifier]` shape.
- Mutation hooks accept `QueryMutationHandle<T>` (ambient global type with `onSuccess`/`onError`) and return `{ <verb>: mutate, isLoading: isPending }`.
- Pagination uses `PagedModel<T>` and the `getNextPageParams` helper from `@/shared/api`.

## Server-side: `fetch` + React `cache()`

Server Components, Route Handlers, and `generateMetadata` cannot use the shared `api` — use plain `fetch` and wrap with React's `cache()` to de-dup within the same request.

```tsx
// src/app/(selected)/conferences/[id]/layout.tsx
import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Conference } from '@/domain/conferences/apis/conferences.dto';

const { WEB_SERVICE_HOST } = process.env;
const COOKIE_ACCESS_TOKEN = 'auth-token';

const getConference = cache(async ({ id, authToken }: { id: string; authToken: string }) => {
  const response = await fetch(`${WEB_SERVICE_HOST}/conferences/${id}`, {
    method: 'get',
    headers: { Cookie: `${COOKIE_ACCESS_TOKEN}=${authToken}` },
  });

  if (!response.ok) {
    notFound();
  }

  return (await response.json()) as Conference;
});

export default async function ConferenceLayout({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const { id } = await params;
  const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value || '';

  const conference = await getConference({ id, authToken: accessToken });
  // ...
}
```

규칙:

- `${WEB_SERVICE_HOST}/...` 로 KeyFlow internal BFF endpoint 를 직접 호출한다 (server-to-server).
- Cookie 는 `next/headers` 의 `cookies()` 에서 읽어 fetch 의 `Cookie` 헤더에 직접 첨부 — browser 의 자동 cookie 전송에 의존하지 않는다.
- `cache(...)` 로 wrap 하면 같은 request lifecycle 안에서 동일 인자 호출이 한 번만 실행된다 (예: layout + page 가 같은 데이터를 부르더라도 fetch 1회).
- 실패 시 `notFound()` / `forbidden()` 등 Next.js navigation 함수를 직접 호출해 special file (`not-found.tsx`, `forbidden.tsx`) 로 분기.

## RQProvider — client query client

`src/shared/components/queries/RQProvider.tsx` 에서 `QueryClient` 와 default options 를 한 번 정의하고 client tree 를 감싼다.

```tsx
// src/shared/components/queries/RQProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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
      {children}
      <ReactQueryDevtools initialIsOpen={process.env.NODE_ENV !== 'production'} />
    </QueryClientProvider>
  );
}
```

- `staleTime: 60s` — admin tool 특성상 60초 내 재조회 억제.
- `refetchOnWindowFocus: false` — focus 마다 refetch 하지 않음.
- Devtools 는 production 빌드에서 자동 비활성.

## Root layout: `HydrationBoundary` + `dehydrate`

Server component (root layout) 에서 server-prefetched 상태를 client RQ tree 로 넘기려면 `HydrationBoundary` 를 사용한다.

```tsx
// src/app/layout.tsx
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = new QueryClient();
  const dehydratedState = dehydrate(queryClient);

  return (
    <html>
      <body>
        <RQProvider>
          <HydrationBoundary state={dehydratedState}>
            {children}
          </HydrationBoundary>
        </RQProvider>
      </body>
    </html>
  );
}
```

- `QueryClient` 는 layout 안에서 새로 생성 (서버 요청마다 fresh state).
- 서버에서 미리 prefetch 한 데이터를 client 가 이어받게 하려면 layout 안에서 `queryClient.prefetchQuery(...)` 호출 후 `dehydrate` 결과를 boundary 에 넘긴다.
- `RQProvider` (client component) 가 client tree 의 `QueryClientProvider` 를 담당, `HydrationBoundary` 가 hydration 데이터를 흘려보낸다.
