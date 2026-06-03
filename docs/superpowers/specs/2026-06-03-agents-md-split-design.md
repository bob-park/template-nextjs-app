---
title: AGENTS.md 를 docs/agents/* 토픽별 가이드로 분리
date: 2026-06-03
status: draft
---

# AGENTS.md 를 docs/agents/* 토픽별 가이드로 분리

## 1. 배경 / 목표

현재 `AGENTS.md` 한 파일이 프로젝트 컨벤션을 모두 담고 있다 (~456줄, 8개 섹션, §5 만 10개 하위 섹션). Claude Code 의 `CLAUDE.md` 에서 `@AGENTS.md` 로 import 되므로 매 세션 컨텍스트에 전부 로딩되며, 다른 코드 agent (Cursor, Codex, Aider 등) 도 토픽 단위로 선별 참조하기 어렵다.

목표:

- 토픽 단위로 분리해 agent 가 **필요한 문서만 선별적으로 읽도록** 한다.
- 각 문서의 첫 5~10줄 (frontmatter + TL;DR) 만 봐도 적용 여부를 판단할 수 있게 한다.
- 분리 후에도 **AGENTS.md 는 진입점** 으로 유지되어 `@AGENTS.md` import 가 그대로 동작한다.
- **내용 자체는 변경하지 않는다**. 분리 전후가 semantically identical 해야 한다.

비목표:

- 자동 인덱스 빌드 스크립트 도입
- `docs/agents/` 외 다른 문서 재구성
- 컨벤션 규칙 추가/삭제

## 2. 전체 파일 매핑

```text
docs/agents/
├── overview.md                    # §1 Project Overview
├── tech-stack.md                  # §2 Tech Stack
├── structure.md                   # §4 Directory + §5.8 Domain feature flow + §5.10 App Router _layout 규칙
├── conventions/
│   ├── module-aliases.md          # §5.1
│   ├── naming.md                  # §5.2
│   ├── typescript.md              # §5.3
│   └── react-sections.md          # §5.4 (Server default + Client Section Comments)
├── libs/
│   ├── zustand-slice.md           # §5.5
│   ├── ky-react-query.md          # §5.6
│   ├── tailwind-daisyui.md        # §5.7
│   └── next-intl.md               # §5.9 (wiring / locale resolution / messages / usage / locale change 포함)
└── workflows/
    ├── dev-env.md                 # §3 Dev Environment + §6 Lint/Format
    ├── git.md                     # §7 Git Workflow
    └── build-release.md           # §8 Build & Release
```

판단 근거:

- `structure.md` = "어디에 두는가" 한 곳에 모음 (디렉토리 트리 + 도메인 추가 절차 + `_layout/` 규칙).
- `conventions/` = "어떻게 쓰는가" (네이밍 / TypeScript / React 섹션 주석).
- `libs/` = "어떤 라이브러리 패턴을 따르는가".
- `workflows/` = "언제 무엇을 실행하는가".
- §6 Lint/Format (3줄) 은 단독 파일을 만들 만큼 크지 않아 `workflows/dev-env.md` 에 합친다.
- §5.9 i18n 은 한 파일에 유지한다. 작업 시 wiring/usage 를 같이 봐야 하는 경우가 많고, 분할 시 인덱스만 길어진다 (~300줄 단일 파일 허용).

## 3. 각 파일의 표준 포맷

모든 `docs/agents/**/*.md` 는 다음 골격을 따른다. AI agent 가 첫 5줄만 보고 이 파일을 더 읽을지 결정할 수 있게 만드는 게 핵심이다.

```markdown
---
title: React Section Comments
scope: src/**/*.{ts,tsx}
applies_to: client components, custom hooks, providers
related:
  - ../structure.md
  - ../libs/zustand-slice.md
---

# React Section Comments

> `'use client'` 컴포넌트, client hook (`useXxx.tsx`), shared provider 에서 함수 본문을 11개 고정 순서의 섹션 주석으로 구분한다.

## When this applies
... (대상/비대상)

## Rules
... (불릿, 명령형)

## Example
```tsx
... (정규 코드)
```

