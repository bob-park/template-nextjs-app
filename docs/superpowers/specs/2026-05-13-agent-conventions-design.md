# Agent & Claude Code Conventions — Design

Date: 2026-05-13
Status: Approved

## 1. Goal

Establish two convention documents at the repository root so that any code agent
(Claude Code, Cursor, Codex, Aider, etc.) can pick up the project's stack,
structure, coding style, and Git workflow without re-discovering them every
session.

- `AGENTS.md` — single source of truth. Agent-agnostic conventions.
- `CLAUDE.md` — thin layer that imports `AGENTS.md` and adds Claude Code-only
  rules (Plan Mode, command reference, design-prompt handling).

Tone: body in English, but domain / business-context phrases stay in Korean
(the team and the upstream auth system `KeyFlow` are Korean-speaking).
Convention sections are explanation-first; ESLint/Prettier-enforced rules are
excluded — only project-specific patterns are documented.

## 2. AGENTS.md — Outline

The single source of truth for all agents. Sections below; each kept terse,
conclusion-first, with no code examples unless a pattern cannot be conveyed in
prose.

### 2.1 Project Overview

- One paragraph: "Next.js app template integrated with `KeyFlow Authorization
  Server` via a BFF layer. Unauthenticated requests redirect to the login
  page." (Korean phrasing preserved for `KeyFlow` and BFF references.)

### 2.2 Tech Stack

Bulleted list — versions match `package.json`:

- TypeScript 5, Next.js 16 (App Router), React 19
- Tailwind CSS 4, daisyUI 5
- TanStack Query 5, Zustand 5 (+ immer, devtools middleware)
- ky (HTTP), dayjs, sockjs-client, @stomp/stompjs
- Lint/format: `@bob-park/eslint-config-bobpark`, `@bob-park/prettier-config-bobpark`

### 2.3 Development Environment

- Node 버전 관리: `mise`. First-time: `mise trust && mise ls`.
- Package manager: `yarn@4.14.1` via corepack.
- Scripts: `yarn dev` / `yarn build` / `yarn start` / `yarn lint` / `yarn prettier`.

### 2.4 Directory Structure

```text
src/
├── app/                # Next.js App Router (pages, layouts, api routes)
│   └── api/            # Route handlers
├── domain/             # Business domains — each domain owns its slice
│   └── <domain>/
│       ├── apis/       # ky-based fetch functions + *.dto.ts types
│       ├── queries/    # React Query hooks (useXxx) wrapping apis
│       ├── components/ # Domain-scoped components
│       └── store/      # Zustand slice + types
├── shared/             # Reusable across domains
│   ├── api/            # ky instance, common dto (PagedModel, PageRequest)
│   ├── components/     # Cross-cutting components (toast, timeago, providers)
│   ├── hooks/          # Reusable hooks
│   ├── providers/      # React context providers (theme, etc.)
│   ├── queries/        # Shared React Query types/utilities
│   ├── store/          # Root Zustand store (combines domain slices)
│   └── dayjs/          # dayjs config / locale setup
├── utils/              # Pure utility functions (date, auth, delay, ...)
└── proxy.ts            # Auth proxy / middleware logic
```

Rule: when adding a new domain, create the four sub-folders (`apis`, `queries`,
`components`, `store`) even if some start empty — keeps the layout predictable.

### 2.5 Coding Conventions

#### 2.5.1 Module & Path Aliases

- Use `@/...` (tsconfig `paths`) for all cross-folder imports. Relative paths
  only within the same folder.
- Import order is enforced by Prettier/ESLint config — don't fight it.

#### 2.5.2 File Naming

- DTO/type files for API request/response: `*.dto.ts` (e.g. `users.dto.ts`).
- Ambient global types (no `export`): `types.d.ts`.
- React components: `PascalCase.tsx`. Hooks: `useXxx.tsx`.
- API fetchers: lowercase domain name (`users.ts`).

#### 2.5.3 TypeScript

- `strict: true` is on — assume non-null and exhaustive checks.
- Prefer `interface` for object shapes that may be extended, `type` for unions
  / mapped types / DTOs.
- Component props: wrap in `Readonly<{...}>`.

#### 2.5.4 React Components

- Mark interactive components with `'use client'` at the top of the file.
- Server Components are the default — only opt out when necessary
  (state, effects, event handlers, browser APIs).
- Component pattern: `default export` the public component; co-locate small
  sub-components in the same file when they are not reused.

#### 2.5.5 State Management — Zustand

- Each domain exposes a slice via `SlicePattern<DomainState, BoundState>`.
- Slices are combined in `shared/store/rootStore.ts` (`BoundState` union).
- Action names use `domain/actionName` for the devtools `type` field
  (e.g. `users/updateShowAddUserModal`).
- `immer` middleware is enabled — mutate inside `set(() => ({...}))` only if
  returning a new object; do not mix patterns in one slice.

#### 2.5.6 Data Fetching — ky + React Query

- Use the shared `api` instance from `@/shared/api`. It handles 401 redirect to
  the `KeyFlow` login flow.
- React Query keys follow `[domain, ...specifier]` (e.g. `['users']`,
  `['users', id]`, `['users', 'check', userId]`).
- Mutation hooks accept `QueryMutationHandle<T>` (ambient type with
  `onSuccess` / `onError`) and return `{ <verb>: mutate, isLoading }`.
- Pagination uses `PagedModel<T>` + `getNextPageParams` helper from
  `@/shared/api`.

#### 2.5.7 Styling — Tailwind 4 + daisyUI 5

- Class composition via `classnames` (`import cx from 'classnames'`). Do not
  hand-concatenate template strings for conditional classes.
- Prefer daisyUI components/tokens (`btn`, `badge`, `menu`, `dropdown`) before
  reaching for raw Tailwind primitives.
- Theme is cookie-driven via `data-theme` on `<html>` — see
  `shared/providers/theme/ThemeProvider.tsx`.

#### 2.5.8 Domain-Driven Layout

When adding a feature:

1. Define types in `domain/<name>/apis/<name>.dto.ts`.
2. Add fetchers in `domain/<name>/apis/<name>.ts`.
3. Wrap them with React Query hooks in `domain/<name>/queries/<name>.tsx`.
4. Build UI in `domain/<name>/components/`.
5. If client-only UI state is needed, add a Zustand slice in
   `domain/<name>/store/slice.ts` and register it in `rootStore.ts`.

Cross-domain reuse goes to `shared/`. `utils/` is for pure functions only
(no React, no I/O).

### 2.6 Linting & Formatting

- Run `yarn lint` before committing.
- `yarn prettier` auto-formats `**/*.{js,jsx,ts,tsx,css,html}`.
- The shared `@bob-park/*` configs are authoritative — do not override locally
  without team consensus.

### 2.7 Git Workflow

#### 2.7.1 Branch Naming

- `master` — production-shippable. Releases tag this branch.
- `develop` — next-release integration branch.
- `feature/<topic>` — new feature development.
- `hotfix/<topic>` — patches against a released version.

#### 2.7.2 Commit Message Prefix

- `feat`: 새로운 기능 추가
- `refactor`: 동작 변화 없는 리팩토링 (변수 이름 등)
- `fix`: 버그 / 이슈 수정
- `build`: 패키지 매니저 의존성, 빌드 설정 변경
- `docs`: 문서 또는 주석 작업
- `test`: 테스트 코드 추가/수정

Format: `prefix: 한국어 설명` (commit history convention).

#### 2.7.3 PR Title & Version Bump

The release workflow auto-bumps `package.json` version based on the PR title:

- Title contains `[major]` → major +1.
- Title contains `[minor]` → minor +1.
- Otherwise → patch +1 (same-day PR increments `rc[index]` instead).

Version pattern: `[major].[minor].[patch]-rc[index]-[yyyyMMdd]`.

### 2.8 Build & Release

- Multi-arch Docker build via `docker buildx bake`. Image tag is derived from
  `package.json` `version`.
- Standard command (see README for the canonical line):
  `VERSION=$(node -p "require('./package.json').version") docker buildx bake -f docker-compose.yml --push --provenance false`

## 3. CLAUDE.md — Outline

Imports AGENTS.md, then adds Claude Code-only rules.

```text
@AGENTS.md

## Claude Code 전용 규칙

### Plan Mode
- 큰 변경(파일 3개 이상 / 새 기능 / 마이그레이션) 은 plan mode 로 진행한다.

### 실행 명령어 안내
- yarn dev / build / start / lint / prettier
- mise trust / mise ls (Node 버전)
- 테스트 스크립트는 현재 없음 — 도입 시 본 섹션과 AGENTS.md 의 Tech Stack 을 함께 업데이트

### 디자인 프롬프트 처리
사용자가 UI/디자인 관련 요청(목업, 레이아웃 비교, 비주얼 컴포넌트) 을 줄 때:
1. superpowers brainstorming 단계에서 visual companion 사용을 먼저 제안
2. 동의 시 정적 HTML 목업을 `./docs/design/<topic>/` 아래에 작성
   (날짜 prefix 권장: `./docs/design/2026-05-13-<topic>/`)
3. `npx serve ./docs/design/<topic>` 또는 `python3 -m http.server` 로 로컬 HTTP 서버 구동, URL 안내
4. 사용자 피드백을 받아 반복, 최종 합의된 디자인만 실제 코드에 반영
5. 서버 포트는 사용자에게 알리고, 작업 종료 시 정리
```

## 4. Out of Scope

- Test conventions — no test runner is configured yet. Will be added when
  testing is introduced.
- CI configuration details — covered by `.github/workflows/` and the bump
  script; the convention doc only references their existence.
- Refactoring existing code to better fit the conventions — this spec only
  documents current patterns.

## 5. Implementation Notes

- `AGENTS.md` and `CLAUDE.md` already exist (empty / minimal). They will be
  overwritten / extended in place.
- Commit messages for the implementation:
  - `docs: AGENTS.md 컨벤션 문서 작성`
  - `docs: CLAUDE.md Claude Code 전용 규칙 추가`
