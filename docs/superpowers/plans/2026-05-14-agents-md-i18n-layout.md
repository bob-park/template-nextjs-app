# AGENTS.md i18n / App Router `_layout` 컨벤션 추가 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `AGENTS.md` 한 파일에 §4 디렉토리 트리 보강, §5.9 Internationalization, §5.10 App Router Layout Components 세 가지 컨벤션을 추가한다.

**Architecture:** documentation-only. 단일 파일 `AGENTS.md` 에 3 곳 편집 — (A) §4 트리 코드 블록 교체, (B) §5.8 직후에 §5.9 삽입, (C) §5.9 직후에 §5.10 삽입. 어떤 source/runtime 도 수정하지 않는다. 각 작업은 독립적으로 빌드/타입체크에 영향이 없으므로 별도 작업으로 분리해 작은 diff 단위로 커밋한다.

**Tech Stack:** Markdown only. 검증은 `git diff`, `grep` 으로 섹션 헤더 무결성 확인. `yarn prettier` 의 글롭 (`**/*.{js,jsx,ts,tsx,css,html}`) 은 `.md` 를 포함하지 않으므로 prettier 검사 대상은 아니다. `yarn lint` 는 `./src` 한정이라 무관.

**Source Spec:** `docs/superpowers/specs/2026-05-14-agents-md-i18n-layout-design.md`

---

## File Structure

수정 파일 1개:

- Modify: `AGENTS.md`
  - §4 Directory Structure code block (lines 45-65, ```text 블록)
  - §5.8 직후 (현재 line 237-238 사이) — 새 §5.9 삽입
  - §5.9 직후 — 새 §5.10 삽입

생성 파일: 없음. 삭제 파일: 없음.

---

## Pre-flight Checks

- [ ] **Pre-1: 작업 브랜치 / 위치 확인**

Run:
```bash
git status --short && git log -1 --oneline
```
Expected: working tree 가 clean 하거나, 사용자 WIP (`src/app/layout.tsx`, `src/proxy.ts`) 만 unstaged 상태로 남아 있다. 최신 커밋이 `docs: spec self-review 반영...` 또는 그 후속이다.

- [ ] **Pre-2: 편집 대상 anchor 가 그대로인지 검증**

Run:
```bash
grep -n '^## 4\. Directory Structure$' AGENTS.md \
  && grep -n '^### 5\.8 Domain-Driven Layout$' AGENTS.md \
  && grep -n '^## 6\. Linting & Formatting$' AGENTS.md
```
Expected: 세 줄 모두 한 번씩 매칭. (라인 번호가 spec 작성 시점과 달라도 OK — 본 plan 의 Edit 는 라인 번호가 아니라 텍스트 anchor 를 기준으로 한다.)

---

## Task 1: §4 Directory Structure 트리 업데이트

**Files:**
- Modify: `AGENTS.md` (§4 의 ```text 코드 블록)

목표: 기존 트리에 `src/app/_layout/`, `src/shared/i18n/` 항목을 추가하고, `src/` 트리 다음에 빈 줄 한 줄을 두고 `messages/` 를 top-level sibling 으로 같은 코드 블록 안에 추가한다.

- [ ] **Step 1.1: Edit 적용**

Tool: `Edit`

File: `AGENTS.md`

`old_string` (정확히 일치):

````
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
````

`new_string` (정확히 일치):

````
```text
src/
├── app/                # Next.js App Router (pages, layouts, api routes)
│   ├── _layout/        # Root layout 의 sub-components (Header, Contents, Footer) — see §5.10
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
│   ├── i18n/           # next-intl config, locale resolution, server action — see §5.9
│   ├── providers/      # React context providers (theme, ...)
│   ├── queries/        # Shared React Query types/utilities
│   ├── store/          # Root Zustand store (combines domain slices)
│   └── dayjs/          # dayjs configuration / locale setup
├── utils/              # Pure utility functions (no React, no I/O)
└── proxy.ts            # Auth proxy logic — call from a Next.js middleware

messages/               # next-intl translation messages — messages/<locale>.json (see §5.9)
```
````

