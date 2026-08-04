# Toast UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** daisyUI `alert` 기반 toast 를 Spotify 디자인 시스템 기반 카드(시안 B: Card + Progress)로 재디자인한다.

**Architecture:** `Toast.tsx` 를 커스텀 카드로 교체하고, 자동 닫힘 타이머를 progress bar 의 CSS animation (`onAnimationEnd`) 으로 옮긴다. 이에 따라 `ToastProvider.tsx` 의 1초 interval 제거 로직과 `createdDate`/`dayjs` 를 삭제한다. 테마는 `globals.css` 의 기존 `dark` custom variant (`[data-theme=dark]`) 를 사용한다.

**Tech Stack:** Next.js 16, React 19, Tailwind 4 (arbitrary values + `dark:` variant), classnames, react-icons

**Spec:** `docs/superpowers/specs/2026-08-05-toast-redesign-design.md`

## Global Constraints

- `ToastContext.push(message, level)` API 시그니처와 limit/stack 동작(우측 상단)은 변경하지 않는다.
- 테스트 프레임워크 없음 — 검증은 `yarn lint` + dev 서버 육안 확인.
- React 섹션 주석 컨벤션 유지 (`// useState`, `// handle` 등 — `docs/agents/conventions/react-sections.md`).
- 새 의존성 추가 금지. 새 CSS 변수 도입 금지 — 전역 CSS 추가는 keyframes 2개뿐.
- 레벨 컬러 (light / dark): success `#14a94b`/`#1ed760`, error `#dc4657`/`#f3727f`, warning `#d97706`/`#ffa42b`, info `#2f7fd9`/`#539df5`, message 는 텍스트 컬러(중립).

---

### Task 1: Toast.tsx 재디자인 + keyframes

**Files:**
- Modify: `src/app/globals.css` (keyframes 추가)
- Modify: `src/shared/components/toast/Toast.tsx` (전체 교체)

**Interfaces:**
- Consumes: `ToastMessage`, `MessageLevel` from `@/shared/components/toast/ToastProvider` (Task 2 에서 `createdDate` 가 제거되지만 이 Task 는 `id`/`level`/`message` 만 사용하므로 순서 무관)
- Produces: `Toast` component — props `{ message: ToastMessage; timeout: number; onRemove?: () => void }` (기존과 동일. `onRemove` 는 퇴장 애니메이션 완료 후 호출됨)

- [ ] **Step 1: `globals.css` 에 keyframes 추가**

파일 끝에 추가:

```css
@keyframes toast-in {
  from {
    transform: translateX(24px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
```

- [ ] **Step 2: `Toast.tsx` 전체 교체**

