# AGENTS.md Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split monolithic `AGENTS.md` into 14 topic-scoped files under `docs/agents/` so AI agents can selectively read only the rules relevant to their current task.

**Architecture:** Move the existing `AGENTS.md` content into topic files (`overview`, `tech-stack`, `structure`, `conventions/*`, `libs/*`, `workflows/*`). Each file gets YAML frontmatter (`title`, `scope`, `applies_to`, `related`) plus a TL;DR blockquote so agents can decide relevance from the first ~10 lines. Replace `AGENTS.md` with a thin index that links to every file. `CLAUDE.md` keeps `@AGENTS.md` as its import entry.

**Tech Stack:** Markdown only — no code changes, no tests, no scripts. Pure documentation refactor.

**Spec reference:** `docs/superpowers/specs/2026-06-03-agents-md-split-design.md`

**Source reference:** Original `AGENTS.md` (`AGENTS.md@HEAD~1` at execution time, since spec commit only added the spec file). Line numbers below refer to AGENTS.md as it exists when this plan begins execution.

**Semantic identity rule:** Body content (rules, examples, code blocks) must be **verbatim** from the original AGENTS.md. Only allowed transformations:
1. Add frontmatter and TL;DR blockquote.
2. Replace `§N.M` cross-references with relative markdown links.
3. Adjust H1/H2 levels to fit the new file (e.g. AGENTS.md's `### 5.1` becomes the new file's `# Module & Path Aliases` H1 with sub-sections demoted accordingly).
4. Fix obvious typos only — do NOT add/remove/reword rules.

---

## File Structure

```text
docs/agents/
├── overview.md
├── tech-stack.md
├── structure.md
├── conventions/
│   ├── module-aliases.md
│   ├── naming.md
│   ├── typescript.md
│   └── react-sections.md
├── libs/
│   ├── zustand-slice.md
│   ├── ky-react-query.md
│   ├── tailwind-daisyui.md
│   └── next-intl.md
└── workflows/
    ├── dev-env.md
    ├── git.md
    └── build-release.md

AGENTS.md                # rewritten as thin index
CLAUDE.md                # references audited
```

## Cross-reference Replacement Map

When copying content, replace these `§` references with markdown links:

| Source line | Original text | Replacement |
|---|---|---|
| AGENTS.md:48 | `see §5.10` | `see "App Router `_layout/`" section below` (same file: structure.md) |
| AGENTS.md:60 | `see §5.9` | `see [next-intl](./libs/next-intl.md)` |
| AGENTS.md:68 | `see §5.9` | `see [next-intl](./libs/next-intl.md)` |
| AGENTS.md:301 | `§5.4 의 // hooks 섹션` | `[React Section Comments](../conventions/react-sections.md) 의 `// hooks` 섹션` |
| AGENTS.md:356 | `§5.2 그대로` | `[File Naming](./conventions/naming.md) 그대로` |
| AGENTS.md:363 | `(§4 Directory Structure 참조)` | `(see "Directory tree" section above)` (same file: structure.md) |
| AGENTS.md:421 | `version pattern in §7.3` | `[version pattern](./git.md#pr-title--version-bump)` |

---

## Task 1: Create directory skeleton

**Files:**
- Create directories: `docs/agents/`, `docs/agents/conventions/`, `docs/agents/libs/`, `docs/agents/workflows/`

- [ ] **Step 1: Create the directory tree**

```bash
mkdir -p docs/agents/conventions docs/agents/libs docs/agents/workflows
```

- [ ] **Step 2: Verify directories exist**

```bash
ls -d docs/agents docs/agents/conventions docs/agents/libs docs/agents/workflows
```

Expected: All four paths print without error.

No commit yet — directories are not tracked by git until they contain files.

---

## Task 2: Create `docs/agents/overview.md`

**Source:** AGENTS.md §1 (lines 7–12).

**Files:**
- Create: `docs/agents/overview.md`

- [ ] **Step 1: Write the file**

```markdown
---
title: Project Overview
scope: docs/**
applies_to: all agents reading this repository
related:
  - ./tech-stack.md
  - ./structure.md
---

# Project Overview

> Next.js application template integrated with the **KeyFlow Authorization Server** through a **Back-End For Front-End (BFF)** layer.

Requests without a valid session are redirected to the login page. The repository ships a pre-configured baseline so new product apps can start from a consistent stack.
```

- [ ] **Step 2: Verify**

```bash
test -s docs/agents/overview.md && head -5 docs/agents/overview.md
```

Expected: First five lines show YAML frontmatter starting with `---`.

---

## Task 3: Create `docs/agents/tech-stack.md`

**Source:** AGENTS.md §2 (lines 14–26).

**Files:**
- Create: `docs/agents/tech-stack.md`

- [ ] **Step 1: Write the file**

```markdown
---
title: Tech Stack
scope: package.json
applies_to: dependency selection, version bumps
related:
  - ./overview.md
  - ./workflows/dev-env.md
---

# Tech Stack

> TypeScript 5 + Next.js 16 (App Router) + React 19. TanStack Query + Zustand + ky + next-intl v4. Tailwind 4 + daisyUI 5.

- **Language:** TypeScript 5 (`strict: true`)
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS 4, daisyUI 5
- **State / Data:** TanStack Query 5, Zustand 5 (immer + devtools middleware)
- **HTTP / Realtime:** ky, sockjs-client, @stomp/stompjs
- **Date / Utility:** dayjs, classnames, lodash, uuid, immer, overlay-kit
- **UI Utilities:** react-icons, timeago-react (+ timeago.js), lottie-react
- **Lint / Format:** `@bob-park/eslint-config-bobpark`, `@bob-park/prettier-config-bobpark`

Refer to `package.json` for exact pinned versions.
```

