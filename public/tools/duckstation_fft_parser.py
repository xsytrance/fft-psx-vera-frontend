#!/usr/bin/env python3
"""DuckStation/PS1 raw memory-card parser with FFT equipment extraction.

Supports DuckStation/ePSXe-style raw memory cards (.mcd/.mcr): 128 KiB,
magic bytes b"MC", 15 directory entries, 15 payload blocks of 8192 bytes.

This parser is intentionally read-only. It does not modify save files.
"""
from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable

CARD_SIZE = 128 * 1024
BLOCK_SIZE = 8192
DIR_ENTRY_SIZE = 128
DIR_ENTRIES = 15
PAYLOAD_START_BLOCK = 1

FFT_GAME_IDS = ("BASCUS-94221",)

# Confirmed from /home/xsyprime/Downloads/epsxe000.mcd two-slot diff.
ITEM_NAMES: dict[int, str] = {
    0x14: "Long Sword",
    0x9E: "Feather Hat",
    0xBB: "Leather Outfit",
    0xD0: "Battle Boots",
    0xFF: "Empty",
}

EQUIP_REL_OFFSETS: dict[int, str] = {
    0x08: "head",
    0x09: "body",
    0x0A: "accessory",
    0x0B: "weapon_right_hand",
}

INVENTORY_BASE = 0x1604  # inventory_count[item_id]
NAME_REL_OFFSET = 0xB8

# Known anchors from the current controlled diff. Parser also scans names dynamically.
KNOWN_CHARACTER_BASES: dict[str, int] = {
    "Ramza": 0x048A,
    "Jody": 0x08EA,
    "Delita": 0x128A,
    "Algus": 0x136A,
}


@dataclass
class DirectoryEntry:
    index: int
    payload_offset: int
    status: int
    status_hex: str
    game_id: str
    raw_title_hex: str
    is_fft: bool


@dataclass
class EquipmentSlot:
    slot: str
    offset: int
    item_id: int
    item_id_hex: str
    item_name: str


@dataclass
class Character:
    name: str
    base_offset: int
    level: int | None
    brave: int | None
    faith: int | None
    equipment: list[EquipmentSlot]


@dataclass
class InventoryItem:
    item_id: int
    item_id_hex: str
    item_name: str
    count: int
    offset: int


@dataclass
class FFTSave:
    directory: DirectoryEntry
    characters: list[Character]
    inventory: list[InventoryItem]


@dataclass
class MemoryCard:
    path: str
    size: int
    magic: str
    valid_raw_ps1_card: bool
    directory_entries: list[DirectoryEntry]
    fft_saves: list[FFTSave]


class ParseError(ValueError):
    pass


def read_card(path: str | Path) -> bytes:
    data = Path(path).read_bytes()
    if len(data) != CARD_SIZE:
        raise ParseError(f"Expected {CARD_SIZE} bytes raw PS1 memory card, got {len(data)}")
    if data[:2] != b"MC":
        raise ParseError(f"Expected magic b'MC', got {data[:2]!r}")
    return data


def printable_ascii(raw: bytes) -> str:
    return "".join(chr(b) if 32 <= b < 127 else "." for b in raw)


def parse_game_id(entry: bytes) -> str:
    # PS1 memory card directory entries commonly store product/save ID around +0x0A.
    # Stop at first non-printable, but keep the observed FFT 16-byte IDs intact.
    raw = entry[0x0A:0x2A]
    s = "".join(chr(b) if 32 <= b < 127 else "\x00" for b in raw)
    return s.split("\x00", 1)[0].strip()


def parse_directory(data: bytes) -> list[DirectoryEntry]:
    entries: list[DirectoryEntry] = []
    for idx in range(1, DIR_ENTRIES + 1):
        raw = data[idx * DIR_ENTRY_SIZE:(idx + 1) * DIR_ENTRY_SIZE]
        game_id = parse_game_id(raw)
        payload_offset = idx * BLOCK_SIZE
        entries.append(
            DirectoryEntry(
                index=idx,
                payload_offset=payload_offset,
                status=raw[0],
                status_hex=f"0x{raw[0]:02X}",
                game_id=game_id,
                raw_title_hex=raw[:64].hex(),
                is_fft=any(game_id.startswith(prefix) for prefix in FFT_GAME_IDS),
            )
        )
    return entries


def fft_decode_text(raw: bytes) -> str:
    """Decode enough FFT PS1 text to identify character names.

    This covers letters, spaces, and terminators used in the current save. Unknown
    bytes terminate the candidate so random binary does not become fake names.
    """
    out: list[str] = []
    for b in raw:
        if b in (0xFE, 0xFF):
            break
        if b == 0x00:
            out.append(" ")
        elif 0x0A <= b <= 0x23:
            out.append(chr(ord("A") + b - 0x0A))
        elif 0x24 <= b <= 0x3D:
            out.append(chr(ord("a") + b - 0x24))
        else:
            break
    return "".join(out).strip()