```tsx
'use client';

import { useState } from 'react';

import { FaCheckCircle } from 'react-icons/fa';
import { IoClose, IoWarning } from 'react-icons/io5';
import { RiErrorWarningFill, RiInformationLine } from 'react-icons/ri';
import { TbMessageFilled } from 'react-icons/tb';

import { MessageLevel, ToastMessage } from '@/shared/components/toast/ToastProvider';

import cx from 'classnames';

interface ToastProps {
  message: ToastMessage;
  timeout: number;
  onRemove?: () => void;
}

interface ToastIconProps {
  level: MessageLevel;
}

const LEVEL_STYLES: Record<MessageLevel, { label: string; text: string; bar: string }> = {
  success: { label: 'Success', text: 'text-[#14a94b] dark:text-[#1ed760]', bar: 'bg-[#14a94b] dark:bg-[#1ed760]' },
  error: { label: 'Error', text: 'text-[#dc4657] dark:text-[#f3727f]', bar: 'bg-[#dc4657] dark:bg-[#f3727f]' },
  warning: { label: 'Warning', text: 'text-[#d97706] dark:text-[#ffa42b]', bar: 'bg-[#d97706] dark:bg-[#ffa42b]' },
  info: { label: 'Info', text: 'text-[#2f7fd9] dark:text-[#539df5]', bar: 'bg-[#2f7fd9] dark:bg-[#539df5]' },
  message: { label: 'Message', text: 'text-[#181818] dark:text-white', bar: 'bg-[#181818] dark:bg-white' },
};

function ToastIcon({ level }: Readonly<ToastIconProps>) {
  switch (level) {
    case 'warning':
      return <IoWarning className="size-5" />;
    case 'success':
      return <FaCheckCircle className="size-5" />;
    case 'error':
      return <RiErrorWarningFill className="size-5" />;
    case 'message':
      return <TbMessageFilled className="size-5" />;
    default:
      return <RiInformationLine className="size-5" />;
  }
}

export default function Toast({ message, timeout, onRemove }: Readonly<ToastProps>) {
  // useState
  const [isLeaving, setIsLeaving] = useState<boolean>(false);

  const levelStyle = LEVEL_STYLES[message.level];

  // handle
  const handleClose = () => {
    setIsLeaving(true);
  };

  const handleTransitionEnd = () => {
    isLeaving && onRemove?.();
  };

  return (
    <div
      className={cx(
        'group relative flex w-[340px] items-start gap-3 overflow-hidden rounded-lg p-3.5 pb-4',
        'bg-[#fdfdfd] text-[#181818] shadow-[0_8px_24px_rgba(0,0,0,0.18)]',
        'dark:bg-[#181818] dark:text-white dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)]',
        'animate-[toast-in_0.35s_cubic-bezier(0.2,0.9,0.3,1)]',
        'transition-[opacity,transform] duration-300',
        { 'translate-x-6 opacity-0': isLeaving },
      )}
      role="alert"
      onTransitionEnd={handleTransitionEnd}
    >
      <span className={cx('mt-0.5 flex-none', levelStyle.text)}>
        <ToastIcon level={message.level} />
      </span>
      <div className="min-w-0 flex-1">
        <div className={cx('text-xs font-semibold tracking-[1.4px] uppercase', levelStyle.text)}>
          {levelStyle.label}
        </div>
        <p className="text-sm text-pretty break-keep text-[#4d4d4d] dark:text-[#cbcbcb]">{message.message}</p>
      </div>
      <button
        className="flex-none cursor-pointer p-0.5 text-[#6a6a6a] dark:text-[#b3b3b3]"
        type="button"
        onClick={handleClose}
      >
        <IoClose className="size-4" />
      </button>
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-black/8 dark:bg-white/8">
        <div
          className={cx('h-full group-hover:[animation-play-state:paused]', levelStyle.bar)}
          style={{ animation: `toast-shrink ${timeout}s linear forwards` }}
          onAnimationEnd={handleClose}
        />
      </div>
    </div>
  );
}
```

동작 요약:
- 진입: `toast-in` animation (우측 slide-in + fade, 0.35s).
- 자동 닫힘: progress fill 의 `toast-shrink` animation 이 `timeout` 초 후 끝나면 `onAnimationEnd` → `handleClose` → 퇴장 transition → `onTransitionEnd` → `onRemove`.
- hover 일시정지: 카드(`group`) hover 시 fill 의 `animation-play-state: paused`.
- 닫기 버튼: 동일하게 `handleClose` 경유 — 타이머 상태와 무관하게 즉시 퇴장.

- [ ] **Step 3: lint 확인**

Run: `yarn lint`
Expected: 에러 없음

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/shared/components/toast/Toast.tsx
git commit -m "feat: toast ui spotify 디자인 시스템 기반 재디자인"
```

---

### Task 2: ToastProvider 타이머 로직 제거

**Files:**
- Modify: `src/shared/components/toast/ToastProvider.tsx` (전체 교체)

**Interfaces:**
- Consumes: `Toast` from Task 1 (props 동일)
- Produces: `ToastMessage = { id: string; level: MessageLevel; message: string }` (`createdDate` 제거), `ToastContext.push(message: string, level: MessageLevel)` (변경 없음)

- [ ] **Step 1: `ToastProvider.tsx` 전체 교체**

```tsx
'use client';

import { ReactNode, createContext, useMemo, useState } from 'react';

import { v4 as uuid } from 'uuid';

import Toast from './Toast';

export type MessageLevel = 'success' | 'warning' | 'error' | 'info' | 'message';

export interface ToastMessage {
  id: string;
  level: MessageLevel;
  message: string;
}

