# Toast UI Redesign — Spotify Design System

날짜: 2026-08-05
근거 템플릿: `docs/design/spotify-design.md`
선택 시안: B (Card + Progress) — 목업 비교(A: Pill / B: Card + Progress / C: Accent Bar) 후 사용자 확정

## 목표

`src/shared/components/toast/` 의 toast 를 daisyUI `alert` 기반에서 Spotify 디자인
시스템 기반 커스텀 카드로 재디자인한다. 범위는 **비주얼 + 인터랙션**이며,
`ToastContext.push(message, level)` API 와 limit/stack 동작은 변경하지 않는다.

## 비주얼 (Toast.tsx)

- 카드: 8px radius, 340px 너비, `overflow: hidden` (progress bar 클리핑).
- 배경/섀도우:
  - dark — `#181818`, `rgba(0,0,0,.5) 0 8px 24px`
  - light — `#fdfdfd`, `rgba(0,0,0,.18) 0 8px 24px`
- 테마: 기존 `data-theme` cookie 를 그대로 따른다. `src/app/globals.css` 에 이미
  정의된 `dark` custom variant (`[data-theme=dark]` 스코프) 를 사용해 Tailwind
  `dark:` variant + arbitrary value 클래스로 표현한다 (예: `bg-[#fdfdfd]
  dark:bg-[#181818]`). 새 CSS 변수는 도입하지 않고, progress bar 의 `shrink`
  keyframes 만 `globals.css` 에 추가한다.
- 구조 (좌 → 우):
  1. 레벨 아이콘 — 기존 react-icons 유지, 레벨 컬러 틴트
  2. 본문 — 업퍼케이스 레벨 라벨 (12px, weight 600, letter-spacing 1.4px,
     레벨 컬러) + 메시지 (14px, regular, dark `#cbcbcb` / light `#4d4d4d`)
  3. 닫기 버튼 — 아이콘만, muted 컬러 (dark `#b3b3b3` / light `#6a6a6a`)
- 레벨 컬러:

  | level   | dark      | light     |
  | ------- | --------- | --------- |
  | success | `#1ed760` | `#14a94b` |
  | error   | `#f3727f` | `#dc4657` |
  | warning | `#ffa42b` | `#d97706` |
  | info    | `#539df5` | `#2f7fd9` |
  | message | 텍스트 컬러(중립) | 텍스트 컬러(중립) |

## 인터랙션

- 진입: 우측에서 slide-in + fade, 0.35s, `cubic-bezier(.2,.9,.3,1)`.
- 퇴장: fade + 우측 slide-out (transition 후 remove).
- **progress bar = 타이머**: 하단 3px 바가 CSS animation 으로 `timeout` 초 동안
  100% → 0% 로 줄어들고, `onAnimationEnd` 에서 `onRemove` 를 호출한다.
  hover 시 `animation-play-state: paused` 로 바와 타이머가 함께 정지한다.
  별도 JS 타이머가 없으므로 동기화 문제가 없다.
- progress fill 컬러 = 레벨 컬러. 트랙: dark `rgba(255,255,255,.08)` /
  light `rgba(0,0,0,.08)`.

## 구조 변경 (ToastProvider.tsx)

- 1초 interval 로 `createdDate` 를 검사해 제거하던 로직 삭제 — 제거 시점이
  Toast 자신의 progress animation (`onAnimationEnd`) 으로 이동한다.
- 이에 따라 `dayjs` 의존과 `createdDate` 필드가 Provider 에서 불필요해지면 함께
  정리한다 (API 시그니처 `push(message, level)` 는 유지).
- limit 초과 시 오래된 toast 제거, 스택 위치(우측 상단) 는 현재 그대로.

## 에러 처리 / 엣지 케이스

- hover 중 닫기 버튼 클릭 → 즉시 퇴장 애니메이션 후 제거 (타이머 상태와 무관).
- 긴 메시지 → 메시지 영역 `text-pretty break-keep` 유지, 카드 높이 자연 확장.
- reduced motion 은 별도 대응하지 않는다 (기존에도 없음, YAGNI).

## 검증

- `yarn lint` 통과.
- 데모 페이지(개발 중 임시) 또는 기존 호출부에서 5개 레벨 각각 push 하여
  light/dark 테마에서 육안 확인 후 임시 코드는 제거.
