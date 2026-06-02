# ChronoVera — Complete Project Report

> **Built:** May 2026
> **Author:** xsytrance (Ed) + OWL (Hermes Agent)
> **Repos:** `github.com/xsytrance/chronovera` (backend), `github.com/xsytrance/chronovera-frontend` (frontend)
> **Live:** `http://100.65.108.84:9090`

---

## 1. What Is ChronoVera?

ChronoVera is a **save-file-aware character chat system** for Chrono Trigger (SNES, 1995). You upload your ZSNES/SNES9x save file, it parses your party stats/equipment/inventory/story progress, and you can chat with any of the 7 playable characters — each with era-appropriate knowledge, personality, and awareness of your actual game state.

It's built on top of the **MultiVera** architecture (a character chat platform for any game/story world), adapted and simplified for a single-game use case.

### The Vision

The broader "[Vera](http://100.65.108.84:8787)" project is a framework for building game-specific character chat apps:
- **IvaliceVera** — Final Fantasy Tactics
- **ChronoVera** — Chrono Trigger
- Future: any game with parseable save data and memorable characters

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React/TypeScript/Vite/Tailwind)          │
│  Repo: chronovera-frontend                          │
│                                                     │
│  Pages:                                             │
│    Dashboard  │  Chat  │  SaveUpload  │  Settings   │
│                                                     │
│  Components:                                        │
│    Layout  │  LibrarySidebar  │  CharacterAvatar    │
│    MobileBottomNav  │  UI primitives (shadcn)       │
│                                                     │
│  Deployed to: backend's static/ directory            │
└──────────────────────┬──────────────────────────────┘
                       │ API calls to /api/*
┌──────────────────────┴──────────────────────────────┐
│  Backend (Python/FastAPI/SQLite/Ollama)             │
│  Repo: chronovera                                   │
│                                                     │
│  Files:                                             │
│    chronovera_app.py — Server, routes, chat engine  │
│    save_parser.py     — ZSNES save file parser      │
│    lore_kb.py         — Character lore database     │
│    backend/models.py  — (from MultiVera) ORM models │
│                                                     │
│  Services:                                          │
│    Ollama at 100.110.224.126:11434                  │
│    SQLite at ./chronovera.db                        │
│                                                     │
│  systemd: chronovera.service on port 9090           │
└─────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3, FastAPI, SQLAlchemy, SQLite |
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 3 |
| UI Lib | shadcn/ui (Radix primitives), lucide-react icons |
| Animations | framer-motion |
| Markdown | react-markdown + remark-gfm |
| LLM | Ollama (remote on prime server) |
| Auth | None (local network only) |
| Deployment | systemd service, manual Vite build + copy to static/ |
| Version Control | Git + GitHub (2 repos) |

---

## 4. File-by-File Breakdown

### Backend (`/home/xsyvps/projects/chronovera/`)

#### `chronovera_app.py` (593 lines)
The main FastAPI server. Key sections:

- **Lines 1-46:** Path setup — adds both `chronovera/` and `multivera/` to `sys.path` so it can import MultiVera's ORM models and ChronoVera's local modules.
- **Lines 64-92:** Config (Ollama host/model from env vars) + SQLite engine setup with foreign_keys pragma.
- **Lines 97-109:** FastAPI app with CORS middleware (open to all origins).
- **Lines 112-118:** **Static files** — mounts `/assets` from `static/assets/` directory. This ordering matters (see Pitfalls section).
- **Lines 122-141:** `/api/health` and `/api/ollama/models` endpoints.
- **Lines 145-172:** `POST /api/save/upload` — accepts a save file upload, writes to temp file, runs `ct_parse_save()`, returns parsed data.
- **Lines 177-211:** `POST /api/save/create-project` — parse save + create Project + Characters in DB.
- **Lines 213-322:** `_build_project_from_save()` — creates Project record with save_data JSON, then creates 7 Character records with stats/equipment/techs from parsed save data merged with lore_kb profiles.
- **Lines 327-375:** `GET /api/projects`, `GET /api/projects/{id}`, `GET /api/projects/{id}/characters`.
- **Lines 380-453:** `build_ct_system_prompt()` — assembles the system prompt from character roleplay_instructions + personality + tone + relationships + knowledge_gates + current save state (gold, party, inventory, dual techs) + anti-hallucination guard.
- **Lines 456-476:** `_call_ollama()` — httpx async client calling `/api/chat` on the Ollama server, supports both streaming and non-streaming.
- **Lines 481-593:** `POST /api/chat` — non-streaming chat endpoint. Takes `character_id`, `project_id`, `message` from request body. Builds system prompt, calls Ollama, returns full response. Also includes streaming endpoint using `text/event-stream`.

#### `save_parser.py` (543 lines)
Chrono Trigger ZSNES/SNES9x save state parser.

- **Lines 42-258:** `ITEM_NAMES` — hardcoded list of 211 item names indexed by ID (from RPG Legion editor source code).
- **Lines 276-310:** `CHAR_TECH_NAMES` — per-character tech name tables (7 chars × 8 techs). `DUAL_TRIPLE_TECH_NAMES` — dual/triple tech names.
- **Lines 322-333:** Offset constants for ZSNES save state format.
- **Lines 336-491:** `parse_save(filepath)` — main parser function:
  - **Characters** (loop 0-6): reads stats at `OFFS_CHAR_BASE + i*80`, equipment at `OFFS_EQUIP_BASE + i*80`, tech bitfield at `OFFS_TECH_BASE + i`, name at `OFFS_NAME + i*6`.
  - **Inventory:** reads 256 item IDs from `OFFS_ITEM_BASE`, 256 quantities from `OFFS_ITEM_COUNT_BASE`, filters for non-empty slots.
  - **Gold:** 3 bytes big-endian at `OFFS_GOLD` (14438).
  - **Play Time:** 4 bytes at `OFFS_TIME` (4117): minutes_ones, minutes_tens, hours_ones, hours_tens.
  - **Dual/Triple Techs:** bitfields at `OFFS_DUAL_TECH1` and `OFFS_DUAL_TECH2`.
  - **Active Party:** determined by HP > 0 and level > 0.
- **Lines 494+:** `format_report()` — human-readable text output.

#### `lore_kb.py` (448 lines)
Character profile and story knowledge base.

- **`load_lore_kb()`** — returns full KB dict with characters, story_beats, locations, concepts.
- **Character profiles** (7 total): Crono, Marle, Lucca, Robo, Frog, Ayla, Magus. Each has:
  - `role`, `origin`, `age`, `appearance`
  - `personality` (list of traits)
  - `tone` (speaking style description)
  - `techs` (list of 8 tech names)
  - `arc` (story summary for the AI)
  - `key_moments` (list of pivotal events)
  - `relationships` (dict of character → description)
  - `knowledge_gates` — what they know at different story phases (`always_knows`, `learns_in_600ad`, `learns_in_12000bc`, etc.)
- `_build_character_database()` — returns the dict keyed by lowercase name.
- `_build_story_beats()` — 13 story beats from the Millennial Fair through the Lavos final battle.
- `_build_locations()` — 20 locations across all eras.
- `_build_concepts()` — 30 key concepts (Lavos, Frozen Flame, Epoch, etc.).
- `_phase_gte()` — phase ordering check for knowledge gate enforcement.

### MultiVera ORM Models (`/home/xsyvps/projects/multivera/backend/models.py`)

- **Project** — id, name, description, sources (JSON), save_data (JSON), timestamps
- **Character** — id, project_id, slug, name, role, affiliation, origin, appearance, personality (JSON), tone, languages (JSON), speech_patterns (JSON), relationships (JSON), backstory_summary, roleplay_instructions, knowledge_gates (JSON), is_player, is_active, extra (JSON), timestamps
- **Commit** — timeline checkpoint with knows/does_not_know lists
- **Conversation** — stores messages as JSON array
- **LoreChunk**, **Location**, **Faction**, **Weapon** — additional world data

---

### Frontend (`/home/xsyvps/projects/chronovera-frontend/`)

#### `src/lib/api.ts` (221 lines)
API client functions:
- `getProjects()`, `getProject()`, `getCharacters()` — data fetching
- `uploadSave(file)` — multipart upload for save files
- `createProjectFromSave(file, projectName)` — parse + project creation
- `chat(projectId, characterId, message, signal?)` — simplified chat endpoint with AbortSignal support
- Full MultiVera API client also present (conversations, commits, etc.) but only the simplified `chat()` is used by ChronoVera

#### `src/pages/ChatPage.tsx` (668 lines)
The main chat interface — production-quality with:
- **Conversation management sidebar** (desktop) — create, delete, switch between conversations with different characters
- **Character dropdown picker** (mobile) — grid of character buttons
- **Message area** with auto-scroll, streaming state indicators
- **Per-message actions:** copy (with ✓ confirmation), thumbs up/down feedback
- **Stop/Regenerate** — AbortController for stopping generation, re-send last user prompt
- **Auto-resizing textarea** (max 160px), Enter to send / Shift+Enter for newline
- **Markdown rendering** via react-markdown + remark-gfm
- **Quick prompts** — starter questions for new conversations
- **CharacterAvatar** used throughout for character representation

#### `src/pages/Dashboard.tsx` (152 lines)
Home page with:
- Welcome header with CT-themed gradient and "Time Awaits" tagline
- Stats row (projects, characters, eras spanned, play hours)
- Quick action cards (Upload Save, Talk to Characters)
- World of Chrono Trigger lore quick reference with tag cloud

#### `src/pages/SaveUpload.tsx` (227 lines)
Save file upload flow:
- Drag-and-drop + click-to-browse file input
- Supports .zst, .zs1-.zs9, .sav, .bin
- Two-step flow: Parse Save → review results → Create Full Project
- Shows parsed characters with stats, gold, play time, inventory count
- Auto-redirects to project after creation

#### `src/components/CharacterAvatar.tsx` (110 lines)
Reusable character avatar component:
- Gradient-colored circles with unique colors per character
- Image support with emoji fallback (images at `/characters/{slug}.png`)
- Sizes: xs, sm, md, lg, xl, hero
- Character color scheme:
  - Crono: red/rose, Marle: blue/indigo, Lucca: orange/amber
  - Robo: slate/gray, Frog: emerald/green, Ayla: amber/orange, Magus: purple/violet

#### `src/components/layout/Layout.tsx` (68 lines)
App shell with:
- Desktop: persistent LibrarySidebar
- Mobile: hamburger menu → overlay sidebar
- Mobile bottom nav bar
- Dark/light theme class on `<html>` synced with AppContext

#### `src/components/layout/LibrarySidebar.tsx` (202 lines)
Navigation sidebar with:
- Search input
- Nav links (Dashboard, Project, Characters, Timeline, Chat, Settings)
- Active era / Project chip (book-cover style)
- Character quick-switch row with CharacterAvatar
- New Project button, theme toggle, online status

#### `src/components/layout/MobileBottomNav.tsx` (50 lines)
5-tab bottom navigation: Home, Chat, Upload, Party, Settings

#### `src/context/AppContext.tsx` (116 lines)
React Context + useReducer for global state:
- `projects`, `characters`, `darkMode`, `demoMode`, `loading`
- Actions: SET_PROJECTS, ADD_PROJECT, SET_CHARACTERS, TOGGLE_DARK_MODE, etc.
- Loads projects from API on mount

#### `src/index.css` (296 lines)
Tailwind + custom CSS:
- Light/dark theme CSS variables (CT blue/silver palette)
- Prose typography styles for markdown rendering
- Scrollbar styling
- CT-specific utility classes (`.text-portal`, `.text-era-gold`, `.bg-portal-glow`)
- Era color classes (`.era-past`, `.era-present`, `.era-future`, `.era-dark`)
- Safe area support for mobile
- Reduced motion media query

#### `index.html`
- Pre-loads Google Fonts: Crimson Text (serif), Inter (sans), JetBrains Mono
- Sets dark class before React hydrates to prevent flash
- Viewport-fit=cover for mobile

#### `vite.config.ts`
- Base path `/`
- Dev server on port 3000 with `/api` proxy to localhost:8787
- Path alias `@/` → `src/`

#### `tailwind.config.js`
- Dark mode via `class` strategy
- Extended theme with all CSS variable color mappings
- Custom border-radius scale using `--radius` variable
- Custom shadows, keyframes, animations

---

## 5. API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/ollama/models` | List available Ollama models |
| POST | `/api/save/upload` | Upload & parse CT save file |
| POST | `/api/save/create-project` | Parse save + create project with characters |
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/{id}` | Get project details + characters |
| GET | `/api/projects/{id}/characters` | Get project characters |
| POST | `/api/chat` | Chat with a character (non-streaming) |
| POST | `/api/chat/stream` | Streaming chat (SSE) |
| GET | `/*` | SPA fallback → serves index.html |

---

## 6. Database Schema (SQLite)

```sql
-- Projects table
CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sources JSON,
    save_data JSON,          -- CT-specific: gold, play_time, characters, inventory
    created_at DATETIME,
    updated_at DATETIME
);

-- Characters table
CREATE TABLE characters (
    id INTEGER PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    slug VARCHAR(255),
    name VARCHAR(255),
    role TEXT,
    affiliation TEXT,
    origin TEXT,
    appearance TEXT,
    personality JSON,         -- list of traits
    tone TEXT,
    languages JSON,
    speech_patterns JSON,
    relationships JSON,
    backstory_summary TEXT,
    roleplay_instructions TEXT,  -- includes save stats
    knowledge_gates JSON,
    is_player BOOLEAN,
    is_active BOOLEAN,
    extra JSON,               -- CT-specific: stats, equipment
    created_at DATETIME,
    updated_at DATETIME
);
```

---

## 7. Systemd Service

```ini
# /etc/systemd/system/chronovera.service
[Unit]
Description=ChronoVera FastAPI Server
After=network.target

[Service]
Type=simple
User=xsyvps
WorkingDirectory=/home/xsyvps/projects/chronovera
ExecStart=/usr/bin/python3 /home/xsyvps/projects/chronovera/chronovera_app.py
Restart=always
RestartSec=5
Environment=OLLAMA_HOST=http://100.110.224.126:11434
Environment=OLLAMA_MODEL=llama3.1:8b

[Install]
WantedBy=multi-user.target
```

---

## 8. Deployment Process

### Backend
```bash
cd /home/xsyvps/projects/chronovera
# Edit code
git add -A && git commit -m "..." && git push
sudo systemctl restart chronovera
```

### Frontend
```bash
cd /home/xsyvps/projects/chronovera-frontend
# Edit code
npx vite build
cp -r dist/* /home/xsyvps/projects/chronovera/static/
git add -A && git commit -m "..." && git push
```

---

## 9. Key Technical Decisions

### Why ZSNES save format?
- Well-documented offsets from RPG Legion's open-source save editor (C++ source)
- SNES9x .srm format is similar but less documented
- FF6 save format was considered but rejected (too proprietary/poorly documented)

### Why FastAPI + SQLite?
- FastAPI gives async support for Ollama calls + auto OpenAPI docs
- SQLite is zero-config, single-file, perfect for single-user local apps
- MultiVera already used this stack — no reason to change

### Why separate frontend repo?
- Clean separation of concerns
- Frontend can be built and deployed independently
- Easier to rebrand for different games (just change the frontend)

### Why Ollama on a separate server?
- The primary VPS (100.65.108.84) doesn't have a GPU
- The "prime" server (100.110.224.126) has an RTX 5060 Ti 16GB
- Ollama runs on prime, FastAPI on primary connects via HTTP

### Why the simplified chat endpoint?
- MultiVera's full chat system (conversations, commits, knowledge gates, multi-character) was overkill for ChronoVera
- Simplified `POST /api/chat` with just `project_id`, `character_id`, `message` is cleaner
- Conversation management is handled client-side (in-memory state, not persisted to DB)

---

## 10. Pitfalls & Lessons Learned

### ⚠️ FastAPI Route Ordering (CRITICAL)
**Problem:** SPA fallback route (`GET /*`) catches `/assets/*` requests when only `/static` mount exists, serving HTML for JS file paths.

**Fix:** Mount `/assets` as a separate `StaticFiles` directory BEFORE the SPA fallback:
```python
app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")
# ... API routes ...
@app.get("/{full_path:path}")  # SPA fallback LAST
```

### ⚠️ Browser Cache Stale JS
**Problem:** After fixing the route ordering, browsers still served the old HTML-cached JS file.

**Fix:** Vite's build hash (`index-BvUCkM1U.js`) changes with each build. Force a new build to bust cache. In production, consider cache-control headers.

### ⚠️ Hardcoded Colors in JSX
**Problem:** `style={{ color: '#000000' }}` doesn't respect light/dark theme.

**Fix:** Always use CSS variables: `hsl(var(--foreground))` or Tailwind's theme-aware classes.

### ⚠️ Python venv for systemd
**Problem:** systemd's `ExecStart=/usr/bin/python3` uses system Python, not the venv.

**Fix:** Either use the full venv path or set `Environment=VIRTUAL_ENV=...` in the service file. Currently using system Python because the venv path was unreliable.

### ⚠️ Spriters Resource Image Scraping
**Problem:** Direct `curl` downloads from spriters-resource.com return HTML redirect pages, not images.

**Fix:** The site requires proper session cookies and referer headers. For production, use official art or create CSS-based avatars (which ended up looking better anyway).

### ⚠️ TypeScript Build Errors from Partial Refactors
**Problem:** When replacing old emoji-based character references with CharacterAvatar, leftover references to deleted functions (`getCharacterAvatar`, `getCharacterAccent`) caused build failures.

**Fix:** Do a comprehensive search for all references before deleting functions. Use `search_files` to find all usages.

### ⚠️ JSX Expression Nesting
**Problem:** Extra closing braces in JSX expressions cause cryptic babel parse errors.

**Fix:** Carefully match `{` and `}` in JSX. Use an IDE with bracket matching.

---

## 11. What Works Today

✅ Save file upload and parsing (ZSNES .zst format)
✅ Project creation from save data
✅ All 7 characters with full stats/equipment/techs
✅ Character chat with era-appropriate knowledge
✅ Save data injected into system prompt (gold, party, inventory, dual techs)
✅ Conversation management (create, switch, delete)
✅ Stop generation (AbortController)
✅ Regenerate response
✅ Copy message, thumbs up/down feedback
✅ Markdown rendering in chat messages
✅ Mobile-responsive design (sidebar → hamburger, bottom nav)
✅ Dark/light theme toggle
✅ Streaming indicator
✅ Auto-resizing textarea
✅ Industry-standard chat UI patterns (720px max-width, per-message actions)

## 12. What's Missing / Future Work

- [ ] **SSE streaming** — token-by-token streaming (endpoint exists but not fully tested)
- [ ] **More lore** — Schala, Lavos, Nu, Golem, Dalton, other NPCs
- [ ] **Character portraits** — proper face portraits instead of gradient avatars
- [ ] **Portal animations** — CT-themed visual effects
- [ ] **Era timeline view** — visual timeline of story progression
- [ ] **Multi-character chat** — talk to multiple characters at once
- [ ] **Conversation persistence** — save conversations to DB
- [ ] **Save file re-upload** — update existing project with new save
- [ ] **Export conversations** — download chat history
- [ ] **Code splitting** — JS bundle is 768KB, could use dynamic imports

---

## 13. Environment & Infrastructure

| Component | Location | Details |
|-----------|----------|---------|
| Primary VPS | 100.65.108.84 | Runs ChronoVera (port 9090), IvaliceVera (port 8787) |
| Prime Server | 100.110.224.126 | Runs Ollama (port 11434), 8 models, RTX 5060 Ti 16GB |
| OS | Pop!_OS 24.04 | Both servers |
| Python | 3.12+ | System Python on primary |
| Node.js | v22+ | For Vite builds |
| Git repos | GitHub | `xsytrance/chronovera`, `xsytrance/chronovera-frontend` |

---

## 14. How to Replicate for Another Game

See `GAME_VERA_TEMPLATE.md` in this directory for the step-by-step playbook.
