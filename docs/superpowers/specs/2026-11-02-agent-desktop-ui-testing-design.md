# agent-desktop UI/UX 테스트 가이드 도입 — Design

- Date: 2026-11-02
- Branch: `main` (현재 브랜치에서 작업 — 사용자 요구)
- Reference: `/Users/hwpark/Documents/rust-workspace/template-rust-app`
  (`AGENTS.md`, `docs/agents/ui-testing.md`, `docs/ui-scenarios/01~07`, `.gitignore`)

## Intent

Rust(Tauri) 템플릿에 있는 `agent-desktop` 기반 UI/UX 테스트 규칙을 이 Next.js
템플릿에 맞게 옮긴다. 코드 에이전트가 실행 중인 앱을 실제로 보고 조작해
P0 시나리오를 검증하고, 같은 형식의 리포트를 남길 수 있게 하는 것이 목적이다.
이 템플릿에서 파생되는 앱이 최소 기준선(P0)을 그대로 물려받는다.

## Goals

- `docs/agents/ui-testing.md` 신설 — agent-desktop + Google Chrome 으로 웹앱을 구동/검증하는 절차.
- `docs/ui-scenarios/` 에 이 앱 기준 P0 시나리오 5개.
- `AGENTS.md` Map / How to use 에 진입점 추가.
- `.gitignore` 에 `.ui-test-results/` 추가.

## Non-goals

- `src/` 코드 수정 없음. 테스트 중 발견되는 접근성/i18n 문제(아래 "Known gaps")는 리포트 항목으로만 남긴다.
- Playwright 등 테스트 러너 도입, `package.json` 스크립트 추가 없음.
- CI 연동 없음 (로컬 에이전트 수동 실행 전제).

## Anti-goals

- 사용자의 평소 Chrome 프로필(쿠키, 로그인, 탭)을 건드리는 절차.
- 테스트를 통과시키려고 앱 코드나 시나리오 기대값을 바꾸는 행위를 허용하는 문구.
- 실 계정/실 데이터로 되돌릴 수 없는 동작을 수행하는 절차.

## Constraints

- 문서 규칙: `docs/agents/*` 는 frontmatter (`title`, `scope`, `applies_to`, `related`) + TL;DR blockquote 로 시작. 본문 영어, 도메인 용어 한국어 (AGENTS.md 서두).
- 브라우저는 **Google Chrome** (사용자 결정). Orca 안이어도 UI 테스트는 agent-desktop + Chrome 을 쓰고, 글로벌 "Orca 브라우저" 규칙은 일반 브라우징에만 해당한다고 문서에 명시 (내 판단).
- `/` 를 포함한 모든 페이지는 `src/proxy.ts` 세션 가드 뒤에 있음 → 대부분 시나리오의 전제 조건은 KeyFlow **테스트 계정** 로그인.
- `agent-desktop` 은 mise Node 에 전역 설치되어 있음 (`agent-desktop` v2.5 확인).

## Approaches

1. **Rust 템플릿 구조 전체 이식 (선택됨)** — 가이드 문서 + P0 시나리오 + AGENTS.md 항목 + `.gitignore`. 두 템플릿 구조가 같고 파생 앱이 기준선을 물려받음. 대신 파일 7~8개, 시나리오를 실제 화면과 맞춰 유지해야 함.
2. **가이드 문서만 이식** — `ui-testing.md` + AGENTS.md 항목. 작고 빠르지만 "최소 이것만은 통과" 기준선이 없음.
3. ~~AGENTS.md 본문에 직접 작성~~ — "세부 규칙은 `docs/agents/` 토픽 문서" 라는 이 프로젝트 규칙과 충돌해 제외.

사용자가 1번 선택.

## Decided — what gets built

### 파일 목록

| 파일 | 변경 |
| ---- | ---- |
| `docs/agents/ui-testing.md` | 신규 |
| `docs/ui-scenarios/01-auth-redirect.md` | 신규 |
| `docs/ui-scenarios/02-logout.md` | 신규 |
| `docs/ui-scenarios/03-theme.md` | 신규 |
| `docs/ui-scenarios/04-locale.md` | 신규 |
| `docs/ui-scenarios/05-not-found.md` | 신규 |
| `AGENTS.md` | Map 에 `### Testing` 항목, How to use 에 한 줄 |
| `.gitignore` | `.ui-test-results/` |

### `docs/agents/ui-testing.md` 구성 (Rust 판 섹션 순서 유지, 내용만 치환)

- **Setup**
  - 대상 앱 = `Google Chrome` (고정). Rust 판의 "config 에서 앱 이름 읽기" 섹션은 제거.
  - Dev 서버: `yarn dev` (mise 경유). 접속 URL 은 `BETTER_AUTH_URL` 의 origin (아래 "Chrome instance & port").
  - 테스트 전용 Chrome 프로필: `agent-desktop launch "Google Chrome" --no-attach --activate --arg=--user-data-dir=<tmp> --arg=--no-first-run --arg=<url>`. 매 실행마다 새 임시 디렉토리 → 쿠키(theme/locale/session) 깨끗한 상태로 시작. 정확한 플래그는 `--help` 로 확인하라는 문구 유지.
  - 사용자 Chrome 이 이미 떠 있으면 `--app "Google Chrome"` 이 모호할 수 있음 → `list-windows` 로 테스트 창을 골라 `--window-id` 사용.
  - Install / permissions (macOS Accessibility) 섹션은 Rust 판 그대로 (mise 경유 npm 전역 설치).
  - Orca 관계 한 문단.