변경 요약:
- `src/app/` 하위에서 `└── api/` 를 `├── api/` 로 바꾸고 바로 위에 `├── _layout/` 라인 추가.
- `src/shared/` 하위에서 `hooks/` 와 `providers/` 사이에 `├── i18n/` 라인 추가.
- `└── proxy.ts` 뒤에 빈 줄 한 줄을 두고 top-level `messages/` 라인 추가 (같은 ```text 코드 펜스 안).

- [ ] **Step 1.2: Diff 확인**

Run:
```bash
git --no-pager diff -- AGENTS.md
```
Expected: 정확히 3 개 영역의 추가/변경 — `_layout/` 라인, `└── api/` → `├── api/` 변경, `i18n/` 라인, `messages/` 라인 + 그 앞 빈 줄. 다른 라인 (다른 섹션) 은 건드리지 않는다.

- [ ] **Step 1.3: 섹션 헤더 무결성 확인**

Run:
```bash
grep -nE '^(## |### )' AGENTS.md
```
Expected: 기존 헤더 목록이 그대로 보존 — §1~§8, §5.1~§5.8 헤더 라인이 모두 존재하고 새로 추가된 헤더는 없다 (Task 1 은 트리만 수정).

- [ ] **Step 1.4: Commit**

```bash
git add AGENTS.md
git commit -m "$(cat <<'EOF'
docs: AGENTS.md §4 디렉토리 트리에 _layout, i18n, messages 추가
EOF
)"
```

---

## Task 2: §5.9 Internationalization (i18n) 섹션 추가

**Files:**
- Modify: `AGENTS.md` (§5.8 와 §6 사이에 새 §5.9 삽입)

목표: `next-intl` 기반 i18n 컨벤션을 다섯 블록 (Library & Wiring / Locale Resolution / Message Files / Usage / Locale Change) 으로 추가한다.

- [ ] **Step 2.1: Edit 적용**

Tool: `Edit`

File: `AGENTS.md`

`old_string` (§5.8 의 마지막 문단 + 그 다음 빈 줄 + §6 헤더):

````
Cross-domain reuse moves to `src/shared/`. `src/utils/` is for **pure
functions only** — no React, no I/O.

## 6. Linting & Formatting
````

`new_string`:

````
Cross-domain reuse moves to `src/shared/`. `src/utils/` is for **pure
functions only** — no React, no I/O.

### 5.9 Internationalization (i18n)

i18n 라이브러리는 `next-intl` v4 를 사용한다. 라이브러리 버전이 바뀌면
본 섹션도 함께 갱신한다 (정확한 핀 버전은 `package.json` 참조).

#### Library & Wiring

- `next.config.ts` 에서 plugin 으로 wrap 한다. **단일 진입점**:

  ```ts
  // next.config.ts
  const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');
  export default withNextIntl(nextConfig);
  ```

- 런타임 messages 로딩은 `src/shared/i18n/request.ts` 의 `getRequestConfig`
  에서 수행한다. 이 파일을 다른 경로로 옮기지 않는다 (plugin 인자가 같이
  바뀌어야 함).

#### Locale Resolution

`src/shared/i18n/locale.ts` 의 `getUserLocale()` (server-only) 가 다음
우선순위로 locale 을 결정한다:

1. `locale` cookie (`COOKIE_NAME_LOCALE`) — 값이 `SUPPORTED_LOCALES` 에 속할 때.
2. 요청 헤더 `Accept-Language` 의 첫 토큰이 `SUPPORTED_LOCALES` 중 하나로 시작할 때.
3. 위 두 조건 모두 실패 → `DEFAULT_LOCALE` (`'ko'`).

`SUPPORTED_LOCALES`, `LOCALE_META`, `DEFAULT_LOCALE`, `COOKIE_NAME_LOCALE`
은 **모두 `src/shared/i18n/config.ts` 에 한 번만 정의**한다 (single source
of truth). 다른 곳에서 같은 상수를 재정의하지 않는다.

#### Message Files

- 위치: 저장소 루트 `messages/<locale>.json` (예: `messages/ko.json`,
  `messages/en.json`).
- 키 구조: `namespace.key` 네스팅. 예:

  ```json
  { "metadata": { "title": "...", "description": "..." } }
  ```

- 사용 시 `getTranslations('metadata')` 또는 `useTranslations('metadata')`
  처럼 namespace 단위로 호출한다.
- 새 locale 추가 절차 (세 곳을 동기 갱신):
  1. `src/shared/i18n/config.ts` 의 `SUPPORTED_LOCALES` 에 코드 추가.
  2. 같은 파일의 `LOCALE_META` 에 `{ code, label, htmlLang }` 추가.
  3. `messages/<new-locale>.json` 신규 작성 — 기존 locale 의 모든 키를 채운다.

#### Usage — Server vs Client

- **Server Component / Route Handler / `generateMetadata`** —
  `next-intl/server` 의 `getTranslations(namespace)` / `getMessages()` 를
  사용한다. 동기 hook (`useTranslations`) 은 서버 컴포넌트에서 사용하지
  않는다.
- **Client Component** — `next-intl` 의 `useTranslations(namespace)`,
  `useLocale()` 을 사용한다. `useLocale` / `useTranslations` 은 §5.4 의
  `// hooks` 섹션 주석 아래에 둔다.