- [ ] **Step 2: Verify**

```bash
grep -q "TypeScript 5" docs/agents/tech-stack.md && echo OK
```

Expected: `OK`.

---

## Task 4: Create `docs/agents/structure.md`

**Source:** AGENTS.md §4 (lines 43–73) + §5.8 (lines 228–241) + §5.10 (lines 347–390).

**Files:**
- Create: `docs/agents/structure.md`

- [ ] **Step 1: Write the file**

````markdown
---
title: Directory Structure & Layout Rules
scope: src/**
applies_to: adding a new domain, placing layout sub-components, locating modules
related:
  - ./conventions/naming.md
  - ./conventions/module-aliases.md
  - ./libs/next-intl.md
---

# Directory Structure & Layout Rules

> `src/` 는 `app/`, `domain/<name>/{apis,queries,components,store}`, `shared/`, `utils/` 로 나뉜다. layout sub-component 는 같은 디렉토리의 `_layout/` private folder 에 둔다.

## Directory tree

```text
src/
├── app/                # Next.js App Router (pages, layouts, api routes)
│   ├── _layout/        # Root layout 의 sub-components (Header, Contents, Footer) — see "App Router `_layout/`" section below
│   └── api/            # Route handlers (e.g. /api/health)
├── domain/             # Business domains — each domain owns its full slice
│   └── <domain>/
│       ├── apis/       # ky-based fetch functions + *.dto.ts types
│       ├── queries/    # React Query hooks (useXxx) wrapping apis
│       ├── components/ # Domain-scoped components
│       └── store/      # Zustand slice + types
├── shared/             # Reusable across domains
│   ├── api/            # ky instance, common dto (PagedModel, PageRequest)
│   ├── components/     # Cross-cutting components (toast, timeago, timecode, queries)
│   ├── hooks/          # Reusable hooks (useModal, useWebSocket, ...)
│   ├── i18n/           # next-intl config, locale resolution, server action — see [next-intl](./libs/next-intl.md)
│   ├── providers/      # React context providers (theme, ...)
│   ├── queries/        # Shared React Query types/utilities
│   ├── store/          # Root Zustand store (combines domain slices)
│   └── dayjs/          # dayjs configuration / locale setup
├── utils/              # Pure utility functions (no React, no I/O)
└── proxy.ts            # Auth proxy logic — call from a Next.js middleware

messages/               # next-intl translation messages — messages/<locale>.json — see [next-intl](./libs/next-intl.md)
```

Rule: when adding a new domain, create all four sub-folders (`apis`, `queries`, `components`, `store`) even if some start empty. Predictable layout matters more than file count.

## Adding a domain feature

When adding a feature, follow this order:

1. Define types in `src/domain/<name>/apis/<name>.dto.ts`.
2. Add fetchers in `src/domain/<name>/apis/<name>.ts`.
3. Wrap them with React Query hooks in `src/domain/<name>/queries/<name>.tsx`.
4. Build UI in `src/domain/<name>/components/`.
5. If client-only UI state is needed, add a Zustand slice in `src/domain/<name>/store/slice.ts` and register it in `rootStore.ts`.

Cross-domain reuse moves to `src/shared/`. `src/utils/` is for **pure functions only** — no React, no I/O.

## App Router `_layout/`

### Core rule

- 어떤 디렉토리든 `layout.tsx` 가 sub-component 를 필요로 하면, **같은 디렉토리에 `_layout/` private folder** 를 만들어 그 안에 sub-component 를 둔다. underscore prefix 는 Next.js 가 라우트에서 제외하는 [private folder](https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders) 규약이다.
- 파일명은 [File Naming](./conventions/naming.md) 그대로 `PascalCase.tsx`. 예: `Header.tsx`, `Contents.tsx`, `Footer.tsx`, `Sidebar.tsx`.
- `layout.tsx` 에서 import 할 때는 같은 폴더이므로 **상대경로** (`./_layout/Header`) 를 사용한다.
- 다른 layout 의 `_layout/` 컴포넌트는 import 하지 않는다 — 각 `_layout/` 은 그 layout 전용이다.
- Cross-layout 으로 재사용해야 하는 컴포넌트는 `_layout/` 이 아니라 `src/shared/components/<area>/` 로 승격한다 (see "Directory tree" section above).
- 적용 범위: root (`src/app/_layout/`) 와 nested layout (예: `src/app/admin/_layout/`) **모두 동일 규칙**.

### Directory example

```text
src/app/
├── _layout/
│   ├── Header.tsx
│   ├── Contents.tsx
│   └── Footer.tsx
├── admin/
│   ├── _layout/
│   │   └── Sidebar.tsx
│   ├── layout.tsx
│   └── page.tsx
├── layout.tsx
└── page.tsx
```

이 예시에서:

- `src/app/layout.tsx` 는 `./_layout/Header`, `./_layout/Contents`, `./_layout/Footer` 를 사용한다.
- `src/app/admin/layout.tsx` 는 `./_layout/Sidebar` (즉 `src/app/admin/_layout/Sidebar`) 를 사용한다.
- `admin/_layout/Sidebar` 를 root layout 에서 사용하고 싶다면 먼저 `src/shared/components/` 로 승격한다.
````

- [ ] **Step 2: Verify**

```bash
grep -c "^## " docs/agents/structure.md
```

Expected: `3` (Directory tree / Adding a domain feature / App Router `_layout/`).

---

## Task 5: Create `docs/agents/conventions/module-aliases.md`

**Source:** AGENTS.md §5.1 (lines 80–85).

**Files:**
- Create: `docs/agents/conventions/module-aliases.md`

- [ ] **Step 1: Write the file**

```markdown
---
title: Module & Path Aliases
scope: src/**/*.{ts,tsx}
applies_to: import statements across folders
related:
  - ./naming.md
  - ../structure.md
