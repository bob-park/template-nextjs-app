# 04-locale: Language switch and persistence

- Priority: P0
- Preconditions: Test Chrome launched per [ui-testing](../agents/ui-testing.md#setup); `yarn dev` running at the `BETTER_AUTH_URL` origin (`$BASE_URL`). Mark `N/A (no test account)` or `N/A (KeyFlow unreachable)` per ui-testing. Logged in (run 01 first). If not logged in, re-run 01 steps 1–3 first (same credential rules).

## Steps
1. Snapshot the header; find the `LanguageSwitcher` radiogroup (`src/shared/components/i18n/LanguageSwitcher.tsx`).
2. Click the radio `EN`. Snapshot.
3. Reload the page. Snapshot.
4. Click the radio `한국어`. Snapshot.

## Expected
- Radios are labelled from `LOCALE_META` (`src/shared/i18n/config.ts`): `ko` "한국어", `en` "EN".
- Step 2: `EN` has `aria-checked=true`, `한국어` false.
- Step 3: `EN` still checked after reload (`locale` cookie).
- Step 4: `한국어` checked again.

## UX checks
- Does any visible copy actually change language? Record hard-coded strings that stay the same as i18n issues.