def item_name(item_id: int) -> str:
    return ITEM_NAMES.get(item_id, f"Unknown_0x{item_id:02X}")


def parse_equipment(block: bytes, base: int) -> list[EquipmentSlot]:
    slots: list[EquipmentSlot] = []
    for rel, label in EQUIP_REL_OFFSETS.items():
        off = base + rel
        item_id = block[off]
        slots.append(
            EquipmentSlot(
                slot=label,
                offset=off,
                item_id=item_id,
                item_id_hex=f"0x{item_id:02X}",
                item_name=item_name(item_id),
            )
        )
    return slots


def plausible_name(name: str) -> bool:
    if not (2 <= len(name) <= 16):
        return False
    # Avoid long all-space/garbage; allow FFT-style names only.
    return all(ch.isalpha() or ch in " '-" for ch in name) and any(ch.isalpha() for ch in name)


def scan_character_bases(block: bytes, scan_extra: bool = False) -> dict[str, int]:
    found: dict[str, int] = {}

    # Known anchors are strongest for the current FFT saves. They prevent false
    # positives from random bytes that happen to decode as short names.
    for name, base in KNOWN_CHARACTER_BASES.items():
        if base + NAME_REL_OFFSET < len(block):
            decoded = fft_decode_text(block[base + NAME_REL_OFFSET:base + NAME_REL_OFFSET + 16])
            if decoded == name:
                found[name] = base

    if not scan_extra:
        return dict(sorted(found.items(), key=lambda kv: kv[1]))

    # Conservative dynamic scan for future saves/renamed generics. Reject suffix
    # matches inside a name, require sane level, and require at least one known
    # equipment byte at the inferred struct offsets.
    fft_letter = set(range(0x0A, 0x3E))
    known_item_ids = set(ITEM_NAMES)
    for name_off in range(NAME_REL_OFFSET, len(block) - 16):
        if block[name_off - 1] in fft_letter:
            continue
        name = fft_decode_text(block[name_off:name_off + 16])
        if not plausible_name(name) or name in found:
            continue
        base = name_off - NAME_REL_OFFSET
        if not (0 <= base < len(block) - 0xD0):
            continue
        level = block[base + 0x10]
        if not (1 <= level <= 99):
            continue
        equip_ids = [block[base + rel] for rel in EQUIP_REL_OFFSETS]
        if not any(e in known_item_ids for e in equip_ids):
            continue
        found[name] = base

    return dict(sorted(found.items(), key=lambda kv: kv[1]))


def parse_character(block: bytes, name: str, base: int) -> Character:
    # Known from current observations: base+0x10 = visible level.
    # Brave/Faith are visible but not fully proven from this parser yet; keep None
    # rather than lying.
    level = block[base + 0x10] if base + 0x10 < len(block) else None
    return Character(
        name=name,
        base_offset=base,
        level=level,
        brave=None,
        faith=None,
        equipment=parse_equipment(block, base),
    )


def parse_inventory(block: bytes, include_zero: bool = False) -> list[InventoryItem]:
    items: list[InventoryItem] = []
    max_count_bytes = min(256, len(block) - INVENTORY_BASE)
    known_ids: Iterable[int]
    if include_zero:
        known_ids = range(max_count_bytes)
    else:
        known_ids = sorted(k for k in ITEM_NAMES if k != 0xFF and k < max_count_bytes)

    for item_id in known_ids:
        off = INVENTORY_BASE + item_id
        count = block[off]
        if include_zero or count:
            items.append(
                InventoryItem(
                    item_id=item_id,
                    item_id_hex=f"0x{item_id:02X}",
                    item_name=item_name(item_id),
                    count=count,
                    offset=off,
                )
            )
    return items


def parse_fft_save(
    data: bytes,
    directory: DirectoryEntry,
    include_zero_inventory: bool = False,
    scan_extra_characters: bool = False,
) -> FFTSave:
    block = data[directory.payload_offset:directory.payload_offset + BLOCK_SIZE]
    bases = scan_character_bases(block, scan_extra=scan_extra_characters)
    chars = [parse_character(block, name, base) for name, base in bases.items()]
    inv = parse_inventory(block, include_zero=include_zero_inventory)
    return FFTSave(directory=directory, characters=chars, inventory=inv)