---

# Module & Path Aliases

> Cross-folder import 는 `@/...` alias, same-folder import 는 상대경로. import 순서는 ESLint 가 강제한다.

- Use the `@/...` alias (tsconfig `paths`) for cross-folder imports.
- Use relative paths only within the same folder.
- Import ordering is enforced by the shared ESLint/Prettier config — do not override locally.
```

- [ ] **Step 2: Verify**

```bash
grep -q "@/..." docs/agents/conventions/module-aliases.md && echo OK
```

Expected: `OK`.

---

## Task 6: Create `docs/agents/conventions/naming.md`

**Source:** AGENTS.md §5.2 (lines 87–92).

**Files:**
- Create: `docs/agents/conventions/naming.md`

- [ ] **Step 1: Write the file**

```markdown
---
title: File Naming
scope: src/**
applies_to: creating any new file
related:
  - ./react-sections.md
  - ../structure.md
---

# File Naming

> DTO `*.dto.ts`, ambient `types.d.ts`, 컴포넌트 `PascalCase.tsx`, hook `useXxx.tsx`, 도메인 fetcher `<domain>.ts`.

- API request/response types: `*.dto.ts` (e.g. `users.dto.ts`).
- Ambient global types (no `export`): `types.d.ts`.
- React components: `PascalCase.tsx`. Hooks: `useXxx.tsx`.
- Domain API fetcher files: lowercase domain name (e.g. `users.ts`).
```

- [ ] **Step 2: Verify**

```bash
grep -q "PascalCase.tsx" docs/agents/conventions/naming.md && echo OK
```

Expected: `OK`.

---

## Task 7: Create `docs/agents/conventions/typescript.md`

**Source:** AGENTS.md §5.3 (lines 94–99).

**Files:**
- Create: `docs/agents/conventions/typescript.md`

- [ ] **Step 1: Write the file**

```markdown
---
title: TypeScript
scope: src/**/*.{ts,tsx}
applies_to: type declarations, component props, DTOs
related:
  - ./naming.md
  - ../libs/ky-react-query.md
---

# TypeScript

> `strict: true`. 확장 가능한 객체는 `interface`, union / mapped / DTO 는 `type`. props 는 `Readonly<{...}>`.

- `strict: true` is enabled. Assume non-null and exhaustive checks.
- Use `interface` for object shapes that may be extended.
- Use `type` for unions, mapped types, and DTOs.
- Component props are wrapped in `Readonly<{...}>`.
```

- [ ] **Step 2: Verify**

```bash
grep -q "Readonly" docs/agents/conventions/typescript.md && echo OK
```

Expected: `OK`.

---

## Task 8: Create `docs/agents/conventions/react-sections.md`

**Source:** AGENTS.md §5.4 (lines 101–186).

**Files:**
- Create: `docs/agents/conventions/react-sections.md`

- [ ] **Step 1: Write the file**

````markdown
---
title: React Components & Section Comments
scope: src/**/*.tsx
applies_to: client components ('use client'), client hooks (useXxx.tsx), shared providers
related:
  - ./naming.md
  - ../libs/zustand-slice.md
  - ../libs/ky-react-query.md
---

# React Components & Section Comments

> Server Component 가 기본. `'use client'` 컴포넌트 / client hook / shared provider 는 함수 본문을 11개 고정 순서 섹션 주석으로 구분한다. 사용하지 않는 섹션은 생략 (빈 헤더 금지).

## Server vs Client

- Server Components are the default. Add `'use client'` at the top **only when state, effects, event handlers, or browser APIs are needed**.
- Pattern: `default export` the public component; co-locate small non-reusable sub-components in the same file.

## Section comment order

`'use client'` 컴포넌트, client hook (`useXxx.tsx`), shared provider 는 함수 본문을 아래 섹션 주석으로 구분한다. **순서는 고정**이며 사용하지 않는 섹션은 주석을 **생략**한다 (빈 헤더를 남기지 않는다).

순서:

1. `// ref` — `useRef`
2. `// context` — `useContext`
3. `// state` — `useState`, `useReducer`
4. `// store` — Zustand selector (`useStore(...)`)
5. `// hooks` — 위 섹션에 들어가지 않는 React / 외부 라이브러리 hook (예: Next.js `useRouter`, `usePathname`, `useSearchParams`)
6. `// queries` — React Query hook (`useXxx({...})`, mutation hook 포함)
7. `// useEffect`
8. `// useLayoutEffect`
9. `// handle` — 이벤트 핸들러 / 액션 함수 (`handleXxx`) 등 일반 함수 정의
10. `// memorize` — `useMemo`
11. `// callback` — `useCallback`

같은 섹션 안에서는 여러 줄을 자유롭게 작성한다. 같은 파일에 co-locate 된 sub-component (예: `UserList.tsx` 의 `UserItem`) 도 동일 규칙을 따른다. Server Component (디렉티브 없음) 은 적용 대상이 아니다.

## Standard example

```tsx
'use client';

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useStore } from '@/shared/store/rootStore';
// ContentsContext, useContents 는 도메인별 placeholder

export default function Contents() {
  // ref
  const containerRef = useRef<HTMLDivElement>(null);

  // context
  const { contents } = useContext(ContentsContext);

  // state
  const [open, setOpen] = useState<boolean>(false);

  // store
  const showAddUserModal = useStore((s) => s.showAddUserModal);

  // hooks
  const router = useRouter();

  // queries
  const { list, isLoading } = useContents({ size: 10, page: 0 });

  // useEffect
  useEffect(() => {
    // ...
  }, [open]);

  // handle
  const handleClick = () => {
    // ...
  };

  // memorize
  const memoized = useMemo(() => transform(list), [list]); // expensive transform 예시

  // callback
  const handleSelect = useCallback((id: string) => {
    // ...
  }, []);

  return <div>...</div>;
}
```

