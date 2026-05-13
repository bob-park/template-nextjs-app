# AGENTS.md

Convention reference for code agents (Claude Code, Cursor, Codex, Aider, etc.)
working in this repository. Body is written in English; domain and
business-context phrases stay in Korean.

## 1. Project Overview

Next.js application template integrated with the **KeyFlow Authorization
Server** through a **Back-End For Front-End (BFF)** layer. Requests without a
valid session are redirected to the login page. The repository ships a
pre-configured baseline so new product apps can start from a consistent stack.

## 2. Tech Stack

- **Language:** TypeScript 5 (`strict: true`)
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS 4, daisyUI 5
- **State / Data:** TanStack Query 5, Zustand 5 (immer + devtools middleware)
- **HTTP / Realtime:** ky, sockjs-client, @stomp/stompjs
- **Date / Utility:** dayjs, classnames, lodash, uuid, immer, overlay-kit
- **UI Utilities:** react-icons, timeago-react (+ timeago.js), lottie-react
- **Lint / Format:** `@bob-park/eslint-config-bobpark`,
  `@bob-park/prettier-config-bobpark`

Refer to `package.json` for exact pinned versions.

## 3. Development Environment

- **Node version manager:** `mise`. First-time setup: `mise trust && mise ls`.
- **Package manager:** `yarn@4.14.1` via corepack (configured in
  `package.json#packageManager`).
- **Common scripts:**
  - `yarn dev` — start the Next.js dev server
  - `yarn build` — production build
  - `yarn start` — run the production build
  - `yarn lint` — run ESLint against `./src`
  - `yarn prettier` — format all source files

A test runner is **not** configured yet. When testing is introduced, update
both this section and `CLAUDE.md` command reference.

## 4. Directory Structure

```text
src/
├── app/                # Next.js App Router (pages, layouts, api routes)
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
│   ├── providers/      # React context providers (theme, ...)
│   ├── queries/        # Shared React Query types/utilities
│   ├── store/          # Root Zustand store (combines domain slices)
│   └── dayjs/          # dayjs configuration / locale setup
├── utils/              # Pure utility functions (no React, no I/O)
└── proxy.ts            # Auth proxy logic — call from a Next.js middleware
```

Rule: when adding a new domain, create all four sub-folders (`apis`,
`queries`, `components`, `store`) even if some start empty. Predictable
layout matters more than file count.

## 5. Coding Conventions

Explanation-first. ESLint/Prettier-enforced rules are omitted — only
project-specific patterns are documented here.

### 5.1 Module & Path Aliases

- Use the `@/...` alias (tsconfig `paths`) for cross-folder imports.
- Use relative paths only within the same folder.
- Import ordering is enforced by the shared ESLint/Prettier config — do not
  override locally.

### 5.2 File Naming

- API request/response types: `*.dto.ts` (e.g. `users.dto.ts`).
- Ambient global types (no `export`): `types.d.ts`.
- React components: `PascalCase.tsx`. Hooks: `useXxx.tsx`.
- Domain API fetcher files: lowercase domain name (e.g. `users.ts`).

### 5.3 TypeScript

- `strict: true` is enabled. Assume non-null and exhaustive checks.
- Use `interface` for object shapes that may be extended.
- Use `type` for unions, mapped types, and DTOs.
- Component props are wrapped in `Readonly<{...}>`.

### 5.4 React Components

- Server Components are the default. Add `'use client'` at the top **only when
  state, effects, event handlers, or browser APIs are needed**.
- Pattern: `default export` the public component; co-locate small
  non-reusable sub-components in the same file.

### 5.5 State Management — Zustand

- Each domain exposes a slice using
  `SlicePattern<DomainState, BoundState>`. The `SlicePattern` type is provided
  by a module augmentation in `src/shared/store/types.d.ts` (imported as if
  from `zustand`).
- Slices are combined in `src/shared/store/rootStore.ts`; the union of all
  slice state types is `BoundState`.
- Action names follow `domain/actionName` for the devtools `type` field
  (example: `users/updateShowAddUserModal`).
- `immer` middleware is enabled. Inside `set`, either return a new object
  literally or rely on immer's draft mutation — do not mix the two styles in
  the same slice.

### 5.6 Data Fetching — ky + React Query

- Use the shared `api` instance from `@/shared/api`. It auto-redirects on 401
  to `/api/oauth2/authorization/keyflow-auth` (the `KeyFlow` login flow).
