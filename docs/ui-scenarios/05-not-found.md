# 05-not-found: Unknown path

- Priority: P0
- Preconditions: Test Chrome launched per [ui-testing](../agents/ui-testing.md#setup); `yarn dev` running at the `BETTER_AUTH_URL` origin (`$BASE_URL`). Mark `N/A (no test account)` or `N/A (KeyFlow unreachable)` per ui-testing. Logged in (run 01 first). Logged out, an unknown path redirects to `/login` instead (`src/proxy.ts` guards every path except `/login`, `/logout`, `/api`, `_next`), so this scenario needs a session.

## Steps
1. Navigate to `$BASE_URL/__ui-test-not-found`. Snapshot and screenshot.
2. Click the button `돌아가기`. Snapshot.

## Expected
- Step 1: the not-found screen (`src/app/not-found.tsx`) with a button named `돌아가기`.
- Step 2: back on `$BASE_URL/` with the header visible.

## Accessibility issues to record
- `돌아가기` is a hard-coded string, not a message (known, don't fix).

## UX checks
- Does the screen say in words that the page doesn't exist, or only show an animation?