## Migration policy

기존 파일은 일괄 마이그레이션하지 않는다. 해당 파일을 다른 작업으로 수정할 때 같은 PR 안에서 점진적으로 정리한다.
````

- [ ] **Step 2: Verify**

```bash
grep -c "^[0-9]\{1,2\}\. \`// " docs/agents/conventions/react-sections.md
```

Expected: `11` (eleven numbered section bullets).

---

## Task 9: Create `docs/agents/libs/zustand-slice.md`

**Source:** AGENTS.md §5.5 (lines 188–200).

**Files:**
- Create: `docs/agents/libs/zustand-slice.md`

- [ ] **Step 1: Write the file**

```markdown
---
title: Zustand Slice Pattern
scope: src/domain/*/store/**, src/shared/store/**
applies_to: declaring or modifying a Zustand slice / store action
related:
  - ../structure.md
  - ../conventions/react-sections.md
---

# Zustand Slice Pattern

> 각 도메인은 `SlicePattern<DomainState, BoundState>` 슬라이스를 노출하고 `rootStore.ts` 에서 합친다. action 이름은 `domain/actionName`. `immer` middleware 활성화.

- Each domain exposes a slice using `SlicePattern<DomainState, BoundState>`. The `SlicePattern` type is provided by a module augmentation in `src/shared/store/types.d.ts` (imported as if from `zustand`).
- Slices are combined in `src/shared/store/rootStore.ts`; the union of all slice state types is `BoundState`.
- Action names follow `domain/actionName` for the devtools `type` field (example: `users/updateShowAddUserModal`).
- `immer` middleware is enabled. Inside `set`, either return a new object literally or rely on immer's draft mutation — do not mix the two styles in the same slice.
```

- [ ] **Step 2: Verify**

```bash
grep -q "SlicePattern" docs/agents/libs/zustand-slice.md && echo OK
```

Expected: `OK`.

---

## Task 10: Create `docs/agents/libs/ky-react-query.md`

**Source:** AGENTS.md §5.6 (lines 202–217).

**Files:**
- Create: `docs/agents/libs/ky-react-query.md`

- [ ] **Step 1: Write the file**

```markdown
---
title: ky + React Query
scope: src/domain/*/apis/**, src/domain/*/queries/**, src/shared/api/**, src/shared/queries/**
applies_to: HTTP requests, query / mutation hooks, pagination
related:
  - ../structure.md
  - ../conventions/typescript.md
---

# ky + React Query

> 공유 `api` 인스턴스는 401 에서 KeyFlow 로그인으로 redirect. browser 전용 — server 코드에서는 `fetch`. Query key 는 `[domain, ...specifier]`. Mutation hook 은 `QueryMutationHandle<T>` 패턴.

- Use the shared `api` instance from `@/shared/api`. It auto-redirects on 401 to `/api/oauth2/authorization/keyflow-auth` (the `KeyFlow` login flow).
- The shared `api` is **browser-only** — it relies on `location.href` for the redirect. From Server Components and Route Handlers, use plain `fetch` instead (see `src/app/layout.tsx` for the pattern).
- React Query keys follow `[domain, ...specifier]`:
  - `['users']`, `['users', id]`, `['users', 'check', userId]`, `['users', 'register']`, etc.
  - Short keys like `['me']` (the current user) are accepted as legacy exceptions but new code should prefer the `[domain, ...specifier]` shape.
- Mutation hooks accept `QueryMutationHandle<T>` (ambient global type with `onSuccess`/`onError`) and return `{ <verb>: mutate, isLoading: isPending }`.
- Pagination uses `PagedModel<T>` and the `getNextPageParams` helper from `@/shared/api`.
```

- [ ] **Step 2: Verify**

```bash
grep -q "QueryMutationHandle" docs/agents/libs/ky-react-query.md && echo OK
```

Expected: `OK`.

---

## Task 11: Create `docs/agents/libs/tailwind-daisyui.md`

**Source:** AGENTS.md §5.7 (lines 219–226).

**Files:**
- Create: `docs/agents/libs/tailwind-daisyui.md`

- [ ] **Step 1: Write the file**

```markdown
---
title: Tailwind 4 + daisyUI 5
scope: src/**/*.{tsx,css}
applies_to: styling components, theme handling
related:
  - ../conventions/react-sections.md
---

# Tailwind 4 + daisyUI 5

> 조건부 class 는 `classnames` (`import cx from 'classnames'`). daisyUI 토큰 (`btn`, `badge`, `menu`, `dropdown`, `modal`) 을 raw Tailwind 보다 우선. 테마는 cookie 기반 `data-theme`.

- Compose class names with `classnames` (`import cx from 'classnames'`). Do not hand-concatenate template strings for conditional classes.
- Prefer daisyUI components/tokens (`btn`, `badge`, `menu`, `dropdown`, `modal`, ...) before reaching for raw Tailwind primitives.
- Theme is cookie-driven via `data-theme` on `<html>`. See `src/shared/providers/theme/ThemeProvider.tsx`.
```

- [ ] **Step 2: Verify**

```bash
grep -q "classnames" docs/agents/libs/tailwind-daisyui.md && echo OK
```

Expected: `OK`.

---

## Task 12: Create `docs/agents/libs/next-intl.md`

**Source:** AGENTS.md §5.9 (lines 243–345). This file combines wiring, locale resolution, message files, server/client usage, and locale change.

**Files:**
- Create: `docs/agents/libs/next-intl.md`

- [ ] **Step 1: Write the file**

