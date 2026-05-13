# Agent & Claude Code Conventions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write `AGENTS.md` (single source of truth for all code agents) and `CLAUDE.md` (thin import + Claude Code-only rules) at the repository root.

**Architecture:** `CLAUDE.md` uses `@AGENTS.md` to import the agent-agnostic convention doc, then appends Claude Code-specific rules (Plan Mode, command reference, design prompt handling). The reference spec is `docs/superpowers/specs/2026-05-13-agent-conventions-design.md`.

**Tech Stack:** Markdown only. No code changes. Affects: project root `AGENTS.md`, `CLAUDE.md`, and a new directory placeholder `docs/design/`.

---

## File Structure

- **Modify:** `AGENTS.md` — currently empty, will be populated with 8 sections (Project Overview, Tech Stack, Dev Environment, Directory Structure, Coding Conventions, Linting & Formatting, Git Workflow, Build & Release).
- **Modify:** `CLAUDE.md` — currently has `@AGENTS.md` + minimal Plan Mode rule, will be extended with command reference and design prompt sections.
- **Create:** `docs/design/README.md` — placeholder establishing the design-prompt template directory.

No source code under `src/` is changed. No test runner is configured, so this plan has no TDD steps; verification is done by inspection and running `yarn lint` to confirm nothing else broke.

---

### Task 1: Write AGENTS.md — sections 1–4 (Overview, Stack, Environment, Directory)

**Files:**
- Modify: `AGENTS.md` (currently empty, 0 bytes)

- [ ] **Step 1: Replace `AGENTS.md` with the following content (sections 1–4 only; sections 5–8 added in next task)**

```markdown
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
│   ├── components/     # Cross-cutting components (toast, timeago, queries)
│   ├── hooks/          # Reusable hooks (useModal, useWebSocket, ...)
│   ├── providers/      # React context providers (theme, ...)
│   ├── queries/        # Shared React Query types/utilities
│   ├── store/          # Root Zustand store (combines domain slices)
│   └── dayjs/          # dayjs configuration / locale setup
├── utils/              # Pure utility functions (no React, no I/O)
└── proxy.ts            # Auth proxy / middleware logic
```

Rule: when adding a new domain, create all four sub-folders (`apis`,
`queries`, `components`, `store`) even if some start empty. Predictable
layout matters more than file count.
```

- [ ] **Step 2: Verify file content**

Run: `head -60 AGENTS.md`
Expected: file begins with `# AGENTS.md` and ends mid-section-4 with the predictable-layout rule.

- [ ] **Step 3: Do NOT commit yet** — sections 5–8 added in Task 2; commit happens after AGENTS.md is fully written.

---

### Task 2: Write AGENTS.md — sections 5–8 (Coding, Lint, Git, Build)

**Files:**
- Modify: `AGENTS.md` (append after section 4)

- [ ] **Step 1: Append the following content to `AGENTS.md`**

```markdown

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
  `SlicePattern<DomainState, BoundState>` from `zustand`.
- Slices are combined in `src/shared/store/rootStore.ts`; the union of all
  slice state types is `BoundState`.
- Action names follow `domain/actionName` for the devtools `type` field
  (example: `users/updateShowAddUserModal`).
- `immer` middleware is enabled. Inside `set`, either return a new object
  literally or rely on immer's draft mutation — do not mix the two styles in
  the same slice.

### 5.6 Data Fetching — ky + React Query

- Use the shared `api` instance from `@/shared/api`. It auto-redirects on 401
  to the `KeyFlow` login flow.
- React Query keys follow `[domain, ...specifier]`:
  - `['users']`, `['users', id]`, `['users', 'check', userId]`,
    `['users', 'register']`, etc.
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

- `master` — production-shippable. Release tags are cut from this branch.
- `develop` — next-release integration branch.
- `feature/<topic>` — new feature development.
- `hotfix/<topic>` — patches against an already-released version.

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
```

- [ ] **Step 2: Verify the file is complete**

Run: `wc -l AGENTS.md && tail -10 AGENTS.md`
Expected: line count well over 100, file ends with the `docker-compose.yml` reminder under section 8.

- [ ] **Step 3: Run lint to make sure nothing in the repo broke**

Run: `yarn lint`
Expected: exits 0 (markdown files are not linted by ESLint, but this confirms the working tree is consistent).

- [ ] **Step 4: Commit AGENTS.md**

```bash
git add AGENTS.md
git commit -m "$(cat <<'EOF'
docs: AGENTS.md 컨벤션 문서 작성

프로젝트 개요, 기술 스택, 디렉토리 구조, 코딩 컨벤션, Git 워크플로우,
빌드 / 릴리즈 가이드를 단일 문서로 정리. agent-agnostic 하게 작성.
EOF
)"
```

---

### Task 3: Write CLAUDE.md — Claude Code-only rules

**Files:**
- Modify: `CLAUDE.md` (currently: `# CLAUDE.md\n@AGENTS.md\n\n## Claude Code 전용 규칙\n\n### Plan Mode\n- 큰 변경(파일 3개 이상 / 새 기능 / 마이그레이션) 은 plan mode 로 진행한다.\n`)

