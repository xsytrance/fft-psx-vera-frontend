# Equipment Truth QA UI

## Purpose

The Equipment Truth QA UI exists to catch the exact failure where a character hallucinates currently equipped items instead of reporting the gear parsed from the PSX save file.

The UI should make the save-fed chat stack inspectable at three levels:

1. Save Truth: what the backend says is currently equipped.
2. Prompt Truth: whether the character LLM prompt actually contains those items.
3. Model Truth: whether the model response names the expected items.

## API endpoints consumed

### `GET /api/projects/{project_id}/save-truth`

Used to display parser/persistence truth for the project.

Expected useful fields include:

- `characters[]`
- `characters[].name`
- `characters[].job`
- `characters[].level`
- `characters[].equipment[]`
- `characters[].equipment[].slot`
- `characters[].equipment[].item_name`

### `GET /api/projects/{project_id}/characters/{character_id}/prompt-inspector`

Used to verify that the generated prompt includes actual equipped items before the model answers.

Expected pass evidence:

- Prompt contains a hard save-truth label such as `ACTUAL EQUIPPED GEAR FROM SAVE`.
- Prompt contains each expected item name.
- Prompt does not force generic equipment recommendations over parsed save facts.

### `POST /api/projects/{project_id}/characters/{character_id}/equipment-truth-test`

Used to ask the model what the character has equipped and score the answer against parsed gear.

Expected response shape includes the model answer plus a pass/fail score and missing item list.

## UI flow

1. User opens a project created from an FFT PSX memory-card save.
2. Project page fetches Save Truth.
3. UI shows each save-file character's current equipment.
4. User selects a character QA action:
   - inspect prompt
   - run equipment truth test
5. UI reports whether the prompt/model result contains the expected items.

## Known verified local fixture

Current PRIME save used for verification:

```text
/home/xsyprime/Downloads/epsxe000.mcd
size: 131072 bytes
```

Expected Ramza equipment:

```text
Head: Feather Hat
Body: Leather Outfit
Accessory: Battle Boots
Weapon: Long Sword
```

A correct model response must include:

```text
Feather Hat, Leather Outfit, Battle Boots, Long Sword
```

## Pass criteria

A frontend QA pass requires:

- Save Truth fetch succeeds.
- UI renders the expected equipment for the selected character.
- Prompt inspector says the prompt contains the actual equipment label and item names.
- Equipment truth test returns `pass=true` and `Missing: []`.
- `npm run build` passes.

## Known limitations

- The backend Save Truth endpoint is currently a lightweight audit surface, not the final normalized SaveTruth schema.
- Old projects may need backend stale-save healing or re-upload if no saved upload copy is available.
- Character identity joins must handle parsed save names vs lore/display names, for example `Ramza` vs `Ramza Beoulve`.
- Runtime save files and `data/uploads/` copies are intentionally not committed to git.