````markdown
---
title: next-intl v4
scope: src/shared/i18n/**, src/app/**/{layout,page}.tsx, messages/**
applies_to: i18n wiring, locale resolution, translation usage, locale change
related:
  - ../structure.md
  - ../conventions/react-sections.md
---

# next-intl v4

> next-intl v4 사용. plugin 진입점은 `src/shared/i18n/request.ts`. locale 우선순위 = cookie → Accept-Language → `DEFAULT_LOCALE`. server 는 `getTranslations` / `getMessages`, client 는 `useTranslations` / `useLocale`. locale 변경은 `setLocale` server action.

i18n 라이브러리는 `next-intl` v4 를 사용한다. 라이브러리 버전이 바뀌면 본 문서도 함께 갱신한다 (정확한 핀 버전은 `package.json` 참조).

## Library & wiring

- `next.config.ts` 에서 plugin 으로 wrap 한다. **단일 진입점**:

  ```ts
  // next.config.ts
  const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');
  export default withNextIntl(nextConfig);
  ```

- 런타임 messages 로딩은 `src/shared/i18n/request.ts` 의 `getRequestConfig` 에서 수행한다. 이 파일을 다른 경로로 옮기지 않는다 (plugin 인자가 같이 바뀌어야 함).

## Locale resolution

`src/shared/i18n/locale.ts` 의 `getUserLocale()` (server-only) 가 다음 우선순위로 locale 을 결정한다:

1. `locale` cookie (`COOKIE_NAME_LOCALE`) — 값이 `SUPPORTED_LOCALES` 에 속할 때.
2. `Accept-Language` 헤더 전체 문자열(소문자 변환) 이 `SUPPORTED_LOCALES` 중 하나의 코드로 시작할 때 (예: `"ko-KR,en;q=0.9"` → `'ko'` 매칭).
3. 위 두 조건 모두 실패 → `DEFAULT_LOCALE` (`'ko'`).

`SUPPORTED_LOCALES`, `LOCALE_META`, `DEFAULT_LOCALE`, `COOKIE_NAME_LOCALE`, `LOCALE_COOKIE_MAX_AGE` 는 **모두 `src/shared/i18n/config.ts` 에 한 번만 정의**한다 (single source of truth). 다른 곳에서 같은 상수를 재정의하지 않는다.

## Message files

- 위치: 저장소 루트 `messages/<locale>.json` (예: `messages/ko.json`, `messages/en.json`).
- 키 구조: `namespace.key` 네스팅. 예:

  ```json
  { "metadata": { "title": "...", "description": "..." } }
  ```

- 사용 시 `getTranslations('metadata')` 또는 `useTranslations('metadata')` 처럼 namespace 단위로 호출한다.

### Adding a locale

새 locale 추가 절차 (세 곳을 동기 갱신):

1. `src/shared/i18n/config.ts` 의 `SUPPORTED_LOCALES` 에 코드 추가.
2. 같은 파일의 `LOCALE_META` 에 `{ code, label, htmlLang }` 추가.
3. `messages/<new-locale>.json` 신규 작성 — 기존 locale 의 모든 키를 채운다.

## Usage — server vs client

- **Server Component / Route Handler / `generateMetadata`** — `next-intl/server` 의 `getTranslations(namespace)` (서버에서 직접 렌더링 시) 또는 `getMessages()` (client 트리에 전달할 메시지 번들이 필요할 때, 예: `<NextIntlClientProvider messages={...}>`) 를 사용한다. 동기 hook (`useTranslations`) 은 서버 컴포넌트에서 사용하지 않는다.
- **Client Component** — `next-intl` 의 `useTranslations(namespace)`, `useLocale()` 을 사용한다. `useLocale` / `useTranslations` 은 [React Section Comments](../conventions/react-sections.md) 의 `// hooks` 섹션 아래에 둔다.
- **Client hydration** — `RootLayout` 에서 `<NextIntlClientProvider locale={locale} messages={messages}>` 로 client 트리를 감싼다 (이미 구현됨, `src/app/layout.tsx`).

예시 — Server (metadata) + Client (UI):

```tsx
// src/app/layout.tsx (Server Component) — metadata 에서 사용
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return { title: t('title'), description: t('description') };
}
```

```tsx
// Client Component
'use client';

import { useLocale, useTranslations } from 'next-intl';

export default function Greeting() {
  // hooks
  const t = useTranslations('metadata');
  const locale = useLocale();

  return <span lang={locale}>{t('title')}</span>;
}
```

## Locale change

- 진입 함수: `src/shared/i18n/localeAction.ts` 의 `setLocale(locale)` server action.
  - `locale` cookie 저장 (`maxAge = LOCALE_COOKIE_MAX_AGE`, `sameSite: 'lax'`).
  - `revalidatePath('/', 'layout')` 으로 root layout 재검증 → 새 locale 메시지가 트리에 반영된다.
- UI 진입점: `src/shared/components/i18n/LanguageSwitcher.tsx`. 새로운 locale 변경 UI 가 필요하면 이 컴포넌트를 재사용하거나, 동일하게 `setLocale` + `useTransition` 패턴을 따른다.
- 클라이언트에서 직접 cookie 를 조작하지 않는다 — 항상 `setLocale` 을 통한다.
````

- [ ] **Step 2: Verify**

```bash
grep -c "^## " docs/agents/libs/next-intl.md
```

Expected: `5` (Library & wiring / Locale resolution / Message files / Usage — server vs client / Locale change).

---

## Task 13: Create `docs/agents/workflows/dev-env.md`

**Source:** AGENTS.md §3 (lines 28–41) + §6 (lines 392–397).

**Files:**
- Create: `docs/agents/workflows/dev-env.md`

- [ ] **Step 1: Write the file**

```markdown
---
title: Dev Environment & Lint/Format
scope: package.json, eslint.config.mjs, .mise.toml
applies_to: setting up Node/yarn, running scripts, pre-commit lint/format
related:
  - ../tech-stack.md
  - ./git.md
---

# Dev Environment & Lint/Format

> Node 버전은 `mise` 로 동기화, 패키지 매니저는 corepack `yarn@4.14.1`. 커밋 전 `yarn lint` 필수, 포매팅은 `yarn prettier`. 테스트 러너는 아직 없음.

## Environment

- **Node version manager:** `mise`. First-time setup: `mise trust && mise ls`.
- **Package manager:** `yarn@4.14.1` via corepack (configured in `package.json#packageManager`).

## Common scripts

- `yarn dev` — start the Next.js dev server
- `yarn build` — production build
- `yarn start` — run the production build
- `yarn lint` — run ESLint against `./src`
- `yarn prettier` — format all source files

A test runner is **not** configured yet. When testing is introduced, update this document and `CLAUDE.md`'s command reference.

## Lint & format

- Run `yarn lint` before committing.
- `yarn prettier` auto-formats `**/*.{js,jsx,ts,tsx,css,html}`.
- The shared `@bob-park/*` ESLint and Prettier configs are authoritative. Do not override them locally without team consensus.
```

- [ ] **Step 2: Verify**

```bash
grep -q "mise trust" docs/agents/workflows/dev-env.md && echo OK
```

Expected: `OK`.

---

## Task 14: Create `docs/agents/workflows/git.md`

**Source:** AGENTS.md §7 (lines 399–443).

**Files:**
- Create: `docs/agents/workflows/git.md`

- [ ] **Step 1: Write the file**

```markdown
---
title: Git Workflow
scope: .git/**
applies_to: branching, commits, opening PRs, release tags
related:
  - ./build-release.md
  - ./dev-env.md
---

# Git Workflow

> `master` / `develop` / `feature/*` / `hotfix/*` 4-branch 모델. feature PR base 는 반드시 `develop`. 커밋 prefix = `feat / refactor / fix / build / docs / test`. PR 제목의 `[major]` / `[minor]` 토큰이 version bump 를 결정.

## Branch naming

These are the target conventions. The repository currently ships with `master` only; create `develop` / `feature/*` / `hotfix/*` branches on demand.

- `master` — production-shippable. Release tags are cut from this branch.
- `develop` — next-release integration branch.
- `feature/<topic>` — new feature development.
- `hotfix/<topic>` — patches against an already-released version.

Rules:

- Use lowercase, kebab-case for `<topic>` (e.g., `feature/asset-upload`, `hotfix/jwt-scope-mapping`).
- When opening a PR from a `feature/*` branch, the base branch **MUST** be `develop`. Targeting `master` directly is not allowed for feature work; promotion to `master` happens through a separate `develop` → `master` release PR.
- Do not commit directly to `master` or `develop` — always go through a PR.
- A tag is created on `master` when a release ships; tag name follows the version pattern in [PR title & version bump](#pr-title--version-bump).

## Commit message prefix

Format: `prefix: 한국어 설명`. Follow the existing history style.

- `feat`: 새로운 기능 추가
- `refactor`: 기능 변화 없는 리팩토링 (변수 이름 변경 등)
- `fix`: 버그 / 이슈 수정
- `build`: 패키지 매니저 의존성, 빌드 설정 변경
- `docs`: 문서 또는 주석 작업
- `test`: 테스트 코드 추가 / 수정

## PR title & version bump

The release workflow auto-bumps `package.json` version based on the PR title:

- Title contains `[major]` → major + 1.
- Title contains `[minor]` → minor + 1.
- Otherwise → patch + 1. For same-day PRs the `rc[index]` suffix is incremented instead.

Version pattern: `[major].[minor].[patch]-rc[index]-[yyyyMMdd]`.
```

- [ ] **Step 2: Verify**

```bash
grep -c "^## " docs/agents/workflows/git.md
```

Expected: `3` (Branch naming / Commit message prefix / PR title & version bump).

---

## Task 15: Create `docs/agents/workflows/build-release.md`

**Source:** AGENTS.md §8 (lines 445–455).

**Files:**
- Create: `docs/agents/workflows/build-release.md`

- [ ] **Step 1: Write the file**

````markdown
---
title: Build & Release
scope: docker-compose.yml, Dockerfile, bump-version.sh
applies_to: building Docker images, cutting releases
related:
  - ./git.md
  - ../tech-stack.md
---

# Build & Release

> Multi-arch Docker build = `docker buildx bake`. Image tag = `package.json#version`. 이미지 이름/태그 변경 시 `docker-compose.yml` 갱신.

- Multi-arch Docker build via `docker buildx bake`. Image tag is derived from `package.json#version`.
- Canonical build command (see README for context):

  ```bash
  VERSION=$(node -p "require('./package.json').version") \
    docker buildx bake -f docker-compose.yml --push --provenance false
  ```

- When changing image names or tags, update `docker-compose.yml`.
- Version pattern is defined in the Git workflow ([version pattern](./git.md#pr-title--version-bump)).
````

- [ ] **Step 2: Verify**

```bash
grep -q "docker buildx bake" docs/agents/workflows/build-release.md && echo OK
```

Expected: `OK`.

---

## Task 16: Verify all 14 files exist + commit batch 1

**Files:**
- Stage: all newly created `docs/agents/**/*.md`

- [ ] **Step 1: List every new file**

```bash
find docs/agents -type f -name "*.md" | sort
```

Expected output (exactly these 14 paths):
```
docs/agents/conventions/module-aliases.md
docs/agents/conventions/naming.md
docs/agents/conventions/react-sections.md
docs/agents/conventions/typescript.md
docs/agents/libs/ky-react-query.md
docs/agents/libs/next-intl.md
docs/agents/libs/tailwind-daisyui.md
docs/agents/libs/zustand-slice.md
docs/agents/overview.md
docs/agents/structure.md
docs/agents/tech-stack.md
docs/agents/workflows/build-release.md
docs/agents/workflows/dev-env.md
docs/agents/workflows/git.md
```

If any path is missing or extra, return to the corresponding earlier task and fix before proceeding.

- [ ] **Step 2: Verify every file has frontmatter**

```bash
for f in $(find docs/agents -type f -name "*.md"); do
  head -1 "$f" | grep -q "^---$" || echo "MISSING FRONTMATTER: $f"
