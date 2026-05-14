# Client Component Section Comment Convention

- **Date:** 2026-05-14
- **Status:** Approved (brainstorming 단계 완료, 구현 계획 작성 대기)
- **Target Doc:** `AGENTS.md` §5.4 React Components 하위 절로 추가
- **Cascades to:** `CLAUDE.md` 는 첫 줄 `@AGENTS.md` 참조이므로 별도 수정 불필요

## 1. 배경

`src/` 내 client component 와 client hook 일부 (`UserList.tsx`,
`ToastProvider.tsx`, `useModal.tsx` 등) 에서 이미 `// state`, `// useEffect`,
`// handle`, `// memorize` 같은 섹션 주석이 부분적으로 사용되고 있다.
하지만,

- 등장하는 섹션 종류가 파일마다 다르고,
- 순서가 통일되지 않았으며,
- 어떤 hook 이 어느 섹션에 속하는지에 대한 합의가 문서화되어 있지 않다.

본 컨벤션은 함수형 client component / hook / provider 의 본문 구조를
표준화하여 PR 리뷰 시 인지 부하를 낮추고, 다양한 code agent (Claude Code,
Cursor, Codex, Aider 등) 가 일관된 출력을 생성하도록 한다.

## 2. 적용 대상

다음 파일들은 본 컨벤션을 따른다.

- `'use client'` 디렉티브가 붙은 React 컴포넌트 파일 (`*.tsx`)
- Client hook 파일 (`useXxx.tsx`) — 예: `src/shared/hooks/useModal.tsx`
- Shared provider 컴포넌트 — 예:
  `src/shared/providers/theme/ThemeProvider.tsx`,
  `src/shared/components/toast/ToastProvider.tsx`

Server Component (디렉티브 없음) 은 hook 사용이 거의 없으므로 적용 대상이
아니다. Route handler (`src/app/api/**`) 와 `src/utils/**` 의 순수 함수도
대상이 아니다.

## 3. 표준 섹션과 순서

함수 본문은 아래 섹션 주석으로 영역을 나눈다. **순서는 고정**이며 사용
하지 않는 섹션의 주석은 **생략**한다 (빈 섹션 헤더를 남기지 않는다).

| # | 섹션 주석 | 포함되는 hook / 코드 |
|---|---|---|
| 1 | `// ref` | `useRef` |
| 2 | `// context` | `useContext` |
| 3 | `// state` | `useState`, `useReducer` |
| 4 | `// store` | Zustand selector (`useStore(...)`) |
| 5 | `// queries` | React Query hook (`useXxx({...})`, mutation hook 포함) |
| 6 | `// useEffect` | `useEffect` |
| 7 | `// useLayoutEffect` | `useLayoutEffect` |
| 8 | `// handle` | 이벤트 핸들러 / 액션 함수 (`handleXxx`) 등 일반 함수 정의 |
| 9 | `// memorize` | `useMemo` |
| 10 | `// callback` | `useCallback` |

같은 섹션 안에서는 자유롭게 여러 줄을 작성할 수 있다 (예: `useState` 5
개를 `// state` 아래 묶어 둔다).

## 4. 표준 예시

```tsx
'use client';

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

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

같은 파일 안에 co-locate 된 sub-component (예: `UserList.tsx` 의
`UserItem`) 도 동일 규칙을 따른다.

## 5. 빈 섹션 처리

해당 섹션에 속하는 코드가 하나도 없으면 **주석 자체를 적지 않는다**.
빈 `// state` 같은 placeholder 는 남기지 않는다. 이는 다음 두 가지
이유 때문이다.

- 시각적 잡음을 줄인다.
- 향후 검사 도구(필요해질 경우)가 "주석은 있는데 본문이 없는" 케이스를
  특수 처리할 필요가 없게 한다.

## 6. Enforcement

- **단계 1 (현재):** 문서화만. AGENTS.md §5.4 에 명시하고 PR 리뷰에서 점검.
  `@bob-park/eslint-config-bobpark` preset 은 건드리지 않는다.
- **단계 2 (향후 검토):** 사용량이 늘고 일관성 문제가 반복되면 custom
  ESLint rule 도입을 별도 spec 으로 다룬다. 본 spec 의 범위는 아니다.

## 7. 기존 코드 마이그레이션

- **신규 작성:** 본 규칙 강제.
- **기존 파일:** 일괄 마이그레이션 PR 은 만들지 않는다. 해당 파일을
  다른 작업으로 수정할 때 같은 PR 안에서 점진적으로 정리한다.
- 부분 적용 상태의 파일 (예: `UserList.tsx` 의 `// state`, `// handle`)
  은 새 섹션이 필요해질 때까지 그대로 두어도 된다.

## 8. 변경되는 파일 (예상)

| 파일 | 변경 내용 |
|---|---|
| `AGENTS.md` | §5.4 하위에 `#### Client Component Section Comments` 추가 |
| `CLAUDE.md` | 변경 없음 (`@AGENTS.md` 참조로 자동 반영) |
| `src/**/*.tsx` | 본 spec 에서는 변경하지 않음 (점진 마이그레이션 정책) |

## 9. Out of Scope

- ESLint custom rule 작성
- 기존 코드 일괄 리포맷 PR
- Server Component 의 코드 구조 규칙
- `src/utils/**` 순수 함수 / route handler 규칙
- Class 컴포넌트 (이 프로젝트에서는 사용하지 않음)

## 10. 검증 기준

본 spec 의 구현이 완료되었다고 판단하는 조건:

1. `AGENTS.md` §5.4 하위에 본 컨벤션이 §3~§7 의 내용으로 반영되어 있다.
2. 표준 예시 코드 (§4) 가 AGENTS.md 에 함께 포함되어 있다.
3. `yarn lint` 가 통과한다 (문서 변경뿐이므로 영향 없음).
4. 새 client component 를 작성하는 agent 가 본 컨벤션을 따른 출력을
   재현 가능하다.