- **Client hydration** — `RootLayout` 에서
  `<NextIntlClientProvider locale={locale} messages={messages}>` 로 client
  트리를 감싼다 (이미 구현됨, `src/app/layout.tsx`).

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

#### Locale Change

- 진입 함수: `src/shared/i18n/localeAction.ts` 의 `setLocale(locale)`
  server action.
  - `locale` cookie 저장 (`maxAge = LOCALE_COOKIE_MAX_AGE`, `sameSite: 'lax'`).
  - `revalidatePath('/', 'layout')` 으로 root layout 재검증 → 새 locale
    메시지가 트리에 반영된다.
- UI 진입점: `src/shared/components/i18n/LanguageSwitcher.tsx`. 새로운
  locale 변경 UI 가 필요하면 이 컴포넌트를 재사용하거나, 동일하게
  `setLocale` + `useTransition` 패턴을 따른다.
- 클라이언트에서 직접 cookie 를 조작하지 않는다 — 항상 `setLocale` 을
  통한다.

## 6. Linting & Formatting
````

- [ ] **Step 2.2: Diff 확인**

Run:
```bash
git --no-pager diff -- AGENTS.md
```
Expected: 단일 hunk — §5.8 의 마지막 문단과 §6 헤더 사이에 `### 5.9 Internationalization (i18n)` 섹션이 통째로 추가됨. §5.8 본문과 §6 헤더 자체는 변하지 않는다.

- [ ] **Step 2.3: 헤더 구조 무결성**

Run:
```bash
grep -nE '^### 5\.' AGENTS.md
```
Expected: `5.1` 부터 `5.9` 까지 9 줄이 순서대로 출력된다 (5.10 은 Task 3 에서 추가).

Run:
```bash
grep -nE '^## ' AGENTS.md
```
Expected: §1~§8 헤더 8 줄이 그대로 보존된다 (§5.9 는 `###` 이므로 이 grep 결과에는 포함되지 않는다).

- [ ] **Step 2.4: Commit**

```bash
git add AGENTS.md
git commit -m "$(cat <<'EOF'
docs: AGENTS.md §5.9 Internationalization (i18n) 컨벤션 추가
EOF
)"
```

---

## Task 3: §5.10 App Router Layout Components 섹션 추가

**Files:**
- Modify: `AGENTS.md` (§5.9 와 §6 사이에 새 §5.10 삽입)

목표: `layout.tsx` 의 sub-component 를 같은 디렉토리의 `_layout/` private folder 에 두는 규칙을 root + nested layout 모두에 일반화하여 추가한다.

- [ ] **Step 3.1: Edit 적용**

Tool: `Edit`

File: `AGENTS.md`

`old_string` (§5.9 의 끝 — Locale Change 마지막 bullet — 과 §6 헤더):

````
- 클라이언트에서 직접 cookie 를 조작하지 않는다 — 항상 `setLocale` 을
  통한다.

## 6. Linting & Formatting
````

`new_string`:

