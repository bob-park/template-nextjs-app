# 03-theme: Theme switch and persistence

- Priority: P0
- Preconditions: Test Chrome launched per [ui-testing](../agents/ui-testing.md#setup); `yarn dev` running at the `BETTER_AUTH_URL` origin (`$BASE_URL`). Mark `N/A (no test account)` or `N/A (KeyFlow unreachable)` per ui-testing. Logged in (run 01 first). Fresh profile, so the theme starts as `light` (no `theme` cookie).

## Steps
1. Snapshot the header and screenshot the window.
2. Click the theme button `dark` (`ThemeSwitcher`, `src/shared/components/theme/ThemeSwitcher.tsx`). Screenshot right after.
3. Reload the page. Screenshot.
4. Click `light`. Screenshot.

## Expected
- Step 2: colours switch to the dark theme right after the click, with no reload (the `setTheme` server action sets the `theme` cookie and re-renders).
- Step 3: still dark after reload.
- Step 4: back to light right after the click.
- Judge the theme from screenshots; `<html data-theme>` may not be in the tree.

## Accessibility issues to record
- `ThemeSwitcher` buttons have no `role="radio"` / `aria-checked`, so the current theme can't be read from the tree (known, don't fix).

## UX checks
- Is the currently selected theme visually obvious?
