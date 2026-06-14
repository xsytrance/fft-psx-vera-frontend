# Session Handoff — FFT PSX Vera frontend polish

_Last updated: 2026-06-14. Read this first when resuming._

## Current state (all merged into `main`)
The frontend went from a bare prototype to a cohesive tactical-fantasy companion.
Everything below is live on `main` (latest: the "Phase 16" squash commit).

- **Phase 11 — design language** ("Aetherium War-Ledger"): obsidian/parchment/bronze
  palette, ember (character/campfire), aether-teal (memory / parser-verified),
  arcane-violet (LLM). Fonts: Cinzel (display), Crimson Text (serif), Inter (UI),
  JetBrains Mono (figures). Original brand **sigil** (`public/fftpsxvera-icon.svg`).
- **Critical fix:** Tailwind was never wired up (no `@tailwind` directives), so the
  Inventory/Campfire pages rendered unstyled. Now wired in `src/index.css`; `App.css`
  loads after so the design language wins over Preflight.
- **Phase 12:** mobile nav fix (hamburger + backdrop in `Layout.tsx`), removed orphaned
  franchise assets from `public/`, page fade transitions.
- **Settings + themes:** `Obsidian` (dark, default) and `Parchment` (light), switchable
  at `/settings`, persisted to `localStorage` (`fftvera-theme`), no-flash init script in
  `index.html`. Theme runtime: `src/lib/theme.ts` (`useTheme`).
- **Phase 13:** **Campaign Timeline** (`/project/:id/timeline`, `TimelinePage.tsx`) —
  the save-memory `events[]` as a vertical ledger; **Dream Team modal polish** (inline
  styles → `.dt-*` classes).
- **Phase 14 — grounded chat:** markdown everywhere (`MessageContent`, react-markdown
  + remark-gfm) across all chat surfaces; `ChatPage` got an auto-resizing composer,
  copy/regenerate, message states, and a parser-truth grounding strip. Route-level
  code splitting (`React.lazy` in `App.tsx`, `Suspense` in `Layout.tsx`) — markdown is
  an on-demand chunk, initial bundle ~halved.
- **Phase 15 — character identity:** `CharacterDetail` is now a grounded dossier
  (parser-confirmed job/level/HP-MP/gear). `docs/persona-kb.md` is a backend-ready
  persona spec (canon FFT personas + a Brave/Faith/Zodiac/job formula for custom units).
- **Phase 16:** Timeline ↔ Campfire wired — discuss any save-memory event via
  `/campfire?event=<id>`, with an event picker; Timeline cards link to it.
- **Lint:** `npm run lint` → **0 problems**. `npm run build` → green.

## Architecture quick map
- `src/App.css` — the whole design system: tokens in `:root`, the `html[data-theme="light"]`
  block, reusable classes (`.panel`, `.badge`, `.btn*`, `.truth-seal`, `.eyebrow`,
  `.audit-drawer`, `.timeline-*`, `.dt-*`), and all page styles.
- `tailwind.config.js` — the literal scales (amber/slate/emerald/orange/purple/blue/red/
  yellow) are **CSS-variable-driven** (`rgb(var(--c-<scale>-<shade>) / <alpha-value>)`) so
  they flip per theme. Dark values are byte-identical to the original hex.
- `src/components/ui/` — `Sigil`, `Eyebrow`, `Badge`, `TruthSeal`, `Panel`.
- `src/types/index.ts` — source of truth for API shapes (don't invent contracts).
- Two style systems coexist: custom-CSS pages (Home, Dashboard, ProjectView, Layout,
  Chat, CharacterDetail, DreamTeam) and Tailwind pages (Inventory, Campfire, Timeline,
  Settings). The retuned scales keep both on-palette.

## How to develop & ship in THIS environment (important)
- **Branch:** work on `claude/dreamy-einstein-fd9haq`. After each squash-merge the remote
  branch goes stale; realign with `git fetch <origin> main && git reset --soft FETCH_HEAD`,
  then `git push --force` the branch for the next PR.
- **Pushing:** the local git proxy denies direct push (403) and the GitHub MCP app is
  **read-only**. Pushes/PRs/merges were done with a user **PAT via the REST API**
  (`git push https://<token>@github.com/...`, and `python urllib` for PR create/merge).
  A fresh token will be needed next session (the previous one should be revoked).
- **Merging:** repo is set to **squash-only** (`allow_merge_commit:false`). GitHub signs
  squash commits → `main` stays **Verified**. Always squash-merge.
- **Verification nag:** the stop-hook flags 5 historical PR #1/#2 commits as Unverified.
  That's cosmetic and unfixable without a destructive `main` rewrite — leave it.

## Sandbox constraints (so you don't waste time)
- **No browser / rasterizer / headless Chrome** and **no fonts installed** → cannot take
  live screenshots or visually verify. Preview images in `docs/preview/*.svg` are
  hand-built mockups from the real tokens, sent to the user via SendUserFile.
- **`npm install` is blocked** (registry mirror 403). Deps are already installed. If a
  reinstall is ever needed: `sed -i 's#registry.npmmirror.com#registry.npmjs.org#g'
  package-lock.json && npm ci`, then restore the lockfile.
- The app calls `/api/...`; a running backend is required for real data (not present here).

## Known limitations / next ideas
- **★ TOP BACKEND TASK — character personas.** Make characters speak in-character.
  This CANNOT be done in the frontend (the chat request only sends ids; voice is built
  server-side; Brave/Faith/Zodiac aren't parsed). Spec + knowledge base is ready in
  `docs/persona-kb.md`. In the backend (`fft-psx-vera`): add canon personas + a
  `derive_persona(stats)` for custom units, slot it AFTER SaveTruth in the prompt, and
  extend the parser to expose brave/faith/zodiac. The frontend dossier is the place it
  would surface.
- **Dependency cleanup** (deferred): ~15 unused libs in `package.json` (recharts,
  framer-motion, vaul, cmdk, react-hook-form, zod, date-fns, the radix-* set…). Safe to
  remove, but needs a machine where `npm install` runs to regenerate the lockfile
  (blocked in this sandbox).
- **Light theme** is a solid first pass but was never visually verified — likely wants
  contrast tuning on a few surfaces once viewed in a browser.
- DreamTeamBuilder slot cards still use inline styles (on-palette via `FFT_THEME` →
  tokens, but could move to classes).
- Other ideas: real screenshot/QA pass, conversation persistence (needs backend),
  a shared `src/lib/api.ts`, a command palette (`cmdk` is already a dep).

## Resume checklist
1. `git fetch origin main && git checkout claude/dreamy-einstein-fd9haq && git reset --soft FETCH_HEAD` (or branch fresh from main).
2. `npm run build` and `npm run lint` should both be clean.
3. Get a fresh PAT from the user for pushing; squash-merge PRs.