done
```

Expected: no output (every file starts with `---`).

- [ ] **Step 3: Verify every file has TL;DR blockquote**

```bash
for f in $(find docs/agents -type f -name "*.md"); do
  grep -q "^> " "$f" || echo "MISSING TL;DR: $f"
done
```

Expected: no output.

- [ ] **Step 4: Verify no stale `§` references remain**

```bash
grep -rn "§" docs/agents/ || echo "OK: no § references"
```

Expected: `OK: no § references`.

- [ ] **Step 5: Stage and commit**

```bash
git add docs/agents
git commit -m "$(cat <<'EOF'
docs: docs/agents/* 토픽별 가이드 파일 신규 작성

AGENTS.md 의 §1~§8 내용을 14개 토픽 파일로 분리.
frontmatter (title, scope, applies_to, related) + TL;DR blockquote 로
agent 가 첫 5~10줄만 보고 적용 여부 판단 가능.

Spec: docs/superpowers/specs/2026-06-03-agents-md-split-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Confirm commit**

```bash
git log --oneline -1
```

Expected: shows `docs: docs/agents/* 토픽별 가이드 파일 신규 작성`.

---

## Task 17: Replace AGENTS.md with thin index

**Files:**
- Modify: `AGENTS.md` (full rewrite)

- [ ] **Step 1: Overwrite AGENTS.md**

Replace the entire contents of `AGENTS.md` with:

```markdown
# AGENTS.md

Convention reference for code agents (Claude Code, Cursor, Codex, Aider, etc.)
working in this repository. 본문은 영어, 도메인/비즈니스 용어는 한국어를 유지한다.

세부 규칙은 `docs/agents/` 아래의 토픽별 문서를 참조한다. 각 문서는
frontmatter (`title`, `scope`, `applies_to`, `related`) 와 TL;DR blockquote 로
시작하므로, 작업 전 해당 파일의 첫 5~10줄만 확인해도 적용 여부를 판단할 수 있다.

## Map

### Foundations
- [Project Overview](docs/agents/overview.md) — KeyFlow BFF Next.js 템플릿의 목적과 경계
- [Tech Stack](docs/agents/tech-stack.md) — 언어/프레임워크/라이브러리 핀 버전 위치
- [Directory & Layout Rules](docs/agents/structure.md) — `src/` 트리, 도메인 추가 절차, `_layout/` 규칙

### Conventions (`src/**/*.{ts,tsx}`)
- [Module & Path Aliases](docs/agents/conventions/module-aliases.md)
- [File Naming](docs/agents/conventions/naming.md)
- [TypeScript](docs/agents/conventions/typescript.md)
- [React Section Comments](docs/agents/conventions/react-sections.md)

### Library Patterns
- [Zustand Slice](docs/agents/libs/zustand-slice.md) — `SlicePattern`, action naming, immer
- [ky + React Query](docs/agents/libs/ky-react-query.md) — 공유 `api`, query key, mutation
- [Tailwind 4 + daisyUI 5](docs/agents/libs/tailwind-daisyui.md) — `classnames`, theme cookie
- [next-intl v4](docs/agents/libs/next-intl.md) — wiring, locale resolution, server/client usage

### Workflows
- [Dev Environment & Lint/Format](docs/agents/workflows/dev-env.md) — `mise`, `yarn`, lint 명령
- [Git Workflow](docs/agents/workflows/git.md) — branch, commit prefix, PR base
- [Build & Release](docs/agents/workflows/build-release.md) — Docker buildx bake, version pattern

## How to use

- 새 도메인 추가 → `structure.md` → `libs/ky-react-query.md` → `libs/zustand-slice.md`
- 새 locale 추가 → `libs/next-intl.md` 의 "Adding a locale" 섹션
- 새 layout sub-component → `structure.md` 의 "App Router `_layout/`" 섹션
- PR 올리기 → `workflows/git.md`
```

