# 01-auth-redirect: Login redirect and sign-in

- Priority: P0
- Preconditions: Test Chrome launched per [ui-testing](../agents/ui-testing.md#setup); `yarn dev` running at the `BETTER_AUTH_URL` origin (`$BASE_URL`). Mark `N/A (no test account)` or `N/A (KeyFlow unreachable)` per ui-testing. Fresh temp profile (no session cookie). Ask the user for the KeyFlow test account.

## Steps
1. Navigate to `$BASE_URL/`.
2. Snapshot the test window after navigation settles.
3. On the KeyFlow login page, fill the account id and password the user gave you (`type` / `set-value`) and submit.
4. Snapshot the test window once back on the app.

## Expected
- Step 2: the window shows the KeyFlow login form (account and password inputs). Note: the app gets there via `/login?callback=%2F` (`src/proxy.ts` → `src/app/login/route.ts`); a snapshot shows only the end of that chain, so don't claim the intermediate URL.
- Step 4: the URL is `$BASE_URL/`; the header shows `username:` followed by a non-empty name (`src/app/_layouts/Header.tsx`).
- No `role="alert"` element at any step.

## Evidence rules
- Don't save the snapshot or screenshot taken after typing the password (step 3). Mask the account id in the report.

## UX checks
- Is it clear the user is being sent to KeyFlow to sign in, and back again afterwards?
