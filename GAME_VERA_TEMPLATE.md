# Game Vera Builder — Reproducible Playbook

> How to build a "Vera" character chat app for any game, using ChronoVera as the template.

---

## Overview

A "Vera" app has 3 core components:

1. **Save Parser** — Extract game state from save files (stats, inventory, story progress)
2. **Lore Knowledge Base** — Character profiles, story beats, locations, concepts
3. **Chat System** — Frontend + Backend for chatting with characters, with save-aware prompts

Total build time: ~2-3 days for a familiar game (with AI assistance).

---

## Phase 0: Prerequisites

### Infrastructure
- [ ] A Linux VPS with Python 3.10+ (the "app server")
- [ ] An Ollama server (can be remote, e.g. a GPU-equipped machine)
- [ ] Node.js 18+ for frontend builds
- [ ] Git + GitHub account

### Knowledge You Need
- [ ] The game's save file format (or willingness to reverse-engineer it)
- [ ] The game's story, characters, and lore (for the knowledge base)
- [ ] Basic understanding of the game's mechanics (stats, equipment, etc.)

### Save File Format Research
Before committing to a game, verify the save format is parseable:

1. Search for existing save editors (open-source = goldmine for offset documentation)
2. Look for format documentation on sites like DataCrystal, The Cutting Room Floor, or game-specific wikis
3. Check if the format is XOR-encrypted or compressed (common for SNES/GBA games)
4. Test with a real save file — can you identify known values (character names, gold, etc.) in a hex editor?

**Good candidates:** Games with well-documented save formats (ZSNES, SNES9x, many PC games)
**Bad candidates:** Games with encrypted/cloud-only saves (most modern console games)

---

## Phase 1: Backend Setup

### 1.1 Create the Project Structure

```bash
mkdir -p ~/projects/{game-name}vera
cd ~/projects/{game-name}vera

# If building on MultiVera:
git clone github.com/xsytrance/multivera.git ../multivera

# Create core files:
touch {game_name}_app.py
touch save_parser.py
touch lore_kb.py
```

### 1.2 Set Up Python Environment

```bash
# Use system python3 or a venv
python3 -m venv venv
source venv/bin/activate

pip install fastapi uvicorn sqlalchemy httpx python-multipart
```

### 1.3 Create the FastAPI Server (`{game_name}_app.py`)

Use `chronovera_app.py` as your template. Key sections to customize:

1. **Imports** — change `from save_parser import parse_save as ct_parse_save` to your parser
2. **Config** — update `OLLAMA_HOST`, `OLLAMA_MODEL`, `DB_PATH`
3. **Static files** — keep the dual mount pattern (`/assets` + SPA fallback)
4. **Save upload endpoint** — adapt to your save format
5. **Project creation** — customize `_build_project_from_save()` for your game's data
6. **System prompt builder** — `build_{game}_system_prompt()` with your game's context
7. **Character index mapping** — update `CHAR_INDEX_TO_NAME` if using numeric character IDs

**Critical:** Keep the route ordering: API routes → static mounts → SPA fallback LAST.

### 1.4 Create the Save Parser (`save_parser.py`)

This is the most game-specific file. Steps:

1. **Document all offsets** — Create a table of byte offsets for each data type
2. **Build name/ID tables** — Item names, character names, ability names, etc.
3. **Implement `parse_save(filepath)`** — Returns a dict with all extracted data
4. **Test with real saves** — Verify extracted values match what you see in-game

```python
# Template structure:
OFFS_CHAR_BASE = 0xXXXX    # Character stats base offset
OFFS_ITEM_BASE = 0xXXXX    # Item IDs offset
OFFS_GOLD = 0xXXXX         # Gold/currency offset
# ... etc

ITEM_NAMES = ["Empty", "Item1", "Item2", ...]  # Index = item ID

def parse_save(filepath: str) -> dict:
    data = Path(filepath).read_bytes()
    result = {"characters": [], "inventory": [], "gold": 0, ...}
    # Parse each section
    return result
```

### 1.5 Create the Lore Knowledge Base (`lore_kb.py`)

Define your game's world:

```python
def load_lore_kb() -> dict:
    return {
        "characters": {
            "CharacterName": {
                "role": "Their role in the story",
                "origin": "Where they're from",
                "personality": ["trait1", "trait2"],
                "tone": "How they speak",
                "arc": "Their story arc summary",
                "key_moments": ["event1", "event2"],
                "relationships": {"OtherChar": "description"},
                "knowledge_gates": {
                    "always_knows": ["thing1"],
                    "learns_in_chapter_X": ["thing2"],
                },
            },
        },
        "story_beats": [...],
        "locations": [...],
        "concepts": [...],
    }
```

