# Client Component Section Comment Convention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `AGENTS.md` §5.4 React Components 하위에 client component / hook / shared provider 의 함수 본문 섹션 주석 컨벤션을 명시한다.

**Architecture:** 단일 문서 수정 작업. 새 h4 sub-heading `#### Client Component Section Comments` 를 §5.4 본문 끝과 §5.5 시작 사이에 삽입한다. 코드 변경 / ESLint rule 추가는 없다. `CLAUDE.md` 는 `@AGENTS.md` 재참조이므로 별도 수정 불필요.

**Tech Stack:** Markdown (AGENTS.md), `yarn lint` (영향 없음 — `./src` 만 대상), `yarn prettier` (markdown 비대상).

**Spec:** `docs/superpowers/specs/2026-05-14-client-component-comment-convention-design.md`

---

## File Structure

| 파일 | 변경 유형 | 책임 |
|---|---|---|
| `AGENTS.md` | Modify (line 102~103 사이 삽입) | §5.4 하위에 새 sub-heading 추가 |
| 그 외 | 변경 없음 | (spec §7 점진 마이그레이션 정책) |

---

## Task 1: AGENTS.md §5.4 하위에 Section Comment 컨벤션 추가

**Files:**
- Modify: `AGENTS.md:97-104` (§5.4 본문 끝과 §5.5 사이에 새 sub-heading 삽입)

**Context:**

현재 `AGENTS.md` 라인 97~104 의 모습:

````markdown
### 5.4 React Components

- Server Components are the default. Add `'use client'` at the top **only when
  state, effects, event handlers, or browser APIs are needed**.
- Pattern: `default export` the public component; co-locate small
  non-reusable sub-components in the same file.

### 5.5 State Management — Zustand
````

라인 102 (두 번째 bullet 끝) 와 라인 103 (빈 줄) 사이가 아니라, 라인 103 (빈 줄) 과 라인 104 (`### 5.5 ...`) 사이에 새 sub-heading 블록을 삽입한다. 결과적으로 §5.4 본문 → 빈 줄 → 새 sub-heading → 빈 줄 → §5.5 형태가 된다.

- [x] **Step 1: Edit AGENTS.md — §5.4 와 §5.5 사이에 새 sub-heading 삽입**

`Edit` 도구로 다음 치환을 적용한다. `old_string` 은 현 §5.4 마지막 bullet + 빈 줄 + §5.5 헤더이고, `new_string` 은 그 사이에 새 sub-section 을 끼워 넣은 것이다.

`old_string`:

````markdown
- Pattern: `default export` the public component; co-locate small
  non-reusable sub-components in the same file.

### 5.5 State Management — Zustand
````

`new_string`:

````markdown
- Pattern: `default export` the public component; co-locate small
  non-reusable sub-components in the same file.

#### Client Component Section Comments

`'use client'` 컴포넌트, client hook (`useXxx.tsx`), shared provider 는 함수
본문을 아래 섹션 주석으로 구분한다. **순서는 고정**이며 사용하지 않는
섹션은 주석을 **생략**한다 (빈 헤더를 남기지 않는다).

순서:

1. `// ref` — `useRef`
2. `// context` — `useContext`
3. `// state` — `useState`, `useReducer`
4. `// store` — Zustand selector (`useStore(...)`)
5. `// queries` — React Query hook (`useXxx({...})`, mutation hook 포함)
6. `// useEffect`
7. `// useLayoutEffect`
8. `// handle` — 이벤트 핸들러 / 액션 함수 (`handleXxx`) 등 일반 함수 정의
9. `// memorize` — `useMemo`
10. `// callback` — `useCallback`

같은 섹션 안에서는 여러 줄을 자유롭게 작성한다. 같은 파일에 co-locate
된 sub-component (예: `UserList.tsx` 의 `UserItem`) 도 동일 규칙을 따른다.
Server Component (디렉티브 없음) 은 적용 대상이 아니다.

표준 예시:

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

기존 파일은 일괄 마이그레이션하지 않는다. 해당 파일을 다른 작업으로
수정할 때 같은 PR 안에서 점진적으로 정리한다.

### 5.5 State Management — Zustand
````

- [x] **Step 2: 변경 결과 시각 확인**

Run: `sed -n '97,170p' AGENTS.md`

기대 출력 — §5.4 의 기존 bullet 2개 → 빈 줄 → `#### Client Component Section Comments` → 본문 (순서/예시/마이그레이션 정책) → 빈 줄 → `### 5.5 State Management — Zustand` 의 순서로 나타난다. `### 5.4.1` 같은 번호는 사용하지 않는다 (기존 AGENTS.md 의 sub-section 패턴이 없으므로 h4 sub-heading 형식만 사용).

- [x] **Step 3: ESLint 회귀 없는지 확인**

Run: `yarn lint`

기대: AGENTS.md 는 `./src` 밖이므로 영향 없음. 기존 `yarn lint` 가 통과하던 상태 그대로여야 한다. 새로운 에러가 등장하면 plan 외 원인이므로 별도 조사한다.

- [x] **Step 4: prettier check 영향 없음 확인**

`AGENTS.md §6` 에 따르면 prettier 대상은 `**/*.{js,jsx,ts,tsx,css,html}` 로 markdown 비대상이다. 따라서 자동 포매팅 실행은 생략한다. 안전 확인용으로 아래 명령을 실행해 변경 사항이 markdown 외 파일에 없음을 확인한다.

Run: `git diff --name-only`

기대 출력:
```
AGENTS.md
```

- [x] **Step 5: Commit**