- [ ] **Step 2: Verify every link resolves to an existing file**

```bash
grep -oE "docs/agents/[a-zA-Z0-9_/\-]+\.md" AGENTS.md | sort -u | while read p; do
  test -f "$p" || echo "BROKEN: $p"
done
```

Expected: no output (every link resolves).

- [ ] **Step 3: Verify the new AGENTS.md is short**

```bash
wc -l AGENTS.md
```

Expected: under 50 lines (was ~456).

---

## Task 18: Commit AGENTS.md rewrite

- [ ] **Step 1: Stage and commit**

```bash
git add AGENTS.md
git commit -m "$(cat <<'EOF'
refactor: AGENTS.md 를 docs/agents 인덱스로 축약

기존 §1~§8 본문은 docs/agents/* 로 이전 완료.
AGENTS.md 는 진입점 인덱스 역할만 담당하며, CLAUDE.md 의
@AGENTS.md import 는 변경 없이 그대로 동작한다.

Spec: docs/superpowers/specs/2026-06-03-agents-md-split-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 2: Confirm commit**

```bash
git log --oneline -2
```

Expected: top two commits are the AGENTS.md refactor and the docs/agents/* creation.

---

## Task 19: Audit CLAUDE.md for stale AGENTS.md references

**Files:**
- Modify (conditional): `CLAUDE.md`

CLAUDE.md currently contains this passage (around line 20):

> 테스트 스크립트는 현재 `package.json` 에 정의되어 있지 않다. 테스트가 도입되면 본 섹션과 `AGENTS.md` 의 Tech Stack / Dev Environment 를 함께 업데이트한다.

The references to `Tech Stack` / `Dev Environment` need to point at the new file locations.

- [ ] **Step 1: Apply the replacement**

In `CLAUDE.md`, locate this exact block (under the `### 실행 명령어 안내` section, just below the `mise trust && mise ls` bullet):

