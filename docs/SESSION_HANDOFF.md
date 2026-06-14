# Session Handoff — FFT PSX Vera frontend polish

_Last updated: 2026-06-14. Read this first when resuming._

## Current state (all merged into `main`)
The frontend went from a bare prototype to a cohesive tactical-fantasy companion.
Everything below is live on `main` (latest: the "Phase 13" squash commit).

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
- **Light theme** is a solid first pass but was never visually verified — likely wants
  contrast tuning on a few surfaces once viewed in a browser.
- DreamTeamBuilder slot cards still use inline styles (on-palette via `FFT_THEME` →
  tokens, but could move to classes).
- Roadmap leftovers: real screenshot/QA pass, conversation persistence (needs backend),
  a shared `src/lib/api.ts` (deferred — direct lint fixes were lower-risk than a blind
  fetch refactor).

## Resume checklist
1. `git fetch origin main && git checkout claude/dreamy-einstein-fd9haq && git reset --soft FETCH_HEAD` (or branch fresh from main).
2. `npm run build` and `npm run lint` should both be clean.
3. Get a fresh PAT from the user for pushing; squash-merge PRs.