````
- 클라이언트에서 직접 cookie 를 조작하지 않는다 — 항상 `setLocale` 을
  통한다.

### 5.10 App Router Layout Components

#### Core Rule

- 어떤 디렉토리든 `layout.tsx` 가 sub-component 를 필요로 하면, **같은
  디렉토리에 `_layout/` private folder** 를 만들어 그 안에 sub-component 를
  둔다. underscore prefix 는 Next.js 가 라우트에서 제외하는 [private
  folder](https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders)
  규약이다.
- 파일명은 §5.2 그대로 `PascalCase.tsx`. 예: `Header.tsx`, `Contents.tsx`,
  `Footer.tsx`, `Sidebar.tsx`.
- `layout.tsx` 에서 import 할 때는 같은 폴더이므로 **상대경로**
  (`./_layout/Header`) 를 사용한다.
- 다른 layout 의 `_layout/` 컴포넌트는 import 하지 않는다 — 각 `_layout/`
  은 그 layout 전용이다.
- Cross-layout 으로 재사용해야 하는 컴포넌트는 `_layout/` 이 아니라
  `src/shared/components/<area>/` 로 승격한다 (§4 Directory Structure 참조).
- 적용 범위: root (`src/app/_layout/`) 와 nested layout (예:
  `src/app/admin/_layout/`) **모두 동일 규칙**.

#### 디렉토리 예시

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

- `src/app/layout.tsx` 는 `./_layout/Header`, `./_layout/Contents`,
  `./_layout/Footer` 를 사용한다.
- `src/app/admin/layout.tsx` 는 `./_layout/Sidebar` 를 사용한다.
- `admin/_layout/Sidebar` 를 root layout 에서 사용하고 싶다면 먼저
  `src/shared/components/` 로 승격한다.

## 6. Linting & Formatting
````

- [ ] **Step 3.2: Diff 확인**

Run:
```bash
git --no-pager diff -- AGENTS.md
```
Expected: 단일 hunk — §5.9 마지막 bullet 과 §6 헤더 사이에 `### 5.10 App Router Layout Components` 섹션이 통째로 추가됨. §5.9 본문과 §6 헤더 자체는 변하지 않는다.

- [ ] **Step 3.3: 헤더 구조 무결성**

Run:
```bash
grep -nE '^### 5\.' AGENTS.md
```
Expected: `5.1` 부터 `5.10` 까지 10 줄이 순서대로 출력된다.

Run:
```bash
grep -nE '^## ' AGENTS.md
```
Expected: §1~§8 헤더 8 줄이 그대로 보존된다 (§5.10 은 `###`).

Run:
```bash
grep -n '^## 6\. Linting & Formatting$' AGENTS.md \
  && grep -n '^## 7\. Git Workflow$' AGENTS.md \
  && grep -n '^## 8\. Build & Release$' AGENTS.md
```
Expected: §6, §7, §8 헤더가 각 한 번씩 매칭된다 (번호가 밀리지 않았음).

- [ ] **Step 3.4: Commit**

```bash
git add AGENTS.md
git commit -m "$(cat <<'EOF'
docs: AGENTS.md §5.10 App Router _layout 컨벤션 추가
EOF
)"
```

---

## Final Verification

- [ ] **Final-1: 전체 헤더 스냅샷**

Run:
```bash
grep -nE '^(## |### )' AGENTS.md
```
Expected (순서):
```
## 1. Project Overview
## 2. Tech Stack
## 3. Development Environment
## 4. Directory Structure
## 5. Coding Conventions
### 5.1 Module & Path Aliases
### 5.2 File Naming
### 5.3 TypeScript
### 5.4 React Components
### 5.5 State Management — Zustand
### 5.6 Data Fetching — ky + React Query
### 5.7 Styling — Tailwind 4 + daisyUI 5
### 5.8 Domain-Driven Layout
### 5.9 Internationalization (i18n)
### 5.10 App Router Layout Components
## 6. Linting & Formatting
## 7. Git Workflow
### 7.1 Branch Naming
### 7.2 Commit Message Prefix
### 7.3 PR Title & Version Bump
## 8. Build & Release
```