```
테스트 스크립트는 현재 `package.json` 에 정의되어 있지 않다. 테스트가
도입되면 본 섹션과 `AGENTS.md` 의 Tech Stack / Dev Environment 를 함께
업데이트한다.
```

Replace with:

```
테스트 스크립트는 현재 `package.json` 에 정의되어 있지 않다. 테스트가
도입되면 본 섹션과 `docs/agents/tech-stack.md`,
`docs/agents/workflows/dev-env.md` 를 함께 업데이트한다.
```

Only the trailing `` `AGENTS.md` 의 Tech Stack / Dev Environment `` phrase changes. Everything else (line breaks, surrounding paragraphs) stays identical.

- [ ] **Step 2: Scan for any other AGENTS.md section-name references**

```bash
grep -n "AGENTS.md" CLAUDE.md
```

Expected: at most one remaining hit — the `@AGENTS.md` import on line 3. If any other "AGENTS.md 의 X" or similar phrase remains, replace with the corresponding `docs/agents/*` path.

- [ ] **Step 3: Verify the import still works**

```bash
head -3 CLAUDE.md
```

Expected: line 3 is `@AGENTS.md` (unchanged).

---

## Task 20: Commit CLAUDE.md update (conditional)

Only run this task if Task 19 produced changes.

- [ ] **Step 1: Check for staged-able changes**

```bash
git diff --name-only CLAUDE.md
```

If empty, skip the rest of this task.

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: CLAUDE.md 의 AGENTS.md 옛 섹션 참조 갱신

AGENTS.md 가 인덱스로 축약되면서 Tech Stack / Dev Environment
참조를 docs/agents/* 의 새 경로로 치환한다. @AGENTS.md import 는 유지.

Spec: docs/superpowers/specs/2026-06-03-agents-md-split-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Confirm commit**

```bash
git log --oneline -3
```

Expected: three new commits on top.

---

## Task 21: Final verification

Run the spec §6 checklist against the working tree.

- [ ] **Step 1: AGENTS.md old sections fully mapped**

Open `AGENTS.md@HEAD~3` (or whichever commit precedes the docs commit — adjust if Task 20 was skipped) and walk through each old `##` / `###` heading. For each, identify the target `docs/agents/*.md` file. Confirm 1:1 mapping with this table:

| Old AGENTS.md section | New file |
|---|---|
| §1 Project Overview | `docs/agents/overview.md` |
| §2 Tech Stack | `docs/agents/tech-stack.md` |
| §3 Development Environment | `docs/agents/workflows/dev-env.md` |
| §4 Directory Structure | `docs/agents/structure.md` (top section) |
| §5.1 Module & Path Aliases | `docs/agents/conventions/module-aliases.md` |
| §5.2 File Naming | `docs/agents/conventions/naming.md` |
| §5.3 TypeScript | `docs/agents/conventions/typescript.md` |
| §5.4 React Components | `docs/agents/conventions/react-sections.md` |
| §5.5 Zustand | `docs/agents/libs/zustand-slice.md` |
| §5.6 ky + React Query | `docs/agents/libs/ky-react-query.md` |
| §5.7 Tailwind + daisyUI | `docs/agents/libs/tailwind-daisyui.md` |
| §5.8 Domain-Driven Layout | `docs/agents/structure.md` ("Adding a domain feature") |
| §5.9 i18n | `docs/agents/libs/next-intl.md` |
| §5.10 App Router Layout | `docs/agents/structure.md` ("App Router `_layout/`") |
| §6 Linting & Formatting | `docs/agents/workflows/dev-env.md` ("Lint & format") |
| §7 Git Workflow | `docs/agents/workflows/git.md` |
| §8 Build & Release | `docs/agents/workflows/build-release.md` |

- [ ] **Step 2: No stale `§` references anywhere in docs/agents/**

```bash
grep -rn "§" docs/agents/ AGENTS.md || echo "OK"
```

Expected: `OK`.

- [ ] **Step 3: Every new file has all four frontmatter keys**

```bash
for f in $(find docs/agents -type f -name "*.md"); do
  for k in title scope applies_to related; do
    grep -q "^$k:" "$f" || echo "MISSING $k in $f"
  done
done
```

Expected: no output.

- [ ] **Step 4: All AGENTS.md links resolve**

```bash
grep -oE "docs/agents/[a-zA-Z0-9_/\-]+\.md" AGENTS.md | sort -u | while read p; do
  test -f "$p" || echo "BROKEN: $p"
done
```

Expected: no output.

- [ ] **Step 5: Sanity-check commit log**

```bash
git log --oneline -5
```

Expected (top to bottom; bottom-most line is the spec commit from earlier):
1. (optional) `docs: CLAUDE.md 의 AGENTS.md 옛 섹션 참조 갱신`
2. `refactor: AGENTS.md 를 docs/agents 인덱스로 축약`
3. `docs: docs/agents/* 토픽별 가이드 파일 신규 작성`
4. `docs: AGENTS.md 분리 설계 스펙 추가`
5. (previous master HEAD)

If steps 1–4 are all present, the split is complete.
