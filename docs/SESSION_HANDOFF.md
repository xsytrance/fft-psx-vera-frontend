# Session Handoff — FFT PSX Vera frontend polish

_Last updated: 2026-06-15. Read this first when resuming._

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

## Latest checkpoint (2026-06-14, session pause)
Tip of `main` is a Verified squash commit. Since the phase-16 note above, also merged:
- **`docs/kb/` — lore + character knowledge base** (the "character layer"): a
  spoiler-gated `story-timeline.json` (4 chapters, PSX names) and
  `characters.json` (per-character, per-chapter mood/knowledge/goals/mindset/
  relationships), with a `README.md` defining the grounding stack and spoiler rules.
  Backend-consumed, like `docs/persona-kb.md`. **Now 16 characters** (Ramza, Delita,
  Agrias, Ovelia, Mustadio, Orlandeau, Gaffgarion, Wiegraf, Rapha, Marach,
  Meliadoul, Beowulf, Reis, Cloud, Alma, Algus).
- **Timeline ↔ Campfire wiring: DONE & merged** — TimelinePage "Discuss at campfire"
  links carry `?event=`; CampfirePage reads it (event picker, historic vs latest).
- **`docs/monorepo-plan.md`** — recommendation (combine into a monorepo) + migration
  steps; can't execute from a frontend-only session (needs both repos).

### Open decisions (waiting on the user)
- **★ Backend access** for the persona/lore work AND the monorepo migration. This
  session is scoped to the frontend repo only (`add_repo` not connected). To wire
  `docs/kb/` + `docs/persona-kb.md` into the prompt builder, add brave/faith/zodiac
  to the parser, and/or combine the repos, the user must relaunch a session that
  includes **`github.com/xsytrance/fft-psx-vera`**, or OK a read-only PAT clone.
  **The ready-to-paste backend session prompt + setup is in `docs/kb/BACKEND_TASK.md`.**
- Frontend ideas left: real screenshot/QA pass, dependency cleanup (needs
  working `npm install`), `cmdk` command palette. (**Shared `src/lib/api.ts`
  — DONE:** all 28 endpoints centralized + typed; pages call `api.*`.)

### How pushing worked this session (so it's repeatable)
Local git proxy denies push and the GitHub MCP app is read-only, so all pushes
were `git push --force https://<PAT>@github.com/...` + PR create/squash-merge via
the REST API (`python urllib`). Repo is squash-only → every merge to `main` is
GitHub-signed/Verified. Branch goes stale after each squash; realign with
`git reset --soft FETCH_HEAD`.

## Latest checkpoint (2026-06-15, PRIME / Tailnet smoke)
Scope saved in this checkpoint:
- Backend `fft-psx-vera`: Campfire/save-memory no longer surfaces bogus `Unknown_0xNN` placeholder rows. Displayable diff logic now ignores unresolved placeholder names; save-memory responses sanitize summaries/facts/prompt payloads; stale legacy event payloads are cleaned on read. The item table also labels late-game item IDs that were previously unresolved.
- Frontend `fft-psx-vera-frontend`: Campfire rendering filters placeholder item/equipment rows client-side too. Also includes the current home/parser-guide/music polish that was in the working tree this session.
- Live dev stack on PRIME: backend `0.0.0.0:9091`, frontend `0.0.0.0:5173`, Tailnet IP `100.110.224.126`.

Verification run before commit:
```bash
# backend
cd /home/xsyprime/fft-psx-vera
. .venv/bin/activate
PYTHONDONTWRITEBYTECODE=1 pytest -q tests/test_save_memory.py
# result: 14 passed, 1 warning in 0.42s

# backend Tailnet/API smoke
python - <<'PY'
import json, urllib.request
url='http://100.110.224.126:9091/api/projects/73/save-memory'
with urllib.request.urlopen(url, timeout=20) as r:
    data=json.load(r)
text=json.dumps(data)
print(text.count('Unknown_0x'), 'Unknown_0x placeholders')
print('Mythril Knife', 'Mythril Knife' in text)
print('Leather Hat', 'Leather Hat' in text)
PY
# result: 0 Unknown_0x placeholders; Mythril Knife True; Leather Hat True

# frontend
cd /home/xsyprime/fft-psx-vera-frontend
npm run build
# result: TypeScript + Vite production build succeeded

# frontend Tailnet/proxy smoke
python - <<'PY'
import urllib.request
for url in [
  'http://100.110.224.126:5173/',
  'http://100.110.224.126:5173/#/project/73/campfire',
  'http://100.110.224.126:5173/api/projects/73/save-memory',
]:
    with urllib.request.urlopen(url, timeout=20) as r:
        body=r.read(300000).decode('utf-8','replace')
        print(url, r.status, r.headers.get('content-type'), len(body), body.count('Unknown_0x'))
PY
# result: home/campfire HTML 200; proxy JSON 200; proxy Unknown_0x count 0
```

User-facing URLs:
- Frontend: `http://100.110.224.126:5173/`
- Campfire: `http://100.110.224.126:5173/#/project/73/campfire`
- Backend API: `http://100.110.224.126:9091`

Known non-blockers:
- Frontend build prints the existing Browserslist/caniuse-lite age warning.
- Backend targeted test emits the existing FastAPI/Starlette `httpx` deprecation warning.
- `fft_psx_vera.db` may be dirtied by local smoke data; do not commit incidental runtime DB/cache churn unless intentionally preserving a seed snapshot.