- [ ] **Step 1: Replace `CLAUDE.md` with the following content**

```markdown
# CLAUDE.md

@AGENTS.md

## Claude Code 전용 규칙

### Plan Mode
- 큰 변경(파일 3개 이상 / 새 기능 / 마이그레이션) 은 plan mode 로 진행한다.

### 실행 명령어 안내
다음 명령어를 우선적으로 사용한다. 추가 도구가 필요한 경우 사용자에게 확인.

- `yarn dev` — Next.js 개발 서버 실행
- `yarn build` — production 빌드
- `yarn start` — production 빌드 실행
- `yarn lint` — ESLint 실행 (커밋 전 필수)
- `yarn prettier` — 전체 소스 포매팅
- `mise trust && mise ls` — Node 버전 동기화

테스트 스크립트는 현재 `package.json` 에 정의되어 있지 않다. 테스트가
도입되면 본 섹션과 `AGENTS.md` 의 Tech Stack / Dev Environment 를 함께
업데이트한다.

### Design Prompt 템플릿 위치
- 재사용 가능한 시스템 디자인 / UI 디자인 prompt 템플릿은 `./docs/design/`
  아래에 보관한다.
- 사용자가 디자인 관련 요청을 줄 때, 가장 먼저 `./docs/design/` 의 템플릿을
  확인하여 일관된 출력 스타일과 산출물 형식을 따른다.

### 디자인 프롬프트 처리 워크플로우
사용자가 UI / 디자인 관련 요청(목업, 레이아웃 비교, 비주얼 컴포넌트) 을 주면:

1. `./docs/design/` 에 적용 가능한 prompt 템플릿이 있는지 먼저 확인한다.
2. superpowers brainstorming 단계에서 visual companion 사용을 제안한다.
3. 사용자가 동의하면 정적 HTML 목업을 임시 디렉토리에 작성한다.
4. `npx serve <dir>` 또는 `python3 -m http.server` 로 로컬 HTTP 서버를
   구동하고, 접속 URL과 포트를 사용자에게 안내한다.
5. 사용자 피드백을 받아 반복 작업한 뒤, 최종 합의된 디자인만 실제
   `src/` 코드에 반영한다.
6. 작업 종료 시 HTTP 서버를 정리한다.
```

- [ ] **Step 2: Verify the file**

Run: `cat CLAUDE.md`
Expected: file shows the `@AGENTS.md` import on its own line and ends with the workflow step 6.

- [ ] **Step 3: Commit CLAUDE.md**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: CLAUDE.md Claude Code 전용 규칙 추가

@AGENTS.md import 유지, 실행 명령어 안내와 design prompt 템플릿 위치
(./docs/design/) 및 디자인 처리 워크플로우 추가.
EOF
)"
```

---

### Task 4: Create `docs/design/README.md`

**Files:**
- Create: `docs/design/README.md`
- Note: `docs/design/example.md` already exists (a design-system analysis prompt
  template) — the README must reference it as the canonical example.

- [ ] **Step 1: Create `docs/design/README.md` with this content**

```markdown
# Design Prompts

This directory holds reusable design prompt templates referenced by code
agents (see `CLAUDE.md` → "Design Prompt 템플릿 위치").

각 파일은 하나의 재사용 가능한 디자인 프롬프트 템플릿을 담는다.

## Templates

- [`example.md`](./example.md) — 디자인 시스템 분석 / 추출 prompt 예시.
  새 템플릿 작성 시 형식 참고.

새 템플릿을 추가하면 본 README 의 목록도 함께 업데이트한다.
```

- [ ] **Step 2: Verify the directory exists with the README**

Run: `ls -la docs/design && cat docs/design/README.md`
Expected: `README.md` exists and starts with `# Design Prompts`.

- [ ] **Step 3: Commit**

```bash
git add docs/design/README.md
git commit -m "$(cat <<'EOF'
docs: ./docs/design 디자인 프롬프트 템플릿 폴더 추가

agent 가 디자인 작업 시 참조할 재사용 가능한 prompt 템플릿 모음 위치.
EOF
)"
```

---

### Task 5: Final verification

**Files:** (read-only)

- [ ] **Step 1: Confirm git tree is clean**

Run: `git status`
Expected: `nothing to commit, working tree clean`.

- [ ] **Step 2: Confirm AGENTS.md / CLAUDE.md render structure**

Run: `grep -n '^## ' AGENTS.md && echo '---' && grep -n '^## ' CLAUDE.md`
Expected for AGENTS.md: 8 top-level sections (1 Project Overview → 8 Build & Release).
Expected for CLAUDE.md: 1 top-level section (`## Claude Code 전용 규칙`).

- [ ] **Step 3: Confirm `@AGENTS.md` import is on its own line in CLAUDE.md**

Run: `grep -n '^@AGENTS.md$' CLAUDE.md`
Expected: exactly one match on line 3.

- [ ] **Step 4: Confirm yarn lint still passes**

Run: `yarn lint`
Expected: exits 0.

- [ ] **Step 5: Print recent commits as a summary**

Run: `git log --oneline -5`
Expected: shows the three new `docs:` commits plus prior history.