- **Basic rules** — Rust 판 그대로 (`skills get desktop` / `platform`, `--help`, snapshot 우선, JSON envelope, headless 기본).
- **Running a test** — Launch / Observe→act→verify / Errors / Cleanup. Tauri 창 섹션 대신 "Browser notes":
  - 주소창 이동은 `focus-window` → `press cmd+l` → `type <url>` → `press return` (Windows 는 `ctrl+l`).
  - 웹 콘텐츠는 Chrome 접근성 트리의 web area 아래에 있음 → `--skeleton` 후 `--root` 로 좁히기.
  - Chrome 접근성 트리가 비어 있으면 `--force-renderer-accessibility` 플래그로 재실행.
  - Cleanup: 테스트 창만 `--window-id` 로 닫고 테스트 인스턴스 종료 (사용자 Chrome 이 실행 중이면 `close-app` 금지), 임시 프로필 삭제, `yarn dev` 종료.
- **Making UI testable** — Rust 판 규칙 유지, i18n 출처를 next-intl (`messages/<locale>.json`, `useTranslations`/`getTranslations`, [next-intl](./libs/next-intl.md)) 로 치환. 토스트는 이미 `role="alert"` (`src/shared/components/toast/Toast.tsx`) 라는 예시 추가.
- **Web notes** (Tauri notes 대체) — light/dark (`theme` cookie, [theme](./libs/theme.md)) 와 ko/en (`locale` cookie) 모두 확인, 클립보드 백업/복원 규칙 유지, 알림 항목 제거.
- **Scenarios / Reports / Safety** — Rust 판 형식 그대로. 경로 `docs/ui-scenarios/`, `.ui-test-results/<YYYYMMDD-HHmm>/report.md`. Safety 에 "KeyFlow 테스트 계정만 사용, 계정 자격 증명은 리포트/스냅샷에 남기지 않는다" 추가.

### P0 시나리오 (영어, Rust 판 템플릿 형식)

| # | 내용 | 핵심 기대값 |
| - | ---- | ---------- |
| 01-auth-redirect | 세션 없이 `/` 접속 → `/login?callback=/` → KeyFlow 로그인 화면 → 테스트 계정 로그인 → `/` 복귀 | 헤더 `username:` 옆 이름 비어있지 않음 |
| 02-logout | 헤더 `logout` 링크 → `/logout` → KeyFlow `/connect/logout` (end-session) → 다시 `/` 접속 | **KeyFlow 로그인 폼이 보여야 PASS**. 폼 없이 자동 재로그인되면 FAIL (사용자 결정: connect/logout 으로 KeyFlow 세션도 제거되어야 함) |
| 03-theme | `ThemeSwitcher` 로 dark ↔ light 전환 → 새로고침 후 유지 | 클릭 직후 색이 바뀌어야 함 (server action 의 cookie set 이 re-render 유발). 새로고침은 유지 확인용. screenshot 로 확인 (`data-theme` 는 트리에 안 보일 수 있음) |
| 04-locale | `LanguageSwitcher` radiogroup 에서 `EN` ↔ `한국어`, `aria-checked` 변경, 새로고침 후 유지 | `LOCALE_META` 라벨 인용 |
| 05-not-found | 존재하지 않는 경로 접속 → not-found 화면 → `돌아가기` 버튼 → `/` | 버튼 이름으로 찾을 수 있음. `src/proxy.ts` 가 미지 경로도 가드하므로 로그인 필요 |

모든 P0 (01~05) 는 로그인 세션이 필요하다. N/A 사유 (Preconditions 에 명시):
- `N/A (no test account)` — 사용자가 테스트 계정을 주지 않음.
- `N/A (KeyFlow unreachable)` — KeyFlow 접속 불가, 또는 dev 서버 origin 이 `BETTER_AUTH_URL` 과 다름.

### Test account (사용자 결정)

- 자격 증명은 **테스트 실행 시 사용자에게 직접 받는다**. 파일/env 에 저장하지 않는다.
- 비밀번호는 `type` 직후 snapshot 에 값이 노출될 수 있으므로: 비밀번호 입력 후 결과 snapshot/screenshot 은 `.ui-test-results/` 에 저장하지 않고, 리포트에 계정 정보를 쓰지 않는다 (아이디도 마스킹).

### Chrome instance & port (내 판단 — builder check 결과)

- `agent-desktop launch` 는 기본적으로 실행 중인 인스턴스에 attach → 반드시 `--no-attach` + 임시 `--user-data-dir`.
- 테스트 창은 `list-windows` 로 찾은 `--window-id` 로만 다룬다. 사용자의 Chrome 이 실행 중이면 `close-app` 금지 (같은 앱 이름이라 사용자 브라우저까지 종료됨) — 창 닫기 + 테스트 인스턴스 종료만.
- URL 은 `BETTER_AUTH_URL` 의 origin 을 쓴다 (OAuth redirect URI 가 이 origin 기준). `yarn dev` 가 다른 포트로 뜨면 N/A (KeyFlow unreachable) 처리하고 사용자에게 알린다.

### Known gaps (시나리오 / 리포트에 "accessibility issues" 로 기록, 이번 변경에서 수정하지 않음)

- `ThemeSwitcher` 버튼에 `role="radio"` / `aria-checked` 없음 → 현재 테마를 트리로 판별 불가.
- `logout`, `돌아가기` 등이 하드코딩 문자열 (messages 에 없음).

## Left to the builder

- `ui-testing.md` 의 정확한 문장, 코드 블록 예시, PowerShell 변형 포함 여부.
- 시나리오 Steps 의 세부 명령 순서와 UX checks 문항.
- AGENTS.md 에서 새 섹션 이름 (`### Testing` vs `### Workflows` 하위) — 기존 스타일에 맞게.
- `docs/agents/tech-stack.md` / `workflows/dev-env.md` 에 agent-desktop 한 줄 언급 여부.
