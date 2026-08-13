#!/usr/bin/env python3
"""Build TOEIC vocabulary JSON + SQLite seed from the TSV source."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TSV = Path(__file__).with_name("toeic-vocab.tsv")
JSON_OUT = ROOT / "src" / "data" / "toeic-vocabulary.json"
DEMO_OUT = ROOT / "docs" / "uiux-demo" / "vocabulary.json"
SQL_SEED_NEW = ROOT / "src-tauri" / "migrations" / "025_seed_toeic_lexicon_1000.sql"
SEED_024 = ROOT / "src-tauri" / "migrations" / "024_seed_toeic_lexicon.sql"
ARTS = {
    p.stem
    for p in (ROOT / "public" / "arts").glob("*.jpg")
}
CACHE = Path("/tmp/toeic-ipa-cache.json")
CMUDICT = Path("/tmp/cmudict.dict")

ARPABET_IPA = {
    "AA": "ɑ",
    "AE": "æ",
    "AH": "ʌ",
    "AO": "ɔ",
    "AW": "aʊ",
    "AY": "aɪ",
    "B": "b",
    "CH": "tʃ",
    "D": "d",
    "DH": "ð",
    "EH": "ɛ",
    "ER": "ɝ",
    "EY": "eɪ",
    "F": "f",
    "G": "ɡ",
    "HH": "h",
    "IH": "ɪ",
    "IY": "i",
    "JH": "dʒ",
    "K": "k",
    "L": "l",
    "M": "m",
    "N": "n",
    "NG": "ŋ",
    "OW": "oʊ",
    "OY": "ɔɪ",
    "P": "p",
    "R": "ɹ",
    "S": "s",
    "SH": "ʃ",
    "T": "t",
    "TH": "θ",
    "UH": "ʊ",
    "UW": "u",
    "V": "v",
    "W": "w",
    "Y": "j",
    "Z": "z",
    "ZH": "ʒ",
}


def arpabet_to_ipa(phones: str) -> str:
    parts: list[str] = []
    for token in phones.split():
        stress = ""
        if token[-1] in "012":
            stress_mark = token[-1]
            phone = token[:-1]
            if stress_mark == "1":
                stress = "ˈ"
            elif stress_mark == "2":
                stress = "ˌ"
            if phone == "AH" and stress_mark == "0":
                parts.append("ə")
                continue
            if phone == "ER" and stress_mark == "0":
                parts.append("ɚ")
                continue
        else:
            phone = token
        ipa = ARPABET_IPA.get(phone)
        if not ipa:
            raise KeyError(phone)
        parts.append(stress + ipa)
    return "/" + "".join(parts) + "/"


def load_cmudict() -> dict[str, str]:
    mapping: dict[str, str] = {}
    if not CMUDICT.exists():
        return mapping
    for line in CMUDICT.read_text(encoding="latin-1").splitlines():
        if not line or line.startswith(";;;"):
            continue
        word_part, phones = line.split(" ", 1)
        lemma = word_part.split("(")[0].lower()
        if lemma in mapping:
            continue
        try:
            mapping[lemma] = arpabet_to_ipa(phones.strip())
        except KeyError:
            continue
    return mapping


def ipa_is_usable(value: str | None) -> bool:
    if not value or not value.startswith("/") or not value.endswith("/"):
        return False
    inner = value[1:-1]
    if len(inner) < 3:
        return False
    if any(ch in inner for ch in "()-"):
        return False
    return True


def parse_tsv() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    text = TSV.read_text(encoding="utf-8")
    lines = text.splitlines()
    header = lines[0].split("\t")
    seen: set[str] = set()
    for line_no, line in enumerate(lines[1:], start=2):
        if not line.strip():
            continue
        parts = line.split("\t")
        if len(parts) != 6:
            raise SystemExit(f"Line {line_no}: expected 6 columns, got {len(parts)}: {line!r}")
        item = dict(zip(header, parts))
        word = item["word"].strip()
        key = word.lower()
        if key in seen:
            raise SystemExit(f"Duplicate word: {word}")
        seen.add(key)
        if item["imageKey"] not in ARTS:
            raise SystemExit(f"{word}: unknown imageKey {item['imageKey']!r}")
        for field in ("pos", "meaning", "example", "exampleVi", "imageKey"):
            if not item[field].strip():
                raise SystemExit(f"{word}: empty {field}")
        rows.append(item)
    return rows


def load_cache() -> dict[str, str]:
    if CACHE.exists():
        return json.loads(CACHE.read_text(encoding="utf-8"))
    return {}


FALLBACK_IPA = {
    "invoice": "/ˈɪn.vɔɪs/",
    "applicant": "/ˈæp.lɪ.kənt/",
    "deadline": "/ˈded.laɪn/",
    "conference": "/ˈkɑːn.fər.əns/",
    "shipment": "/ˈʃɪp.mənt/",
    "budget": "/ˈbʌdʒ.ɪt/",
    "employee": "/ɪmˈplɔɪ.iː/",
    "reservation": "/ˌrez.ərˈveɪ.ʃn/",
    "inventory": "/ˈɪn.vən.tɔː.ri/",
    "memo": "/ˈmem.oʊ/",
    "headquarters": "/ˈhedˌkwɔːr.tərz/",
    "itinerary": "/aɪˈtɪn.ə.rer.i/",
    "occupancy": "/ˈɑː.kjə.pən.si/",
    "complimentary": "/ˌkɑːm.plɪˈmen.tər.i/",
    "authorize": "/ˈɔː.θə.raɪz/",
    "brochure": "/broʊˈʃʊr/",
    "resume": "/ˈrez.ə.meɪ/",
    "personnel": "/ˌpɝː.səˈnel/",
    "barcode": "/ˈbɑːr.koʊd/",
    "wifi": "/ˈwaɪ.faɪ/",
    "carry-on": "/ˈkæri.ɑn/",
    "no-show": "/ˈnoʊ.ʃoʊ/",
    "walk-in": "/ˈwɔk.ɪn/",
    "opt-in": "/ˈɑpt.ɪn/",
    "opt-out": "/ˈɑpt.aʊt/",
    "first-aid": "/ˈfɝst.eɪd/",
    "follow-up": "/ˈfɑloʊ.ʌp/",
    "eco-friendly": "/ˈikoʊ.frend.li/",
    "all-inclusive": "/ɔl.ɪnˈklu.sɪv/",
    "same-day": "/ˈseɪm.deɪ/",
    "next-day": "/ˈnɛkst.deɪ/",
    "out-of-pocket": "/aʊt.əvˈpɑk.ɪt/",
    "shrink-wrap": "/ˈʃrɪŋk.ræp/",
    "just-in-time": "/dʒʌst.ɪnˈtaɪm/",
    "a-la-carte": "/ɑ.ləˈkɑrt/",
    "Q&A": "/kju.ænd.eɪ/",
    "kpi": "/keɪ.pi.aɪ/",
    "backorder": "/ˈbæk.ɔr.dɚ/",
    "minibar": "/ˈmɪn.i.bɑr/",
    "waitlist": "/ˈweɪt.lɪst/",
    "rebrand": "/ˌriˈbrænd/",
    "influencer": "/ˈɪn.flu.ən.sɚ/",
    "outbox": "/ˈaʊt.bɑks/",
    "copay": "/ˈkoʊ.peɪ/",
    "notarize": "/ˈnoʊ.tə.raɪz/",
    "uptime": "/ˈʌp.taɪm/",
    "whiteboard": "/ˈwaɪt.bɔrd/",
    "flipchart": "/ˈflɪp.tʃɑrt/",
    "mock-up": "/ˈmɑk.ʌp/",
    "livestream": "/ˈlaɪv.strim/",
}


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main() -> None:
    rows = parse_tsv()
    cache = {word: ipa for word, ipa in load_cache().items() if ipa_is_usable(ipa)}
    cmu = load_cmudict()
    print(f"{len(rows)} words, CMU entries {len(cmu)}, API cache {len(cache)}")

    cards = []
    missing_ipa: list[str] = []
    for row in rows:
        word = row["word"]
        phonetic = FALLBACK_IPA.get(word)
        if not ipa_is_usable(phonetic):
            phonetic = cache.get(word)
        if not ipa_is_usable(phonetic):
            phonetic = cmu.get(word.lower())
        if not ipa_is_usable(phonetic):
            phonetic = cmu.get(word.lower().replace("-", ""))
        if not ipa_is_usable(phonetic):
            missing_ipa.append(word)
            continue
        cards.append(
            {
                "word": row["word"],
                "phonetic": phonetic,
                "partOfSpeech": row["pos"],
                "meaning": row["meaning"],
                "example": row["example"],
                "exampleVi": row["exampleVi"],
                "imageKey": row["imageKey"],
                "category": "TOEIC",
            }
        )

    if missing_ipa:
        raise SystemExit(f"Missing IPA for {len(missing_ipa)} words: {', '.join(missing_ipa)}")

    JSON_OUT.parent.mkdir(parents=True, exist_ok=True)
    DEMO_OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(cards, ensure_ascii=False, indent=2) + "\n"
    JSON_OUT.write_text(payload, encoding="utf-8")
    DEMO_OUT.write_text(payload, encoding="utf-8")

    seeded = set()
    if SEED_024.exists():
        import re

        seeded = {word.lower() for word in re.findall(r"\n  \('([^']+)'", SEED_024.read_text(encoding="utf-8"))}

    extra_cards = [card for card in cards if card["word"].lower() not in seeded]
    values = []
    for card in extra_cards:
        values.append(
            "("
            + ", ".join(
                [
                    sql_str(card["word"]),
                    sql_str(card["meaning"]),
                    sql_str(card["example"]),
                    sql_str(card["exampleVi"]),
                    sql_str(card["phonetic"]),
                    sql_str(card["partOfSpeech"]),
                    sql_str(card["imageKey"]),
                    sql_str(card["category"]),
                ]
            )
            + ")"
        )
    if not values:
        raise SystemExit("no new words for migration 025")
    sql = (
        "INSERT OR IGNORE INTO vocabulary "
        "(word, meaning, example, example_vi, phonetic, part_of_speech, image_key, category)\nVALUES\n  "
        + ",\n  ".join(values)
        + ";\n"
    )
    SQL_SEED_NEW.write_text(sql, encoding="utf-8")

    print(f"wrote {JSON_OUT.relative_to(ROOT)} ({len(cards)} cards)")
    print(f"wrote {DEMO_OUT.relative_to(ROOT)}")
    print(f"wrote {SQL_SEED_NEW.relative_to(ROOT)} ({len(extra_cards)} new rows)")


if __name__ == "__main__":
    main()
