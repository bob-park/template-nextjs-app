# agent-desktop UI Testing Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Rust template's agent-desktop UI/UX testing guide to this Next.js template: a `docs/agents/ui-testing.md` guide, five P0 scenarios, AGENTS.md entry points, and a git-ignored results folder.

**Architecture:** Docs only. Mirror the section order of `/Users/hwpark/Documents/rust-workspace/template-rust-app/docs/agents/ui-testing.md` and its scenario template (`docs/ui-scenarios/01-launch-quit.md`), swapping the Tauri parts for a Google Chrome–hosted web app behind KeyFlow login.

**Tech Stack:** Markdown, `agent-desktop` v2.5 CLI, Google Chrome, Next.js 16 / better-auth / next-intl v4 (existing app).

**Spec:** `docs/superpowers/specs/2026-11-02-agent-desktop-ui-testing-design.md` — read it in full first; every "Decided" item there is binding.

## Global Constraints

- Work on `main` (user decision). No `src/` changes, no `package.json` changes.
- `docs/agents/*` files start with frontmatter (`title`, `scope`, `applies_to`, `related`) then a one-line TL;DR blockquote. Body in English; Korean for domain terms.
- Scenarios are in English, one file each: `docs/ui-scenarios/<NN>-<name>.md`, format `# NN-name: Title` / `- Priority:` / `- Preconditions:` / `## Steps` / `## Expected` / `## UX checks`.
- Browser is Google Chrome, launched with `--no-attach` and a temp `--user-data-dir`. Never `close-app` while the user's own Chrome runs.
- Base URL = origin of `BETTER_AUTH_URL`. Mismatch or KeyFlow down → `N/A (KeyFlow unreachable)`.
- Credentials are asked from the user at run time; never stored, never written to reports; post-password snapshots/screenshots not saved.
- All P0 scenarios (01–05) need a logged-in session; no account → `N/A (no test account)`.
- Commit format: `docs: <한국어 설명>` + attribution lines from the session.
- Before every commit: `yarn lint` (no `src/` change expected, but it's the repo rule).

## Review Focus

1. User's own Chrome already open → guide must route all actions via `--window-id` of the test window and forbid `close-app`; check Setup and Cleanup both say so.
2. Password typed into the KeyFlow form appears in a snapshot → Safety and 01 Steps must say don't save that snapshot/screenshot and mask the account id.
3. Unknown path while logged out redirects to `/login` (`src/proxy.ts`) → 05 Preconditions must require a session.
4. KeyFlow SSO silently re-logs in after logout → 02 Expected must state it is FAIL.
5. Chrome exposes an empty accessibility tree → guide mentions relaunching with `--force-renderer-accessibility`.

Each line is checked by the verification step of the owning task (Task 1: 1, 2, 5; Task 2: 2, 3, 4).

---

### Task 1: UI testing guide + entry points

**Files:**
- Create: `docs/agents/ui-testing.md`
- Modify: `AGENTS.md` (Map: new `### Testing` section after `### Workflows`; How to use: one line)
- Modify: `.gitignore` (append `.ui-test-results/`)

**Interfaces:**
- Produces: anchors `#setup`, `#making-ui-testable`, `#safety` in `ui-testing.md` (scenarios link to `../agents/ui-testing.md#setup`); results path `.ui-test-results/<YYYYMMDD-HHmm>/report.md`.

- [ ] **Step 1: Write `docs/agents/ui-testing.md`**

Frontmatter:
```yaml
title: UI Testing (agent-desktop)
scope: src/**, docs/ui-scenarios/**
applies_to: looking at or driving the running app in Chrome, UI/UX testing, making UI testable
related:
  - ./workflows/dev-env.md
  - ./libs/next-intl.md
  - ./libs/theme.md
  - ./structure.md
```
Sections in this order, content per spec "`docs/agents/ui-testing.md` 구성" + "Test account" + "Chrome instance & port": TL;DR → Setup (incl. Install, Orca note) → Basic rules → Running a test (Launch, Browser notes, Observe → act → verify, Errors, Cleanup) → Making UI testable → Web notes → Scenarios → Reports → Safety. Copy the Rust guide's Basic rules, Observe→act→verify, Errors table, Reports template and Safety bullets verbatim where they still apply; swap `$APP_NAME` for `"Google Chrome"` + `--window-id`. Known gaps from the spec go under Making UI testable as "current known issues — report, don't fix".

- [ ] **Step 2: Update `AGENTS.md`**

Map:
```markdown
### Testing
- [UI Testing](docs/agents/ui-testing.md) — agent-desktop + Chrome 으로 실행 중인 앱 검증, P0 시나리오 `docs/ui-scenarios/`, 리포트 `.ui-test-results/`
```
How to use:
```markdown
- 실행 중인 앱 보기 / UI 테스트 → `ui-testing.md` → `workflows/dev-env.md`
```

- [ ] **Step 3: Append `.ui-test-results/` to `.gitignore`**

- [ ] **Step 4: Verify**

Run:
```bash
head -12 docs/agents/ui-testing.md
grep -nE -- '--no-attach|--user-data-dir|--window-id|force-renderer-accessibility|BETTER_AUTH_URL' docs/agents/ui-testing.md
grep -n 'close-app' docs/agents/ui-testing.md
git check-ignore .ui-test-results/x && grep -n 'ui-testing' AGENTS.md
for f in $(grep -oE '\]\(\./[^)#]+' docs/agents/ui-testing.md | sed 's/](//'); do test -e "docs/agents/$f" || echo "BROKEN $f"; done
```
Expected: frontmatter + TL;DR at top; every flag grep hits; each `close-app` line carries the "not while the user's Chrome runs" rule; `.ui-test-results/x` printed; two AGENTS.md hits; no `BROKEN` lines. Read Safety and confirm the credential rule (Review Focus 2).

- [ ] **Step 5: Commit**

```bash
yarn lint
git add docs/agents/ui-testing.md AGENTS.md .gitignore
git commit -m "docs: agent-desktop UI 테스트 가이드 추가"
```

### Task 2: P0 scenarios

**Files:**
- Create: `docs/ui-scenarios/01-auth-redirect.md`, `02-logout.md`, `03-theme.md`, `04-locale.md`, `05-not-found.md`

**Interfaces:**
- Consumes: `../agents/ui-testing.md#setup` (Task 1) for launch and base URL.

- [ ] **Step 1: Write the five scenarios**

All `Priority: P0`. Every Preconditions line: "Test Chrome launched per [ui-testing](../agents/ui-testing.md#setup); `yarn dev` running at the `BETTER_AUTH_URL` origin. N/A (no test account) / N/A (KeyFlow unreachable) per ui-testing." 02–05 add "logged in (run 01 first)". Content from the spec's P0 table, with these pinned expectations:

| File | Must state in Expected |
| ---- | ---------------------- |
| 01 | Redirect to `/login?callback=%2F` (or `/`) then KeyFlow; credentials asked from user; after login back on `/`, header text after `username:` non-empty; no `role="alert"`. Steps note: don't save the snapshot/screenshot taken after typing the password. |
| 02 | Link `logout` (`src/app/_layouts/Header.tsx`) → KeyFlow `/connect/logout`; revisiting `/` shows the KeyFlow login form = PASS; signed back in without the form = FAIL. |
| 03 | Buttons from `ThemeSwitcher` (`src/shared/components/theme/ThemeSwitcher.tsx`); colours change right after the click (screenshot); same theme after reload. Accessibility issue to record: buttons lack `role="radio"`/`aria-checked`. |
| 04 | `LanguageSwitcher` radiogroup, radios `한국어` / `EN` (`LOCALE_META`, `src/shared/i18n/config.ts`); `aria-checked` moves; persists after reload. |
| 05 | Logged in, open `/__ui-test-not-found`; not-found screen with button `돌아가기`; click returns to `/`. Note: logged out, the path redirects to `/login` instead (`src/proxy.ts`). Accessibility/i18n issue to record: hard-coded `돌아가기`. |

- [ ] **Step 2: Verify**

Run:
```bash
for f in docs/ui-scenarios/0*.md; do head -1 "$f"; grep -c -E '^## (Steps|Expected|UX checks)' "$f"; done
grep -l 'ui-testing.md#setup' docs/ui-scenarios/*.md | wc -l
grep -n 'FAIL' docs/ui-scenarios/02-logout.md
grep -n 'proxy' docs/ui-scenarios/05-not-found.md
```
Expected: five `# 0N-name: Title` headings, each count `3`; `5`; 02 states silent re-login = FAIL; 05 mentions the proxy redirect.

- [ ] **Step 3: Commit**

```bash
yarn lint
git add docs/ui-scenarios
git commit -m "docs: agent-desktop P0 UI 시나리오 추가"
```
