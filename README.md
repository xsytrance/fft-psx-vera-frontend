# FFT PSX Vera Frontend

React/Vite frontend for FFT PSX Vera, the save-fed Final Fantasy Tactics companion app. The UI lets users create projects from PSX memory-card saves, chat with save-file characters, inspect Save Truth, and verify that model answers stay grounded in actual parsed save data.

## Current features

- Project list and project detail views.
- PSX memory-card upload flow backed by the FFT PSX Vera backend.
- Character chat UI for save-file/lore-backed personas.
- Save Truth audit panel showing parsed current player-state facts.
- Per-character equipment display sourced from parsed save data.
- Prompt inspector action to confirm actual save facts reach the character prompt.
- Equipment truth test action that asks the model about gear and scores the answer against parsed equipment.
- Static parser/download instructions for emulator save workflows.

## Save Truth Audit UI

The project page consumes backend Save Truth APIs to make hallucination debugging visible instead of guessing from chat output alone.

Primary data path:

```text
PSX .mcd/.mcr -> backend parser -> Project.save_data -> Save Truth endpoint -> ProjectView.tsx
```

The UI should distinguish:

- Parser truth: what the memory-card parser extracted.
- Persisted truth: what the backend stored for the project.
- Prompt truth: what the LLM receives in its generated prompt.
- Model truth: whether the model response includes the expected equipment.

## Equipment QA controls

On a project/character flow, the frontend supports these backend QA endpoints:

- `GET /api/projects/{project_id}/save-truth`
  - Fetches parsed save facts for audit display.
- `GET /api/projects/{project_id}/characters/{character_id}/prompt-inspector`
  - Shows/checks the generated prompt and whether it contains save-derived equipment.
- `POST /api/projects/{project_id}/characters/{character_id}/equipment-truth-test`
  - Runs a model-backed truth test and reports missing expected items.

Known verified gear from the PRIME local test card:

```text
/home/xsyprime/Downloads/epsxe000.mcd
Ramza: Feather Hat, Leather Outfit, Battle Boots, Long Sword
```

The expected pass condition is that the prompt and model answer include those actual equipped items, not generic Squire gear recommendations.

## Backend dependency

Default backend repo:

```text
/home/xsyprime/projects/fft-psx-vera
```

Relevant backend docs:

- `docs/save-equipment-grounding.md`
- `docs/status/2026-06-09-save-equipment-grounding-sitrep.md`
- `SAVE_TRUTH_SCHEMA.md`
- `SAVE_CORPUS.md`

Backend must expose the normal app APIs plus the Save Truth / prompt inspector / equipment truth test endpoints listed above.

## Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Verification checklist

Before claiming a frontend save-truth change is done:

1. `npm run build` passes.
2. The Save Truth panel fetches `/save-truth` without crashing.
3. The character equipment displayed in the UI matches backend parsed gear.
4. Prompt inspector reports the actual save-equipment label and item names.
5. Equipment truth test returns `pass=true` for the real save-file character.
6. Any backend/frontend commit hashes used for verification are recorded in the backend `docs/status/` note.

## Deployment notes

This is a Vite app. GitHub Pages/static hosting should build `dist/` from `npm run build`. If static tools or parser downloads are added, put public assets under `public/` and link them visibly from the UI.