**Tips:**
- Include 5-15 characters (more = more work but richer experience)
- Knowledge gates prevent characters from spoiling later story events
- The `tone` field is critical for good roleplay — be specific about speech patterns
- Include equipment/weapons in character profiles so the AI can reference them

### 1.6 Set Up the Database

Reuse MultiVera's models (`backend/models.py`). The schema supports:
- Projects (with `save_data` JSON field for game-specific data)
- Characters (with JSON fields for personality, relationships, knowledge gates, etc.)
- Commits (timeline checkpoints — optional for simpler games)
- Conversations (if you want to persist chat history)

```python
# In your app.py:
from backend.models import Project, Character, Commit, Conversation
# SQLAlchemy will create tables automatically
Base.create_all(bind=db_engine)
```

### 1.7 Create systemd Service

```ini
# /etc/systemd/system/{game-name}vera.service
[Unit]
Description={GameName}Vera FastAPI Server
After=network.target

[Service]
Type=simple
User=YOUR_USER
WorkingDirectory=/home/YOUR_USER/projects/{game-name}vera
ExecStart=/usr/bin/python3 /home/YOUR_USER/projects/{game-name}vera/{game_name}_app.py
Restart=always
RestartSec=5
Environment=OLLAMA_HOST=http://OLLAMA_IP:11434
Environment=OLLAMA_MODEL=llama3.1:8b

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable {game-name}vera
sudo systemctl start {game-name}vera
```

---

## Phase 2: Frontend Setup

### 2.1 Clone and Rebrand the Frontend Template

```bash
git clone github.com/xsytrance/chronovera-frontend.git ../{game-name}vera-frontend
cd ../{game-name}vera-frontend
```

### 2.2 Bulk Rebrand

Replace all game-specific references:

```bash
# Using sed (be careful with overlapping terms):
sed -i 's/ChronoVera/{GameName}Vera/g' src/**/*.{tsx,ts,css,html}
sed -i 's/chrono-trigger/{game-name}/g' src/**/*.{tsx,ts,css,html}
sed -i 's/Chrono Trigger/{Game Name}/g' src/**/*.{tsx,ts,css,html}
# etc.
```

### 2.3 Update the Theme

Edit `src/index.css`:
- Change the CSS variable values to match your game's color palette
- Update `--primary`, `--accent`, `--background`, `--foreground` for both light and dark modes
- Keep the structure (CSS variables → Tailwind → utilities)

Edit `tailwind.config.js`:
- Update color mappings if needed

### 2.4 Update Character Data

Edit `src/components/CharacterAvatar.tsx`:
- Replace `CHAR_STYLES` with your game's characters and their color schemes
- Update `CHAR_IMAGES` paths
- Update `ERA_LABELS` in `ChatPage.tsx` if characters are from different eras/timelines

### 2.5 Update Page Content

- **Dashboard.tsx** — Change game description, stats, lore quick reference
- **SaveUpload.tsx** — Update supported file extensions and format descriptions
- **ChatPage.tsx** — Update quick prompts, era labels
- **ProjectDetail.tsx** — Update lore section content
- **index.html** — Update title, description, favicon
- **SettingsPage.tsx** — Update persona export templates

### 2.6 Build and Deploy

```bash
npx vite build
cp -r dist/* /home/YOUR_USER/projects/{game-name}vera/static/
```

---

## Phase 3: Testing

### 3.1 Backend Tests

```bash
# Test save parsing
python3 -c "
from save_parser import parse_save
result = parse_save('/path/to/test_save.zst')
print(f'Characters: {len(result[\"characters\"])}')
print(f'Gold: {result[\"gold\"]}')
print(f'Items: {len(result[\"inventory\"])}')
for c in result['characters']:
    print(f'  {c[\"name\"]}: Lv{c[\"level\"]} HP{c[\"hp\"]}/{c[\"maxhp\"]}')
"

# Test API
curl -X POST http://localhost:9090/api/save/upload -F "file=@test_save.zst"
curl http://localhost:9090/api/projects
curl http://localhost:9090/api/projects/1/characters

# Test chat
curl -X POST http://localhost:9090/api/chat \
  -H "Content-Type: application/json" \
  -d '{"project_id": 1, "character_id": 1, "message": "Hello!"}'
```

### 3.2 Frontend Tests

1. Open `http://YOUR_SERVER:9090` in a browser
2. Upload a save file → verify parsing results
3. Create a project → verify characters appear
4. Chat with each character → verify personality and knowledge
5. Test on mobile → verify responsive layout
6. Test dark/light theme toggle

### 3.3 End-to-End Checklist