## Migration policy
... (해당 시)
```

각 요소의 의도:

| 요소 | 목적 |
|---|---|
| frontmatter `title` | 인덱스에서 라벨과 일치 |
| frontmatter `scope` | glob 으로 적용 파일 범위 명시 (Cursor/Aider 의 rule scoping 호환) |
| frontmatter `applies_to` | scope 가 표현하지 못하는 의미 조건 (예: "client components") |
| frontmatter `related` | 인접 토픽 cross-link, 상대경로 |
| `>` blockquote | TL;DR 한 줄. agent 가 이 한 줄만으로 80% 정확 |
| When this applies | 적용/비적용 경계 |
| Rules | 명령형 짧은 불릿 |
| Example | 정규 코드, 한 덩어리 100줄 이내 |
| Migration policy | "기존 코드 일괄 변경 금지" 류 정책 |

추가 규칙:

- 파일명: kebab-case.
- 단일 주제 1개당 200줄 이내 권장 (`next-intl.md` 예외 ~300줄).
- 본문 산문은 한국어. 코드/식별자/명령은 영어 원문 그대로.
- 외부 링크는 inline (`[label](url)`).

## 4. 분리 후 AGENTS.md (얇은 인덱스)

분리 후 AGENTS.md 본문은 아래 골격으로 교체한다.

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

CLAUDE.md 의 `@AGENTS.md` import 는 그대로 둔다. `docs/agents/**` 은 on-demand 로 agent 가 Read 한다 — CLAUDE.md 에 추가 import 하지 않는다.

## 5. 실행 순서

1. 디렉토리 생성: `docs/agents/`, `docs/agents/conventions/`, `docs/agents/libs/`, `docs/agents/workflows/`.
2. Foundations 3 파일 작성: `overview.md`, `tech-stack.md`, `structure.md`.
3. Conventions 4 파일 작성: `module-aliases.md`, `naming.md`, `typescript.md`, `react-sections.md`.
4. Libs 4 파일 작성: `zustand-slice.md`, `ky-react-query.md`, `tailwind-daisyui.md`, `next-intl.md`.
5. Workflows 3 파일 작성: `dev-env.md`, `git.md`, `build-release.md`.
6. AGENTS.md 를 얇은 인덱스 본문으로 교체.
7. CLAUDE.md 본문에 AGENTS.md 옛 섹션 (§5.10 등) 을 가리키는 문구가 있으면 새 경로로 갱신.

AGENTS.md 를 마지막에 교체하는 이유: 분리 중간에 다른 세션이 들어와도 옛 AGENTS.md 가 여전히 single source 역할을 하도록 보장.

## 6. 검증 체크리스트

- [ ] AGENTS.md 옛 §1~§8 의 각 항목이 새 파일 어딘가에 1:1 로 존재한다 (매핑 표로 확인).
- [ ] 옛 cross-reference ("see §5.10", "§5.2", "see §4 Directory Structure" 등) 가 모두 새 경로 링크로 치환되었다.
- [ ] 옛 AGENTS.md 의 코드 예시 (Section comments 예시, generateMetadata 예시 등) 가 누락 없이 이전되었다.
- [ ] `messages/` 디렉토리 언급은 `structure.md` 와 `libs/next-intl.md` 두 곳에 존재한다 (의도된 중복).
- [ ] 모든 신규 파일이 frontmatter 4개 키 (`title`, `scope`, `applies_to`, `related`) 를 보유한다.
- [ ] AGENTS.md 인덱스의 모든 링크가 실제 파일을 가리킨다 (broken link 없음).

## 7. 커밋 단위

3개 커밋으로 나눈다. rollback granularity 가 좋다.

1. `docs: docs/agents/* 토픽별 가이드 파일 신규 작성`
2. `refactor: AGENTS.md 를 docs/agents 인덱스로 축약`
3. `docs: CLAUDE.md 의 AGENTS.md 옛 섹션 참조 갱신` (해당 사항 있을 때만)

커밋 prefix 는 AGENTS.md §7.2 규약을 따른다.

## 8. Scope 경계 (하지 않을 것)

- 자동 인덱스 빌드 스크립트.
- `docs/agents/` 외 다른 문서 재구성 (`docs/design/`, `README.md` 등).
- AGENTS.md 의 컨벤션 내용 자체 수정 — 분리 전후 semantically identical. 새 규칙 추가/삭제 금지. 표현/오타 수정만 허용.
- `messages/` 실제 JSON 파일이나 `src/` 코드 변경.
