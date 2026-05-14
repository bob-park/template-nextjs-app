# Design Spec — AGENTS.md i18n & App Router Layout 컨벤션 추가

- **Date:** 2026-05-14
- **Status:** Draft (awaiting user review)
- **Owner:** Bob Park
- **Scope:** documentation-only — edits to `AGENTS.md` (no source/runtime changes)

## 1. 목적

`AGENTS.md` 에 두 가지 컨벤션을 명문화한다.

1. **i18n spec** — 최근 도입된 `next-intl` 기반 다국어 구조 (`feat: i18n 기능 추가`, commit `1a3671e`) 를 코드 에이전트가 일관되게 활용하도록 규칙화.
2. **App Router `_layout` private folder 컨벤션** — `layout.tsx` 의 sub-component (예: `Header.tsx`, `Contents.tsx`, `Footer.tsx`) 를 같은 디렉토리의 `_layout/` private folder 에 두는 규칙을 모든 layout (root + nested) 에 일반화.

## 2. 비 (非) 목적

- 기존 `next-intl` 구현/파일 자체 수정.
- 기존 `src/app/_layout/` 컴포넌트 리팩토링.
- 새 locale 추가 또는 메시지 키 마이그레이션.
- 테스트/CI 변경.

## 3. 변경 대상

`AGENTS.md` 파일 한 곳, 세 군데 편집:

| # | 위치 | 작업 |
| - | --- | --- |
| A | §4 Directory Structure | 트리에 `src/app/_layout/`, `src/shared/i18n/`, `messages/` 항목 추가 |
| B | §5 Coding Conventions | 새 §5.9 "Internationalization (i18n)" 추가 |
| C | §5 Coding Conventions | 새 §5.10 "App Router Layout Components" 추가 |

§6 이후 번호는 그대로 유지된다 (§5 의 sub-section 만 늘어남).

## 4. 상세 설계

### 4.1 §4 Directory Structure — 트리 업데이트

기존 코드 블록을 다음과 같이 보강한다 (추가 라인만 표시).

```text
src/
├── app/
│   ├── _layout/        # Root layout 의 sub-components (Header, Contents, Footer) — see §5.10
│   └── api/
├── shared/
│   ├── i18n/           # next-intl config, locale resolution, server action — see §5.9
│   └── ...
└── ...

messages/               # next-intl translation messages — messages/<locale>.json (see §5.9)
```

- `src/app/_layout/` 라인은 `src/app/` 항목 바로 아래에 둔다 (현재 `└── api/` 라인 위).
- `src/shared/i18n/` 라인은 `src/shared/` 의 기존 항목들과 알파벳/논리적 순서를 유지해 삽입한다 (`hooks` 다음, `providers` 위 권장).
- `messages/` 는 `src/` 외부이므로 트리 블록 **하단에 별도 라인**으로 추가한다 (`proxy.ts` 라인 아래, 트리 바깥 한 줄).

기존 "Rule: when adding a new domain..." 문장은 그대로 유지.

### 4.2 §5.9 Internationalization (i18n) — 신설

§5.8 Domain-Driven Layout 바로 다음에 추가한다.

#### Library & Wiring

- 라이브러리: `next-intl` v4.
- `next.config.ts` 에서 다음과 같이 wrap (단일 소스):
  ```ts
  const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');
  export default withNextIntl(nextConfig);
  ```
- 런타임 messages 로딩은 `src/shared/i18n/request.ts` 의 `getRequestConfig` 에서 수행한다.

#### Locale Resolution

`src/shared/i18n/locale.ts` 의 `getUserLocale()` (server-only) 가 우선순위에 따라 locale 을 결정한다:

1. `locale` cookie (`COOKIE_NAME_LOCALE`) — 값이 `SUPPORTED_LOCALES` 에 속할 때.
2. 요청 헤더 `Accept-Language` 의 첫 토큰이 `SUPPORTED_LOCALES` 중 하나로 시작할 때.
3. 위 두 조건 모두 실패 → `DEFAULT_LOCALE` (`'ko'`).

`SUPPORTED_LOCALES`, `LOCALE_META`, `DEFAULT_LOCALE`, `COOKIE_NAME_LOCALE` 은 **모두 `src/shared/i18n/config.ts` 에 한 번만 정의**한다 (single source of truth). 다른 곳에서 같은 상수를 재정의하지 않는다.

#### Message Files

- 위치: 저장소 루트 `messages/<locale>.json` (예: `messages/ko.json`, `messages/en.json`).
- 키 구조: `namespace.key` 네스팅. 예:
  ```json
  { "metadata": { "title": "...", "description": "..." } }
  ```
- 사용 시 `getTranslations('metadata')` 또는 `useTranslations('metadata')` 처럼 namespace 단위로 호출한다.
- 새 locale 추가 절차 (반드시 모두 동기 갱신):
  1. `src/shared/i18n/config.ts` 의 `SUPPORTED_LOCALES` 에 코드 추가.
  2. 같은 파일의 `LOCALE_META` 에 `{ code, label, htmlLang }` 추가.
  3. `messages/<new-locale>.json` 신규 작성 (모든 기존 키 채우기).

