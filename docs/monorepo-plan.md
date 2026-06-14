# Monorepo vs. two repos — recommendation & migration plan

> **Question:** the backend (`fft-psx-vera`, FastAPI/Python) and frontend
> (`fft-psx-vera-frontend`, Vite/React) live in two repos. Should they be one?

## Why they're separate today
A deliberate split (the sibling ChronoVera project made the same call): the
frontend deploys as **static files** (GitHub Pages / any CDN) while the backend
runs as a **Python service** (server + systemd). Two repos = independent deploys,
independent CI, and clean toolchain separation (npm/Vite vs pip/FastAPI).

## Recommendation: **yes, combine into a monorepo** — at this stage
The independence isn't paying for itself, and the coupling is real:

1. **The contract co-evolves.** Every feature this session (SaveTruth, inventory,
   campfire, save-memory, timeline) spans both sides: the backend shapes the JSON,
   the frontend types it in `src/types/index.ts`. They change together; two repos
   means two PRs and version drift for one logical change. We literally hit this
   (the frontend types are hand-mirrored from backend responses).
2. **One home for grounding content.** `docs/kb/` (story timeline + character
   psychology) and `docs/persona-kb.md` are authored in the *frontend* repo but
   consumed by the *backend* prompt builder. A monorepo gives them a single,
   correct home (`shared/kb/`).
3. **Solo dev, early stage.** The overhead of coordinating two repos outweighs the
   benefits of independent release cadence you aren't using yet.
4. **Blueprint clarity.** "Import a save, talk to its characters" is *one* product.
   A monorepo template (`backend/`, `frontend/`, `shared/`) is cleaner to fork per
   game than two repos kept in lockstep.

### Costs (real, but manageable)
- **Different deploy targets** → use **path-filtered CI** (build+deploy the
  frontend only on `frontend/**` changes; test+deploy the backend only on
  `backend/**`). One-time GitHub Actions work.
- **Mixed toolchains** in one tree → fine with clear directory boundaries.
- **Migration is one-time and touches deploy** → do it deliberately, not casually.

## Proposed structure
```
fft-psx-vera/                     # the monorepo (reuse the backend repo, or a fresh one)
  backend/                        # FastAPI app (from fft-psx-vera)
  frontend/                       # Vite/React app (from fft-psx-vera-frontend)
  shared/
    kb/                           # story-timeline.json, characters.json, persona-kb.md
  docs/
  .github/workflows/
    frontend.yml                  # paths: ['frontend/**'] → build + deploy Pages
    backend.yml                   # paths: ['backend/**']  → test + deploy service
  README.md
```
The Vite dev proxy (`/api` → backend) keeps working unchanged; it just points at
the colocated backend in dev.

## Migration steps (run in a session that has BOTH repos)
1. Choose the host repo (recommend keeping `fft-psx-vera` as the monorepo root).
2. Move the backend tree into `backend/` (it likely already is the root → add the
   `backend/` level, or keep root = backend and nest only the frontend).
3. Bring the frontend in under `frontend/`, **preserving history** via
   `git subtree add --prefix=frontend <frontend-remote> main` (or
   `git read-tree`/filter-repo if you want a cleaner graft).
4. Move `frontend/docs/kb/` + `frontend/docs/persona-kb.md` → `shared/kb/`; update
   the backend prompt builder to read from `shared/kb/`.
5. Add path-filtered CI workflows (frontend build/deploy; backend test/deploy).
6. Update READMEs and any deploy configs/systemd unit paths.
7. Archive the standalone `fft-psx-vera-frontend` repo (or leave it as a mirror).

## Why I can't do it from here
This session is scoped to `fft-psx-vera-frontend` only (no `add_repo`, no backend
access), and a repo merge touches both repos + deploy. **Execute it in a session
that includes `fft-psx-vera`.** Until then this frontend is already monorepo-ready
(self-contained Vite app, no assumptions about repo root).

## TL;DR
Combine them. It removes the two-PR-per-feature friction, gives the grounding KB a
real home, and makes the blueprint cleaner — at the cost of a one-time, path-aware
CI/deploy setup. Do it when both repos are in scope.
