# FFT PSX Vera Frontend

## Project Overview
React + Vite + TypeScript frontend for "FFT PSX Vera". Displays parsed save data, deterministic inventory, and grounded AI chat interfaces (single character, group council, dream team, and campfire).

## Key Directories & Files
- `src/App.tsx` — Main router configuration.
- `src/pages/` — Page components (`ProjectView.tsx`, `InventoryPage.tsx`, `CampfirePage.tsx`, `ChatPage.tsx`, etc.).
- `src/types/index.ts` — **Source of truth** for all TypeScript interfaces. Update this first when backend contracts change.
- `src/context/AppContext.tsx` — Global state management.

## Core Rules & Guardrails
1. **No Hardcoded Colors**: NEVER hardcode `#000` or `#fff` for text. Always use `hsl(var(--foreground))` or Tailwind's `text-foreground` to auto-adapt to dark/light mode.
2. **Type Safety**: All API responses must have a corresponding interface in `src/types/index.ts`. Do not use `any`.
3. **Production Chat UI Patterns**:
   - Use auto-resizing textareas (not basic `<Input>`) for user messages.
   - Always include an `AbortController` for stop/regenerate functionality.
   - Use `react-markdown` + `remark-gfm` for rich text rendering.
   - Keep conversation areas constrained to `max-w-3xl`.
   - Display clear message states: streaming, complete, stopped, error.
4. **Read-Only Inventory**: The inventory UI is strictly for display. No save editing or mutation hooks should be added here.

## Key Commands
- `npm run dev` — Start Vite development server.
- `npm run build` — Production build (required before committing UI changes).
- `npm run lint` — ESLint check.

## Development Workflow
- When adding new pages, register them in `src/App.tsx`.
- Run `npm run build` to verify TypeScript compilation before asking Claude Code to commit.
- Prefer localized state for read-only drawers/panels over global context bloat.
