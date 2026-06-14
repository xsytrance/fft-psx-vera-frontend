# Lore & Character Knowledge Base (backend-ready)

> **What this is:** a structured, spoiler-gated knowledge base of FFT's story and
> its characters' state of mind at each point in that story. It is the *character
> layer* counterpart to SaveTruth (the *truth layer*). Together they let a
> character speak as themselves, anchored both to **your actual save** and to
> **where they are in the story**.
>
> **Where it runs:** the **backend** prompt builder (`fft-psx-vera`) consumes
> this; the frontend cannot change how the model speaks. It lives here as
> portable, authored content (same as `docs/persona-kb.md`) so it drops straight
> in once the backend work happens. See `docs/SESSION_HANDOFF.md` → "top backend
> task."

## Files
- **`story-timeline.json`** — the world + the four chapters (The Meager → The
  Manipulator and the Subservient → The Valiant → Somebody to Love), each with
  major events and `phase_aliases` for matching the save's `story_phase`.
- **`characters.json`** — per character: identity, voice, core drive, and a
  `by_chapter` map of mood / what they know / goals / what's on their mind /
  relationships. A starter set of six (Ramza, Delita, Agrias, Ovelia, Mustadio,
  Orlandeau); extend with the same shape.
- **`../persona-kb.md`** — canon persona summaries + the Brave/Faith/Zodiac/job
  formula for **custom/non-story units** that have no story state.

## The grounding stack (prompt order — do not reorder)
```
1. SaveTruth        — party, levels, jobs, equipment, inventory, gil, story_phase   (truth layer)
2. Anti-hallucination guard — never invent gear/items/counts not in the save
3. Story state      — characters.json[character].by_chapter[currentChapter]         (character layer)
   + relevant world/event context from story-timeline.json for that chapter
4. Persona/voice    — voice + core_drive (this file) OR derived persona (persona-kb.md)
5. User message
```

## Spoiler gating (critical)
1. Resolve the current chapter: lowercase the save's `story_phase`, find the
   chapter whose `phase_aliases` it contains. Default to `ch1` if unmatched.
2. Inject **only** `by_chapter[currentChapter]` and **only** events/world facts at
   or before that chapter (`order <= currentChapter.order`).
3. A character must never reference, hint at, or "know" anything from a later
   chapter than the loaded save. They live in the save's present.

## Truth still wins
Story state is **flavor and motivation, never fact about the save.** If lore and
SaveTruth ever conflict, SaveTruth wins and the character defers to it. A
character may be heartbroken over a story event, but they describe *their gear
and party* from the parsed save, not from lore.

## MultiVera blueprint
This pattern is game-agnostic: a **spoiler-gated story timeline** + a
**per-character, per-phase psychology map**, both subordinate to parsed save
truth. Swap the timeline and character maps per game (chapters → acts → routes,
etc.) and the same grounding engine carries over to the next save-fed companion.

## Authoring notes
- PSX-era names are primary; War of the Lions names appear as aliases.
- Summaries are original-phrased factual grounding, not copied source text.
- Keep entries concise — they share a token budget with SaveTruth, which comes
  first and matters most.
