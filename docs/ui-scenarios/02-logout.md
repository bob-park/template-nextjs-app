# 02-logout: Logout ends both sessions

- Priority: P0
- Preconditions: Test Chrome launched per [ui-testing](../agents/ui-testing.md#setup); `yarn dev` running at the `BETTER_AUTH_URL` origin (`$BASE_URL`). Mark `N/A (no test account)` or `N/A (KeyFlow unreachable)` per ui-testing. Logged in (run 01 first).

## Steps
1. Snapshot the app page and click the link `logout` in the header (`src/app/_layouts/Header.tsx`).
2. Snapshot after the redirects settle.
3. Navigate to `$BASE_URL/` again and snapshot.

## Expected
- Step 1–2: `/logout` signs out of better-auth and redirects to KeyFlow `/connect/logout` (`src/app/logout/route.ts`), then back to the `BETTER_AUTH_URL` origin.
- Step 3: the KeyFlow login form is shown → **PASS**.
- Step 3: the app page appears without the login form (silently signed back in through a remaining KeyFlow session) → **FAIL**. `/connect/logout` must end the KeyFlow session too.

## UX checks
- Does the user get any sign that logout succeeded before landing on the login form?