- The shared `api` is **browser-only** — it relies on `location.href` for the
  redirect. From Server Components and Route Handlers, use plain `fetch`
  instead (see `src/app/layout.tsx` for the pattern).
- React Query keys follow `[domain, ...specifier]`:
  - `['users']`, `['users', id]`, `['users', 'check', userId]`,
    `['users', 'register']`, etc.
  - Short keys like `['me']` (the current user) are accepted as legacy
    exceptions but new code should prefer the `[domain, ...specifier]` shape.
- Mutation hooks accept `QueryMutationHandle<T>` (ambient global type with
  `onSuccess`/`onError`) and return `{ <verb>: mutate, isLoading: isPending }`.
- Pagination uses `PagedModel<T>` and the `getNextPageParams` helper from
  `@/shared/api`.

### 5.7 Styling — Tailwind 4 + daisyUI 5

- Compose class names with `classnames` (`import cx from 'classnames'`). Do
  not hand-concatenate template strings for conditional classes.
- Prefer daisyUI components/tokens (`btn`, `badge`, `menu`, `dropdown`,
  `modal`, ...) before reaching for raw Tailwind primitives.
- Theme is cookie-driven via `data-theme` on `<html>`. See
  `src/shared/providers/theme/ThemeProvider.tsx`.

### 5.8 Domain-Driven Layout

When adding a feature, follow this order:

1. Define types in `src/domain/<name>/apis/<name>.dto.ts`.
2. Add fetchers in `src/domain/<name>/apis/<name>.ts`.
3. Wrap them with React Query hooks in
   `src/domain/<name>/queries/<name>.tsx`.
4. Build UI in `src/domain/<name>/components/`.
5. If client-only UI state is needed, add a Zustand slice in
   `src/domain/<name>/store/slice.ts` and register it in `rootStore.ts`.

Cross-domain reuse moves to `src/shared/`. `src/utils/` is for **pure
functions only** — no React, no I/O.

## 6. Linting & Formatting

- Run `yarn lint` before committing.
- `yarn prettier` auto-formats `**/*.{js,jsx,ts,tsx,css,html}`.
- The shared `@bob-park/*` ESLint and Prettier configs are authoritative.
  Do not override them locally without team consensus.

## 7. Git Workflow

### 7.1 Branch Naming

These are the target conventions. The repository currently ships with
`master` only; create `develop` / `feature/*` / `hotfix/*` branches on demand.

- `master` — production-shippable. Release tags are cut from this branch.
- `develop` — next-release integration branch.
- `feature/<topic>` — new feature development.
- `hotfix/<topic>` — patches against an already-released version.

Rules:

- Use lowercase, kebab-case for `<topic>` (e.g., `feature/asset-upload`,
  `hotfix/jwt-scope-mapping`).
- When opening a PR from a `feature/*` branch, the base branch **MUST** be
  `develop`. Targeting `master` directly is not allowed for feature work;
  promotion to `master` happens through a separate `develop` → `master`
  release PR.
- Do not commit directly to `master` or `develop` — always go through a PR.
- A tag is created on `master` when a release ships; tag name follows the
  version pattern in §7.3.

### 7.2 Commit Message Prefix

Format: `prefix: 한국어 설명`. Follow the existing history style.

- `feat`: 새로운 기능 추가
- `refactor`: 기능 변화 없는 리팩토링 (변수 이름 변경 등)
- `fix`: 버그 / 이슈 수정
- `build`: 패키지 매니저 의존성, 빌드 설정 변경
- `docs`: 문서 또는 주석 작업
- `test`: 테스트 코드 추가 / 수정

### 7.3 PR Title & Version Bump

The release workflow auto-bumps `package.json` version based on the PR title:

- Title contains `[major]` → major + 1.
- Title contains `[minor]` → minor + 1.
- Otherwise → patch + 1. For same-day PRs the `rc[index]` suffix is
  incremented instead.

Version pattern: `[major].[minor].[patch]-rc[index]-[yyyyMMdd]`.

## 8. Build & Release

- Multi-arch Docker build via `docker buildx bake`. Image tag is derived from
  `package.json#version`.
- Canonical build command (see README for context):

  ```bash
  VERSION=$(node -p "require('./package.json').version") \
    docker buildx bake -f docker-compose.yml --push --provenance false
  ```
- When changing image names or tags, update `docker-compose.yml`.
