#!/usr/bin/env python3
"""Merge extra TOEIC rows into the main TSV until there are 1000 unique lemmas."""

from __future__ import annotations

import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TSV = ROOT / "toeic-vocab.tsv"
PART2 = ROOT / "toeic-vocab-part2.tsv"
EXTRA_PY = ROOT / "toeic_extra_rows.py"
ARTS = {p.stem for p in ROOT.parent.joinpath("public/arts").glob("*.jpg")}
TARGET = 1000


def load_extra_py() -> list[list[str]]:
    spec = importlib.util.spec_from_file_location("toeic_extra_rows", EXTRA_PY)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    rows = []
    for item in module.EXTRA:
        rows.append(list(item))
    return rows


def load_part2() -> list[list[str]]:
    rows = []
    for line in PART2.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line == "]":
            continue
        parts = line.split("\t")
        if len(parts) != 6:
            continue
        if parts[3] == "skip" or parts[4] == "skip":
            continue
        parts[4] = parts[4].replace("出示", "xuất trình")
        rows.append(parts)
    return rows


def valid(row: list[str], seen: set[str]) -> bool:
    word = row[0].strip()
    if not word or word.lower() in seen:
        return False
    if row[5] not in ARTS:
        return False
    if any(not cell.strip() for cell in row[:6]):
        return False
    if "skip" in row[3] or "skip" in row[4]:
        return False
    return True


def main() -> None:
    lines = TSV.read_text(encoding="utf-8").splitlines()
    header = lines[0]
    base = [line.split("\t") for line in lines[1:] if line.strip()]
    seen = {row[0].lower() for row in base}
    extra = []
    for row in load_extra_py() + load_part2():
        if valid(row, seen):
            extra.append(row)
            seen.add(row[0].lower())
        if len(base) + len(extra) >= TARGET:
            break
    if len(base) + len(extra) < TARGET:
        raise SystemExit(f"only {len(base) + len(extra)} unique rows, need {TARGET}")
    extra = extra[: TARGET - len(base)]
    out = [header] + ["\t".join(row) for row in base + extra]
    TSV.write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"wrote {TSV} with {len(base) + len(extra)} rows ({len(extra)} new)")


if __name__ == "__main__":
    main()