- [ ] Save file uploads and parses correctly
- [ ] All characters created with correct stats
- [ ] Chat responses are in-character
- [ ] Characters reference save data (gold, items, party members)
- [ ] Knowledge gates work (characters don't spoil future events)
- [ ] Conversation management works (create, switch, delete)
- [ ] Stop/regenerate works
- [ ] Copy/feedback buttons work
- [ ] Markdown renders correctly
- [ ] Mobile layout works
- [ ] Dark/light theme works
- [ ] No console errors

---

## Phase 4: GitHub Setup

```bash
# Backend
cd ~/projects/{game-name}vera
git init
git remote add origin github.com/YOUR_USERNAME/{game-name}vera.git
git add -A
git commit -m "Initial commit"
git push -u origin main

# Frontend
cd ~/projects/{game-name}vera-frontend
git init
git remote add origin github.com/YOUR_USERNAME/{game-name}vera-frontend.git
git add -A
git commit -m "Initial commit"
git push -u origin main
```

**Security:** Never commit API keys or tokens. Use environment variables.

---

## Phase 5: Iteration

After the basic app works, consider:

1. **More lore** — Add NPCs, locations, items, concepts
2. **Better prompts** — Tune the system prompt builder for better roleplay
3. **Streaming** — Implement SSE token-by-token streaming
4. **Visual polish** — Character portraits, game-themed animations
5. **Multi-character chat** — Let users talk to multiple characters at once
6. **Conversation export** — Download chat history as text/markdown
7. **Save file comparison** — Show how the party changed between two saves

---

## Common Patterns Across All Vera Apps

### The System Prompt Formula
```
[Character identity + roleplay instructions]
[Personality traits]
[Tone/speaking style]
[Relationships with other characters]
[Knowledge gates — what they know/don't know]
[Current game state — from save file]
[Anti-hallucination guard]
```

### The Save Parser Formula
```
1. Read file as bytes
2. Extract fixed-offset data (stats, gold, time)
3. Extract indexed arrays (inventory, equipment)
4. Map IDs → names using hardcoded tables
5. Return structured dict
```

### The Chat Flow
```
1. User selects character + types message
2. Frontend sends {project_id, character_id, message} to /api/chat
3. Backend loads character + project from DB
4. Backend builds system prompt (lore + save data)
5. Backend calls Ollama with system prompt + user message
6. Backend returns response
7. Frontend displays response with character avatar
```

### The Frontend Formula
```
Layout (sidebar + mobile nav)
  ├── Dashboard (upload CTA + stats + lore)
  ├── ChatPage (conversation sidebar + message area + input)
  ├── SaveUpload (drag-drop + parse results + create project)
  ├── ProjectDetail (character grid + tabs)
  └── Settings (LLM config + theme + export)
```

---

## File Checklist

### Backend
- [ ] `{game_name}_app.py` — FastAPI server
- [ ] `save_parser.py` — Save file parser
- [ ] `lore_kb.py` — Character/world knowledge base
- [ ] `backend/models.py` — (from MultiVera) ORM models
- [ ] `backend/database.py` — (from MultiVera) DB engine setup
- [ ] `backend/schemas.py` — (from MultiVera) Pydantic schemas
- [ ] `{game-name}vera.service` — systemd unit file

### Frontend
- [ ] `src/pages/Dashboard.tsx`
- [ ] `src/pages/ChatPage.tsx`
- [ ] `src/pages/SaveUpload.tsx`
- [ ] `src/pages/ProjectDetail.tsx`
- [ ] `src/pages/SettingsPage.tsx`
- [ ] `src/pages/TimelinePage.tsx` (optional)
- [ ] `src/components/CharacterAvatar.tsx`
- [ ] `src/components/layout/Layout.tsx`
- [ ] `src/components/layout/LibrarySidebar.tsx`
- [ ] `src/components/layout/MobileBottomNav.tsx`
- [ ] `src/lib/api.ts`
- [ ] `src/lib/theme.ts`
- [ ] `src/index.css`
- [ ] `src/context/AppContext.tsx`
- [ ] `src/hooks/useApi.ts`
- [ ] `src/types/api.ts`
- [ ] `index.html`
- [ ] `vite.config.ts`
- [ ] `tailwind.config.js`
- [ ] `package.json`

---

## Estimated Effort

| Task | Time |
|------|------|
| Save parser (with known format) | 2-4 hours |
| Lore KB (5-10 characters) | 2-4 hours |
| Backend API (from template) | 1-2 hours |
| Frontend rebrand (from template) | 2-3 hours |
| Testing + bug fixes | 2-4 hours |
| **Total** | **~1 day** |

If you need to reverse-engineer the save format from scratch, add 1-2 days.