def parse_memory_card(
    path: str | Path,
    include_zero_inventory: bool = False,
    scan_extra_characters: bool = False,
) -> MemoryCard:
    data = read_card(path)
    entries = parse_directory(data)
    fft_saves = [
        parse_fft_save(data, e, include_zero_inventory, scan_extra_characters)
        for e in entries
        if e.is_fft
    ]
    return MemoryCard(
        path=str(Path(path)),
        size=len(data),
        magic=data[:2].decode("ascii", "replace"),
        valid_raw_ps1_card=True,
        directory_entries=entries,
        fft_saves=fft_saves,
    )


def diff_fft_equipment(path: str | Path, first_index: int, second_index: int) -> dict[str, Any]:
    data = read_card(path)
    entries = {e.index: e for e in parse_directory(data)}
    a_entry = entries[first_index]
    b_entry = entries[second_index]
    a = parse_fft_save(data, a_entry)
    b = parse_fft_save(data, b_entry)
    b_chars = {c.name: c for c in b.characters}

    changes: list[dict[str, Any]] = []
    for ac in a.characters:
        bc = b_chars.get(ac.name)
        if not bc:
            continue
        b_slots = {s.slot: s for s in bc.equipment}
        for aslot in ac.equipment:
            bslot = b_slots[aslot.slot]
            if aslot.item_id != bslot.item_id:
                changes.append({
                    "character": ac.name,
                    "slot": aslot.slot,
                    "first_offset": f"0x{aslot.offset:04X}",
                    "second_offset": f"0x{bslot.offset:04X}",
                    "first": {"id": aslot.item_id_hex, "name": aslot.item_name},
                    "second": {"id": bslot.item_id_hex, "name": bslot.item_name},
                })

    inv_changes: list[dict[str, Any]] = []
    ids = sorted(k for k in ITEM_NAMES if k != 0xFF)
    block_a = data[a_entry.payload_offset:a_entry.payload_offset + BLOCK_SIZE]
    block_b = data[b_entry.payload_offset:b_entry.payload_offset + BLOCK_SIZE]
    for item_id in ids:
        off = INVENTORY_BASE + item_id
        ca = block_a[off]
        cb = block_b[off]
        if ca != cb:
            inv_changes.append({
                "item_id": f"0x{item_id:02X}",
                "item_name": item_name(item_id),
                "offset": f"0x{off:04X}",
                "first_count": ca,
                "second_count": cb,
            })

    return {
        "path": str(Path(path)),
        "first": asdict(a_entry),
        "second": asdict(b_entry),
        "equipment_changes": changes,
        "inventory_changes": inv_changes,
    }


def print_summary(card: MemoryCard) -> None:
    print(f"card: {card.path}")
    print(f"size: {card.size}")
    print(f"magic: {card.magic}")
    print("\ndirectory:")
    for e in card.directory_entries:
        if e.game_id or e.status:
            marker = " FFT" if e.is_fft else ""
            print(f"  slot {e.index:02d}: status={e.status_hex} payload=0x{e.payload_offset:05X} id={e.game_id!r}{marker}")

    print("\nfft saves:")
    for save in card.fft_saves:
        print(f"  slot {save.directory.index:02d} {save.directory.game_id} payload=0x{save.directory.payload_offset:05X}")
        for c in save.characters:
            equip = ", ".join(f"{s.slot}={s.item_name}({s.item_id_hex})" for s in c.equipment)
            print(f"    {c.name:8s} base=0x{c.base_offset:04X} level={c.level} {equip}")
        if save.inventory:
            inv = ", ".join(f"{i.item_name}={i.count}" for i in save.inventory)
            print(f"    inventory: {inv}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Parse DuckStation/ePSXe raw PS1 memory cards and FFT equipment.")
    parser.add_argument("card", help="Path to .mcd/.mcr raw PS1 memory card")
    parser.add_argument("--json", action="store_true", help="Emit full parse as JSON")
    parser.add_argument("--include-zero-inventory", action="store_true", help="Include all 256 inventory count bytes")
    parser.add_argument("--scan-extra-characters", action="store_true", help="Experimental: scan beyond confirmed FFT character anchors")
    parser.add_argument("--diff-slots", nargs=2, type=int, metavar=("A", "B"), help="Diff FFT equipment/inventory between two directory slots")
    args = parser.parse_args()

    if args.diff_slots:
        result = diff_fft_equipment(args.card, args.diff_slots[0], args.diff_slots[1])
        print(json.dumps(result, indent=2))
        return 0

    card = parse_memory_card(
        args.card,
        include_zero_inventory=args.include_zero_inventory,
        scan_extra_characters=args.scan_extra_characters,
    )
    if args.json:
        print(json.dumps(asdict(card), indent=2))
    else:
        print_summary(card)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
