---
title: Dev Environment & Lint/Format
scope: package.json, eslint.config.mjs, .mise.toml
applies_to: setting up Node/yarn, running scripts, pre-commit lint/format
related:
  - ../tech-stack.md
  - ./git.md
---

# Dev Environment & Lint/Format

> Node / yarn 버전은 `mise` 로 동기화 (`.mise.toml`). 커밋 전 `yarn lint` 필수, 포매팅은 `yarn prettier`. 테스트 러너는 아직 없음.

## Environment

- **Node / yarn version manager:** `mise` (`.mise.toml`). First-time setup: `mise trust && mise install`.
- **Package manager:** `yarn@4.18.1` installed by `mise` (not corepack). Keep `.mise.toml` and `package.json#packageManager` in sync.

## Common scripts

- `yarn dev` — start the Next.js dev server
- `yarn build` — production build
- `yarn start` — run the production build
- `yarn lint` — run ESLint against `./src`
- `yarn prettier` — format all source files

A test runner is **not** configured yet. When testing is introduced, update this document and `CLAUDE.md`'s command reference.

## Lint & format

- Run `yarn lint` before committing.
- `yarn prettier` auto-formats `**/*.{js,jsx,ts,tsx,css,html}`.
- The shared `@bob-park/*` ESLint and Prettier configs are authoritative. Do not override them locally without team consensus.