- [ ] **Final-2: 새 섹션에서 외부 참조 링크 (`see §5.9`, `see §5.10`) 가 §4 트리에 살아 있는지 확인**

Run:
```bash
grep -n 'see §5\.' AGENTS.md
```
Expected: 최소 2 줄 — `_layout/` 옆 `see §5.10`, `i18n/` 옆 `see §5.9`. 추가로 `messages/` 라인의 `see §5.9` 도 포함되어 총 3 줄.

- [ ] **Final-3: spec acceptance criteria 항목 매핑 검토**

Spec §6 의 acceptance criteria 와 실제 결과를 매핑:

| Spec §6 | 검증 방법 |
| --- | --- |
| §4 트리에 `_layout`, `i18n`, `messages` 추가 | Task 1 + Final-1/Final-2 |
| §5.9 다섯 블록 (Library & Wiring / Locale Resolution / Message Files / Usage / Locale Change) | Task 2 의 `grep -nE '^#### '` 로 확인 가능: `grep -n '^#### ' AGENTS.md` → "Library & Wiring", "Locale Resolution", "Message Files", "Usage — Server vs Client", "Locale Change" 다섯 줄 + §5.10 의 "Core Rule", "디렉토리 예시" 두 줄 = 총 7 줄 |
| §5.10 핵심 규칙 + 디렉토리 예시 | Task 3 + 위 grep |
| §6 이후 번호 불변 | Final-1 + Task 3 의 Step 3.3 마지막 grep |
| `yarn prettier` 적용 후 diff 없음 | `yarn prettier` 실행 → `git status` 가 `AGENTS.md` 변경 없음을 확인 (글롭 미포함이라 사실상 변화 없음이 기본). 사용자 WIP 파일은 무시. |
| 커밋 메시지 prefix `docs:` + 한국어 요약 | `git log --oneline -3` 의 메시지 확인 |

Run:
```bash
grep -n '^#### ' AGENTS.md
```
Expected: 위 표의 7 줄.

Run:
```bash
yarn prettier && git --no-pager diff --name-only -- AGENTS.md
```
Expected: prettier 가 통과하고, diff 결과에 `AGENTS.md` 가 포함되지 않는다 (prettier 글롭 미포함).

Run:
```bash
git --no-pager log --oneline -3
```
Expected: 최근 세 커밋의 메시지가 모두 `docs:` prefix + 한국어 요약 형식이며, Task 1/2/3 의 커밋 메시지가 순서대로 보인다.

- [ ] **Final-4: 정리**

Pre-flight 에서 확인한 사용자 WIP (`src/app/layout.tsx`, `src/proxy.ts`) 가 unstaged 상태 그대로인지 한 번 더 확인.

Run:
```bash
git status --short
```
Expected: `AGENTS.md` 는 stage/working tree 모두 깨끗 (커밋 완료). WIP 파일들이 있다면 unstaged (` M`) 상태로 남아 있다. 본 plan 은 WIP 파일을 절대 stage/commit 하지 않는다.

---

## Notes for Implementer

- 모든 Edit 은 **텍스트 anchor 기반** 이라 위 plan 의 라인 번호와 실제 라인 번호가 어긋나도 동작한다.
- 본 plan 의 코드 펜스 안에 있는 백틱 4 개짜리 (``` ` ` ` ` ```) 블록은 마크다운 표현용이다. AGENTS.md 에 들어가는 실제 코드 펜스는 3 개 (``` ` ` ` ```) 그대로 사용한다 — Edit 의 `old_string` / `new_string` 에 넣을 때는 3-백틱이어야 한다.
- 각 Task 의 Edit 는 **한 번만** 적용된다. `replace_all` 은 사용하지 않는다 (anchor 가 파일에 한 번만 나타나야 함을 전제로 한다).
- 한국어 본문 안의 영문 식별자 (`getTranslations`, `useLocale` 등) 은 backtick 으로 감싼다 (AGENTS.md 기존 스타일).
- 본 plan 은 `next-intl` 자체나 `_layout` 코드를 변경하지 않는다. 만약 작업 중에 코드 변경 욕구가 생기면 멈추고 사용자에게 확인할 것 (spec §2 비-목적 참조).
