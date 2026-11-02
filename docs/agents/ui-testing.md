---
title: UI Testing (agent-desktop)
scope: src/**, docs/ui-scenarios/**
applies_to: looking at or driving the running app in Chrome, UI/UX testing, making UI testable
related:
  - ./workflows/dev-env.md
  - ./libs/next-intl.md
  - ./libs/theme.md
  - ./structure.md
---

# UI Testing (agent-desktop)

> Look at and drive the running app with `agent-desktop` in a **separate Google Chrome instance** (`--no-attach` + temp `--user-data-dir`) at the `BETTER_AUTH_URL` origin, looping snapshot → act → snapshot with refs from the latest snapshot only. Every page sits behind KeyFlow login, so ask the user for a test account at run time. Scenarios live in `docs/ui-scenarios/`, reports in `.ui-test-results/` (git-ignored). Interactive elements need next-intl–backed accessible names, or they can't be tested.

## Setup

The app under test is a web app, so agent-desktop drives **Google Chrome**, not the app itself. The app name is always `"Google Chrome"`; because it may collide with the user's own Chrome, every window action goes through `--window-id`.

| Item | Value |
| ---- | ----- |
| Dev server | `yarn dev` (through mise, see [dev-env](./workflows/dev-env.md)) |
| Base URL | origin of `BETTER_AUTH_URL` in `.env*` (e.g. `http://localhost:3000`) |
| Browser | `"Google Chrome"`, separate instance, temp profile |
| Scenarios | `docs/ui-scenarios/` |
| Results | `.ui-test-results/<YYYYMMDD-HHmm>/` (git-ignored) |

### Base URL

KeyFlow redirects back to the redirect URI registered for `BETTER_AUTH_URL`, so the dev server must serve that exact origin.

```bash
BASE_URL=$(grep -h '^BETTER_AUTH_URL=' .env.development.local .env.local .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | sed -E 's#^(https?://[^/]+).*#\1#')
```

- If `yarn dev` starts on a different port than `$BASE_URL`, or KeyFlow is unreachable, don't edit `.env` or KeyFlow config. Mark the run `N/A (KeyFlow unreachable)` and tell the user.

### Test account

- Every page, including unknown paths, is guarded by `src/proxy.ts`. Without a session you only ever see `/login` → KeyFlow.
- **Ask the user for the KeyFlow test account at the start of each run.** Never store it in a file, env var, scenario, or report.
- No account given → mark every scenario that needs a session `N/A (no test account)`.

### Install (once)

```bash
mise exec -- npm install -g agent-desktop
agent-desktop version
agent-desktop permissions --guide   # macOS: grant Accessibility to the terminal
```

- **macOS:** without Accessibility permission nothing works. On a permission error, stop and ask the user to grant it.
- **Windows:** the terminal and Chrome must run at the same privilege level (admin or not).
- **Linux:** needs `at-spi2-core`.

### Orca

Inside Orca, the global "use Orca's browser" rule covers ordinary browsing only. UI testing always uses agent-desktop + Google Chrome as described here.

## Basic rules

- Before first use in a session, run `agent-desktop skills get desktop` and `agent-desktop skills get platform`, and follow them.
- Don't guess flags. Check `agent-desktop <command> --help`.
- Judge screen state from the **accessibility snapshot**. Use `screenshot` only for visual checks: layout, color, overlap, theme.
- Every command prints a JSON envelope (`ok`, `data` / `error`). Always check `ok`.
- Default to headless actions. Use `--headed` (real pointer/keyboard) only when headless doesn't work, and record why.

## Running a test

### Launch

1. Start `yarn dev`. Use its output (not a fixed sleep) to know it's ready, and check the URL matches `$BASE_URL`.
2. Launch a **new** Chrome instance with a throwaway profile:

   ```bash
   PROFILE_DIR=$(mktemp -d)
   agent-desktop launch "Google Chrome" --no-attach --activate \
     --arg=--user-data-dir="$PROFILE_DIR" --arg=--no-first-run --arg="$BASE_URL/"
   ```

   - `--no-attach` is required: without it agent-desktop attaches to the user's running Chrome and opens the URL in their profile.
   - The temp profile starts with no `theme` / `locale` / session cookies, so every run starts clean.
3. `agent-desktop list-windows --app "Google Chrome"` and pick the test window (the one showing `$BASE_URL`). Keep its id as `WIN` and pass `--window-id "$WIN"` to every command from here on.

### Browser notes

- Page content sits under Chrome's web area in the tree. Get the structure with `--skeleton`, then zoom in with `--root <ref>`.
- Go to a URL: `focus-window --window-id "$WIN"` → `press cmd+l` (Windows/Linux `ctrl+l`) → `type "<url>"` → `press return`.
- Reload: `press cmd+r` (`ctrl+r`) after `focus-window`.
- If the web area is empty or missing, quit the test instance and relaunch with `--arg=--force-renderer-accessibility`.
- KeyFlow's login page is a different origin but the same window; treat it like any other page.

### Observe → act → verify

```bash
agent-desktop snapshot --app "Google Chrome" --window-id "$WIN" -i --compact   # 1) observe: get refs
agent-desktop click @<snapshot_id>:e8                                          # 2) act: refs from that snapshot only
agent-desktop snapshot --app "Google Chrome" --window-id "$WIN" -i --compact   # 3) verify: new snapshot, check the result
```

- Ref format is `@<snapshot_id>:<element>`. Short `@e8` fails with `INVALID_ARGS`. In PowerShell, quote it: `'@s8f3k2p9:e8'`.
- **A ref is valid only for the snapshot that produced it.** After the UI changes (including any navigation), take a new snapshot.
- Text: `type` or `set-value`. Keys: `press` (there is no `key` command).

### Errors

| Code | Response |
| ---- | -------- |
| `STALE_REF` | The UI changed. Take a new snapshot, retry with a new ref. |
| `AMBIGUOUS_TARGET` | Several windows match (often the user's own Chrome). Pick the test window from `error.details` and pass `--window-id`. |
| `INVALID_ARGS` | Check the ref format and arguments. |
| other | Retry only if `error.disposition.retry` is `safe`. Otherwise stop and record it. |

- Three failures on the same step: record the scenario as **FAIL (blocked)** and move on. Never change the app code to get past it.

### Cleanup

- Close only the test window(s) by `--window-id` (focus it, `press cmd+w` / `ctrl+w`), then make sure the test instance has exited.
- **Never run `close-app "Google Chrome"` while the user's own Chrome is running**: both instances share the app name, so it would quit the user's browser too. Use `close-app` only when `list-windows` shows no Chrome window besides the test ones.
- Delete `$PROFILE_DIR` and stop the `yarn dev` process you started.

## Making UI testable

agent-desktop finds elements through the accessibility tree. **An element with no name in the tree counts as untestable.** For new UI:

- Clickable things are `<button>`, `<a>`, `<input>`, not a `div` with `onClick`. If a `div` is unavoidable, give it `role` and `tabIndex`.
- Icon-only buttons need `aria-label`. Accessible names are user-visible copy, so they come from the message files `messages/<locale>.json` through `useTranslations` / `getTranslations` ([next-intl](./libs/next-intl.md)): `aria-label={t('open')}` (illustrative key), never a literal string.
- Inputs get a name through `<label htmlFor>` or `aria-label`.
- Expose state: `aria-checked` on toggles, radios, and checkboxes (as `LanguageSwitcher` does), `aria-expanded` on disclosure panels.
- Loading, toasts, and errors use `role="status"` or `role="alert"`, so a snapshot can verify them. The shared toast already uses `role="alert"` (`src/shared/components/toast/Toast.tsx`).
- Accessible names match the visible text and are unique within a page.
- Unnamed or duplicate names found while testing go in the report as **accessibility issues**. Don't fix them in the same change.

### Known issues (report, don't fix)

- `ThemeSwitcher` buttons (`src/shared/components/theme/ThemeSwitcher.tsx`) have no `role="radio"` / `aria-checked`, so the current theme can't be read from the tree. Verify the theme with `screenshot`.
- `logout` (`src/app/_layouts/Header.tsx`) and `돌아가기` (`src/app/not-found.tsx`, `src/app/forbidden.tsx`) are hard-coded strings, not messages.

## Web notes

- Check every screen in light and dark (`theme` cookie, [theme](./libs/theme.md)) and in ko and en (`locale` cookie, [next-intl](./libs/next-intl.md)).
- `<html data-theme>` may not appear in the tree. Judge the theme from a screenshot.
- Clipboard features: verify with `clipboard-set` / `clipboard-get`. Back up the user's clipboard first and restore it after.

## Scenarios

One file per scenario: `docs/ui-scenarios/<NN>-<name>.md`, in English.

```markdown
# 01-auth-redirect: Login redirect

- Priority: P0
- Preconditions: …

## Steps
1. …

## Expected
- … (cite message keys or source labels with both texts where localized: `한국어` / `EN`)

## UX checks
- …
```

The P0 set in `docs/ui-scenarios/` (01–05) must pass, or be marked `N/A` with the reason the scenario states, for every app built from this template. Add app-specific scenarios after them.

## Reports

Write `.ui-test-results/<YYYYMMDD-HHmm>/report.md`. Save the snapshot JSON and screenshot of each failed step in the same folder.

```markdown
# UI test results — <app> <version/commit>

- Environment: macOS 15.x / Windows 11 / …, Chrome <version>
- Base URL: <origin>
- Account: <masked, e.g. t***@example.com>

| Scenario | Result | Notes |
| -------- | ------ | ----- |
| 01-auth-redirect | PASS | |
| 03-theme | FAIL | dark not kept after reload |

## Failures
- scenario / step, expected vs actual, evidence (snapshot, screenshot files), repro steps

## Accessibility issues
- ThemeSwitcher: buttons lack aria-checked

## UX suggestions
- (works, but hard to use — be specific)
```

- Mark PASS/FAIL **only with snapshot or screenshot evidence**. Anything unchecked is `UNVERIFIED`.
- Keep UX suggestions separate from bugs.

## Safety

- **Touch only the test Chrome instance and the app under test.** Never act on the user's own Chrome windows. If another app seems needed, stop and ask the user.
- **Credentials:** never write the test account's password anywhere, and mask the account id in reports. Snapshots or screenshots taken after typing the password may contain it: don't save them to `.ui-test-results/`.
- Snapshots, screenshots, and clipboard contents may hold personal data. Never upload them to public repos, issues, or external services. `.ui-test-results/` stays git-ignored.
- Irreversible actions (payment, account deletion, real email/messages) only against test accounts or mocks. Without one, skip the step and record it.
- Never edit a scenario or its expected results to make a test pass.
