# Backend task — wire the persona/lore KB into the prompt builder

This is the ready-to-paste brief for a **backend-scoped** Claude Code session
(`xsytrance/fft-psx-vera`). The frontend has authored all the grounding content;
this task wires it into the backend prompt builder + parser. See also
`README.md`, `../persona-kb.md`, `../monorepo-plan.md`, `../SESSION_HANDOFF.md`.

## Setup once the backend session starts
1. Connect the environment to **`fft-psx-vera`**. If it supports multiple
   sources, also add **`fft-psx-vera-frontend`** so Claude can read these KB
   files directly (otherwise it fetches them from raw.githubusercontent.com).
2. Paste the prompt below.
3. Have Claude read the code + KB and **propose a plan before writing code**.

## The prompt

```text
You're working on the FFT PSX Vera BACKEND (xsytrance/fft-psx-vera) — the
Python/FastAPI service behind a save-fed Final Fantasy Tactics companion app
(part of "MultiVera"). Iron rule, never break it: PARSER TRUTH FIRST. SAVETRUTH
FIRST. LLM LAST. The model must never invent gear, items, counts, levels, or
facts the parsed save doesn't contain.

MISSION: make each character speak in their actual personality, grounded in
(a) the parsed save and (b) where they are in the story — without ever letting
persona override parser truth.

THE KNOWLEDGE BASE IS ALREADY AUTHORED, in the frontend repo
(xsytrance/fft-psx-vera-frontend) under docs/. Read these FIRST:
- docs/kb/README.md          — the grounding stack + spoiler-gating + "SaveTruth wins"
- docs/kb/story-timeline.json — world + 4 chapters + events, with phase_aliases
- docs/kb/characters.json     — 16 characters: identity/voice/drive + per-chapter
                                mood/knowledge/goals/mindset/relationships
- docs/persona-kb.md          — canon persona summaries + the Brave/Faith/Zodiac/job
                                formula for custom (non-story) units
- docs/SESSION_HANDOFF.md      — broader context of the frontend work
(If this session can't see the frontend repo, fetch them from
https://raw.githubusercontent.com/xsytrance/fft-psx-vera-frontend/main/<path>,
or ask me to add that repo to the environment.)

BEFORE CODING: read the backend's system-prompt builder, the save parser, and
the SaveTruth schema/serializer. Then propose a plan and WAIT for my OK.

TASKS:
1. Import the KB into the backend (e.g. a personas/ module or shared/kb/) and load it.
2. Resolve the current chapter from the save's story_phase via phase_aliases
   (default ch1 if unmatched).
3. Match each save character (normalized name) to a canon persona; if unmatched,
   derive one from stats per persona-kb.md (job -> diction; Brave -> temperament,
   incl. <=10 "Chicken"; Faith -> devout/skeptical; Zodiac -> flavor + rapport;
   gear/skills -> texture).
4. Inject the persona + that character's by_chapter[currentChapter] state into the
   system prompt AFTER SaveTruth and the anti-hallucination guard. SPOILER-GATE:
   never inject a chapter later than the save's; a character must never "know"
   future events.
5. EXTEND THE PARSER / SAVETRUTH to expose brave, faith, and zodiac — the
   custom-unit personas need them and they aren't currently parsed or returned.
6. Surface the chosen persona text in the existing Prompt Inspector so it's
   auditable (consistent with the truth-first UX).
7. Keep frontend-facing API response shapes stable; additive changes only (the
   frontend mirrors them in src/types). Keep every existing grounding/guardrail intact.

VERIFY against a real save (there's a known PRIME test card noted in the frontend
README, with Ramza's actual gear): confirm the persona appears in the generated
prompt AND the equipment-truth test still passes.

Optional separate follow-up: docs/monorepo-plan.md proposes combining this repo
with the frontend into a monorepo — don't do it as part of this task.
```
