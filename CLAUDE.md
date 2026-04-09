# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Design System Sync is a Figma plugin that exports design tokens (strings/localization, colors, typography) from Figma to GitHub repositories. It generates platform-specific files for Android, iOS, Flutter, and Kotlin Multiplatform (KMP).

## Commands

```bash
npm install           # Install dependencies
npm run build         # Bundle src/ → code.js + ui.html via esbuild
npm run watch         # Build with file watching
npm run typecheck     # TypeScript type checking (no emit)
npm run clean         # Remove build artifacts (code.js, code.js.map, ui.html)
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Tests with coverage (50% min threshold)
npm run lint          # ESLint on src/
npm run lint:fix      # Auto-fix lint issues
```

To run a single test file: `npx jest tests/core/colorParsing.test.ts`

## Architecture

The plugin has two runtime components communicating via `figma.ui.postMessage` / `figma.ui.onmessage`. esbuild bundles the modular source files into two output artifacts that Figma expects: `code.js` (plugin backend) and `ui.html` (plugin UI with inlined CSS/JS).

### Source Structure (`src/`)

- **`plugin.ts`** — Entry point. Runs in Figma's sandbox. Handles message routing, settings persistence via `figma.clientStorage`, and orchestrates extraction/export.
- **`types.ts`** — Shared type definitions (`ColorCollectionExport`, `ColorVariableExport`, `TypographyStyle`).
- **`constants.ts`** — Language name-to-code mapping (`DEFAULT_LANGUAGE_MAP`).
- **`github.ts`** — Full GitHub PR workflow: get base branch → create branch → commit files → create PR.
- **`extractors/`** — Figma API calls to extract design data (colors, typography). These use `figma.*` globals and cannot be tested outside the plugin sandbox.
- **`generators/`** — Pure functions that transform extracted data into platform-specific file content:
  - `strings.ts` — Android XML, iOS `.strings`, Flutter ARB
  - `colors.ts` — Android XML/Compose, iOS Swift, Flutter Dart
  - `typography.ts` — Android XML/Compose, iOS SwiftUI/UIKit, Flutter Dart + font weight mappers
- **`utils/`** — Encoding (`encodeBase64`), escaping (XML, iOS, JSON), color conversion, network requests, debug logging.
- **`ui/`** — Plugin frontend split into `ui.html` (markup), `ui.css` (styles), `ui.ts` (interaction logic). The build script inlines CSS/JS into the final `ui.html`.

### Build System

esbuild (`esbuild.config.mjs`) bundles `src/plugin.ts` → `code.js` (IIFE) and assembles `src/ui/*` into `ui.html` with inlined CSS and JS. The `manifest.json` points to these output files.

### GitHub Integration

The export flow: validate credentials → get base branch SHA → create feature branch → commit files → create PR. Uses GitHub REST API with token auth. Network access is restricted to `https://api.github.com` in the plugin manifest.

## Key Constraints

- **No native `btoa`** in Figma's sandbox — a custom `encodeBase64()` in `src/utils/encoding.ts` is used.
- **Plugin manifest** (`manifest.json`) controls API version, network access, and document permissions. Output files must be `code.js` and `ui.html`.
- **Debug mode** — set `DEBUG_MODE = true` in `src/utils/debug.ts` to enable console logging routed to the UI.
- **Extractors are untestable in Node** — `src/extractors/` depend on Figma globals (`figma.variables`, `figma.getLocalTextStylesAsync`). Only generators and utils are covered by tests.

## Test Structure

Tests are in `/tests/` using Jest with ts-jest. They import directly from `src/` modules. Setup (`tests/setup.ts`) provides global mocks for `fetch`, `btoa`, and `console`. Tests cover generators (strings, colors, typography), GitHub integration (mocked fetch), and utility functions (encoding, escaping).