interface ToastProviderContextState {
  messages: ToastMessage[];
  push: (message: string, level: MessageLevel) => void;
}

interface ToastProviderProps {
  children: ReactNode;
  limit: number;
  timeout: number;
}

export const ToastContext = createContext<ToastProviderContextState>({
  messages: [],
  push: () => {},
});

export default function ToastProvider({ children, limit, timeout }: Readonly<ToastProviderProps>) {
  // state
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  // handle
  const handlePushMessage = (message: string, level: MessageLevel) => {
    setMessages((prev) => {
      const newMessages = prev.slice();

      if (newMessages.length >= limit) {
        newMessages.splice(newMessages.length - 1, 1);
      }

      newMessages.unshift({
        id: uuid(),
        level,
        message,
      });

      return newMessages;
    });
  };

  const handleRemove = (id: string) => {
    setMessages((prev) => prev.slice().filter((item) => item.id !== id));
  };

  // memorize
  const memorizeValue = useMemo(() => ({ messages, push: handlePushMessage }), [messages]);

  return (
    <ToastContext value={memorizeValue}>
      <div className="fixed top-20 right-0 z-50 mt-2 mr-5 mb-2 flex flex-col items-end gap-2">
        {messages.map((message) => (
          <Toast
            key={`alert-${message.id}`}
            message={message}
            timeout={timeout}
            onRemove={() => handleRemove(message.id)}
          />
        ))}
      </div>
      {children}
    </ToastContext>
  );
}
```

변경점: 1초 interval `useEffect` 삭제 (제거 시점이 Toast 의 `onAnimationEnd` 로 이동), `dayjs` import/`createdDate` 필드 삭제. 나머지(limit, unshift, 스택 위치)는 기존 그대로.

- [ ] **Step 2: `createdDate` 참조 잔존 확인**

Run: `grep -rn "createdDate" src/shared/components/toast/ && echo "FOUND — 제거 필요" || echo "OK"`
Expected: OK

- [ ] **Step 3: lint 확인**

Run: `yarn lint`
Expected: 에러 없음

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/toast/ToastProvider.tsx
git commit -m "refactor: toast 자동 닫힘 타이머를 progress animation 으로 이동"
```

---

### Task 3: 육안 검증 (light/dark × 5 levels)

**Files:**
- Modify (임시 후 원복): `src/app/page.tsx`

**Interfaces:**
- Consumes: `ToastContext.push` from Task 2

- [ ] **Step 1: `page.tsx` 에 임시 데모 버튼 추가**

`src/app/page.tsx` 의 `Home` 컴포넌트에 임시 추가 (기존 내용 유지):

```tsx
// 상단 import 추가
import { use } from 'react';

import { MessageLevel, ToastContext } from '@/shared/components/toast/ToastProvider';

// Home 컴포넌트 안
const { push } = use(ToastContext);
const levels: MessageLevel[] = ['success', 'error', 'warning', 'info', 'message'];

// JSX 안 (임시)
<div className="flex gap-2">
  {levels.map((level) => (
    <button key={level} className="btn btn-sm" type="button" onClick={() => push(`${level} 메시지입니다.`, level)}>
      {level}
    </button>
  ))}
</div>
```

- [ ] **Step 2: dev 서버로 확인**

Run: `yarn dev`

확인 항목 (light / dark 테마 각각 — 테마는 기존 theme 전환 UI 또는 `data-theme` cookie 로 변경):
- 5개 레벨 각각 레벨 컬러/라벨/아이콘 표시
- 진입 시 우측 slide-in, progress bar 가 5초 동안 감소 후 자동 제거 (fade + 우측 slide-out)
- hover 시 progress 정지, 벗어나면 재개
- 닫기 버튼 즉시 퇴장
- 6개 이상 push 시 오래된 것부터 제거 (limit 5)
- 긴 메시지(2줄 이상) 카드 높이 확장

- [ ] **Step 3: 임시 코드 원복**

Run: `git checkout src/app/page.tsx`

- [ ] **Step 4: 최종 lint + 상태 확인**

Run: `yarn lint && git status --short`
Expected: lint 에러 없음, `page.tsx` 변경 없음