```bash
git add AGENTS.md
git commit -m "$(cat <<'EOF'
docs: AGENTS.md §5.4 client component 섹션 주석 컨벤션 추가

'use client' 컴포넌트, client hook, shared provider 의 함수 본문을
ref/context/state/store/queries/useEffect/useLayoutEffect/handle/
memorize/callback 순서의 섹션 주석으로 구분하도록 명시. 사용하지 않는
섹션은 주석을 생략. ESLint 강제는 도입하지 않고 PR 리뷰로 점검.

Spec: docs/superpowers/specs/2026-05-14-client-component-comment-convention-design.md
EOF
)"
```

기대 출력: `master <sha>] docs: AGENTS.md §5.4 client component 섹션 주석 컨벤션 추가` + `1 file changed, N insertions(+)`.

- [x] **Step 6: 결과 확인**

Run: `git log -1 --stat`

기대: 위 커밋이 가장 최근 커밋이고, `AGENTS.md` 한 파일만 수정됨.

---

## Task 2 (Optional): 기존 client component 1~2 개에 동일 컨벤션 시범 적용

> **이 task 는 권장이지만 필수가 아니다.** spec §7 의 "점진 마이그레이션" 정책상 이번 PR 의 본 작업 (§5.4 컨벤션 명시) 과 분리해도 된다. 같은 PR 에 묶고 싶지 않다면 Task 2 전체를 생략한다.

**Files:**
- Modify: `src/shared/components/toast/ToastProvider.tsx` (이미 부분 적용 상태)
- Modify: `src/domain/users/components/UserList.tsx` (이미 부분 적용 상태)

**Why these two:**

- `ToastProvider.tsx` — 이미 `// state`, `// useEffect`, `// handle`, `// memorize` 가 적용되어 있어 누락 섹션만 정렬하면 신규 컨벤션 예시로 가장 가깝다.
- `UserList.tsx` — 빈 `// state` placeholder 가 남아 있어 spec §5 "빈 섹션 생략" 정책 적용 사례로 적합하다.

- [ ] **Step 1: `ToastProvider.tsx` 현 상태 점검**

Run: `sed -n '38,82p' src/shared/components/toast/ToastProvider.tsx`

기대: 현재 순서는 `// state` (line 39) → `// useEffect` (line 42) → `// handle` (line 53) → `// memorize` (line 79). 새 컨벤션의 고정 순서 (state → useEffect → handle → memorize) 와 이미 일치하므로 **변경 불필요**. 이 step 은 확인만 수행한다.

- [ ] **Step 2: `UserList.tsx` 의 빈 `// state` 주석 제거 (sub-component `UserItem`)**

`Edit` 도구로 다음 치환을 적용한다.

`old_string` (현재 line 25~28):

```tsx
}>) => {
  // state

  // handle
```

`new_string`:

```tsx
}>) => {
  // handle
```

기대 효과: 빈 섹션 헤더 제거. spec §5 "사용 안 하는 섹션은 생략" 정책에 부합.

- [ ] **Step 3: ESLint 회귀 없는지 확인**

Run: `yarn lint`

기대: 통과. `UserItem` 의 함수 본문이 정상이며 미사용 import 가 새로 생기지 않음.

- [ ] **Step 4: prettier 적용**

Run: `yarn prettier`

기대: 변경 없음 또는 minor whitespace 수정만 발생. `yarn prettier` 가 자동 적용하므로 결과 diff 를 다음 step 에서 확인한다.

- [ ] **Step 5: 변경 범위 확인**

Run: `git diff --name-only`

기대 출력:
```
src/domain/users/components/UserList.tsx
```

`ToastProvider.tsx` 는 Step 1 결과 변경 없음이어야 한다. 다른 파일이 함께 변경되어 있으면 prettier 가 의도치 않은 곳까지 손댔다는 신호이므로 `git diff` 로 원인 파악 후 진행 여부 재결정.

- [ ] **Step 6: Commit**

```bash
git add src/domain/users/components/UserList.tsx
git commit -m "$(cat <<'EOF'
refactor: UserList.tsx UserItem 의 빈 section 주석 제거

신규 컨벤션 (AGENTS.md §5.4) 의 "사용하지 않는 섹션 주석 생략" 정책에
따라 UserItem 의 빈 // state 헤더를 제거.
EOF
)"
```

기대 출력: `master <sha>] refactor: ...` + `1 file changed, 0 insertions(+), 1 deletion(-)` 부근.

---

## Self-Review Notes

본 plan 을 spec 과 비교하며 자체 점검한 결과:

- **Spec coverage**
  - spec §2 적용 대상 → Task 1 Step 1 본문 "client component, client hook, shared provider" 명시 ✓
  - spec §3 표준 섹션과 순서 → Task 1 Step 1 의 1~10 번호 리스트 ✓
  - spec §4 표준 예시 → Task 1 Step 1 의 tsx 코드 블록 ✓
  - spec §5 빈 섹션 처리 → Task 1 Step 1 "빈 헤더를 남기지 않는다" 명시, Task 2 시범 적용 ✓
  - spec §6 Enforcement (문서화만) → ESLint rule task 없음, 의도된 부재 ✓
  - spec §7 기존 코드 마이그레이션 → Task 1 Step 1 마지막 단락에 명시, Task 2 는 선택적 ✓
  - spec §8 변경 파일 → AGENTS.md (Task 1), CLAUDE.md 변경 없음 ✓
  - spec §10 검증 기준 (yarn lint 통과) → Task 1 Step 3 ✓

- **Placeholder scan**: TBD/TODO 없음. 모든 code/diff/명령어 완전함. ✓

- **Type consistency**: 섹션 이름과 순서가 spec / plan / 예시 코드 전체에서 동일. `useLayoutEffect` 는 7번 순위로 표/리스트에 명시했지만 예시 코드에는 (실제 사용처 없으므로) 등장하지 않음 — 이는 §5 "빈 섹션 생략" 정책에 부합하며 의도된 일관성. ✓