#### Usage — Server vs Client

- **Server Component / Route Handler / `generateMetadata`** — `next-intl/server` 의 `getTranslations(namespace)` / `getMessages()` 사용. 동기 hook (`useTranslations`) 은 사용하지 않는다.
- **Client Component** — `next-intl` 의 `useTranslations(namespace)`, `useLocale()` 사용.
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

#### Locale Change

- 진입 함수: `src/shared/i18n/localeAction.ts` 의 `setLocale(locale)` server action.
  - `locale` cookie 저장 (`maxAge = LOCALE_COOKIE_MAX_AGE`, `sameSite: 'lax'`).
  - `revalidatePath('/', 'layout')` 으로 root layout 재검증 → 새 locale 메시지 적용.
- UI 진입점: `src/shared/components/i18n/LanguageSwitcher.tsx`. 새로운 locale 변경 UI 가 필요하면 이 컴포넌트를 재사용하거나, 동일하게 `setLocale` + `useTransition` 패턴을 따른다.
- 클라이언트에서 직접 cookie 를 조작하지 않는다 — 항상 `setLocale` 을 통한다.

### 4.3 §5.10 App Router Layout Components — 신설

§5.9 바로 다음에 추가한다.

#### 핵심 규칙

- 어떤 디렉토리든 `layout.tsx` 가 sub-component 를 필요로 하면, **같은 디렉토리에 `_layout/` private folder** 를 만들어 그 안에 sub-component 를 둔다. underscore prefix 는 Next.js 가 라우트에서 제외하는 [private folder](https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders) 규약이다.
- 파일명은 §5.2 그대로 `PascalCase.tsx`. 예: `Header.tsx`, `Contents.tsx`, `Footer.tsx`, `Sidebar.tsx`.
- `layout.tsx` 에서 import 할 때는 같은 폴더이므로 **상대경로** (`./_layout/Header`) 를 사용한다.
- 다른 layout 의 `_layout/` 컴포넌트는 import 하지 않는다 — 각 `_layout/` 은 그 layout 전용이다.
- Cross-layout 으로 재사용해야 하는 컴포넌트는 `_layout/` 이 아니라 `src/shared/components/<area>/` 로 승격한다 (§4 Directory Structure 참조).
- 적용 범위: root (`src/app/_layout/`) 와 nested layout (예: `src/app/admin/_layout/`) **모두 동일 규칙**.

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

- `src/app/layout.tsx` 는 `./_layout/Header`, `./_layout/Contents`, `./_layout/Footer` 를 사용한다.
- `src/app/admin/layout.tsx` 는 `./_layout/Sidebar` 를 사용한다.
- `admin/_layout/Sidebar` 를 root layout 에서 사용하고 싶다면 먼저 `src/shared/components/` 로 승격한다.

## 5. 비-범위 결정 사항 (참고)

다음은 본 스펙의 범위가 아니며, 향후 별도 작업으로 다룬다:

- 기존 `src/app/_layout/Header.tsx` 등의 i18n 적용 (현재 한국어/영어 텍스트 미적용).
- locale 별 number/date formatting 가이드 (현재 `dayjs` 와 별도 운영).
- ICU plural / select 메시지 사용 가이드.
- E2E 다국어 테스트 — 테스트 러너 자체가 아직 도입되지 않음 (§3 Development Environment 참고).

## 6. Acceptance Criteria

- `AGENTS.md` §4 트리에 `src/app/_layout/`, `src/shared/i18n/`, `messages/` 가 추가되어 있다.
- `AGENTS.md` 에 §5.9 Internationalization (i18n) 가 존재하고 §4 Library & Wiring / Locale Resolution / Message Files / Usage / Locale Change 다섯 블록을 모두 포함한다.
- `AGENTS.md` 에 §5.10 App Router Layout Components 가 존재하고 핵심 규칙 + 디렉토리 예시를 포함한다.
- §6 Linting & Formatting 이후의 섹션 번호는 변하지 않았다.
- `yarn prettier` 적용 후 diff 가 없다 (마크다운은 prettier 대상이 아닐 수 있으나, 적용 시 변동 없음을 확인).
- 커밋 메시지 prefix 는 `docs:` 이며, 한국어 요약을 포함한다 (§7.2).

## 7. Risks & Notes

- **트리 alphabetization** — 기존 §4 트리는 엄격한 알파벳 순이 아니다 (`api/` 가 먼저, 나머지 그룹). `_layout/` 을 `api/` 위에 둔다 (private folder + 라우팅 외 관심사를 먼저 노출).
- **`next-intl` 메이저 버전 변동** — 본 스펙은 v4 API (`getRequestConfig`, `getTranslations`, `useTranslations`) 기준. 향후 v5+ 로 올라가면 본 섹션도 함께 갱신해야 한다 (§2 Tech Stack 의 "Refer to `package.json` for exact pinned versions" 와 동일 정책).
- **명세 충돌 방지** — §5.4 React Components 의 client component section 주석 규칙 (`// hooks`, `// queries` 등) 은 i18n hook (`useTranslations`, `useLocale`) 에도 그대로 적용된다 (§5.9 예시에서 `// hooks` 헤더로 명시).
