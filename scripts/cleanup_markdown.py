from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIR = ROOT / "content"

REPLACEMENTS = {
    "Y our": "Your",
    "Did Y ou": "Did You",
    "T ext": "Text",
    "T oll": "Toll",
    "B efore": "Before",
    "Amniotic /f_luid": "Amniotic fluid",
    "B.C. ’s": "B.C.’s",
    "https:/ /": "https://",
    "T o ": "To ",
    "for for birthing parents": "for birthing parents",
    "✔ ": "- ",
    "✘ ": "- ",
    " ": "- ",
}

FOOTER_PATTERNS = [
    re.compile(r"^www\.perinatalservicesbc\.ca\s*$"),
    re.compile(r"^Perinatal Services BC .*•\s*$"),
    re.compile(r"^(November|December|January) 20\d\d.*$"),
    re.compile(r"^Revised August 2024\s*$"),
    re.compile(r"^\*\s*$"),
]


def is_heading(line: str) -> bool:
    return line.startswith("#")


def is_callout(line: str) -> bool:
    return line.startswith("**") and line.endswith("**")


def is_list(line: str) -> bool:
    return bool(re.match(r"^(- |\d+\. )", line))


def clean_line(line: str) -> str:
    line = line.replace("\t", " ")
    for old, new in REPLACEMENTS.items():
        line = line.replace(old, new)
    line = re.sub(r"www\.perinatalservicesbc\.ca\s+", "", line)
    line = re.sub(r"Perinatal Services BC\s+[A-Za-z]+\s+20\d\d•\s*", "", line)
    line = re.sub(r"(November|December|January)\s+20\d\d\s*•", "", line)
    line = re.sub(r"\s+", " ", line).strip()
    line = line.replace("•  ", "• ")
    line = re.sub(r"^[•▪]\s*", "- ", line)
    line = re.sub(r"^\s*", "1. ", line)
    line = re.sub(r"^\s*", "2. ", line)
    line = re.sub(r"^\s*", "3. ", line)
    line = re.sub(r"^\s*", "4. ", line)
    line = re.sub(r"\s+([,.;:?])", r"\1", line)
    line = line.replace("Visit *", "Visit")
    line = line.replace("* What is the", "What is the")
    line = line.replace(" *", "")
    return line


def keep_line(line: str) -> bool:
    if not line:
        return False
    for pattern in FOOTER_PATTERNS:
        if pattern.match(line):
            return False
    return True


def reflow(text: str) -> str:
    raw_lines = text.splitlines()
    cleaned = [clean_line(line) for line in raw_lines]
    cleaned = [line for line in cleaned if keep_line(line) or line == ""]

    out: list[str] = []
    paragraph: list[str] = []

    def flush_paragraph() -> None:
        if not paragraph:
            return
        line = " ".join(paragraph)
        line = re.sub(r"\s+", " ", line).strip()
        if line:
            out.append(line)
        paragraph.clear()

    i = 0
    while i < len(cleaned):
        line = cleaned[i]
        if not line:
            flush_paragraph()
            if out and out[-1] != "":
                out.append("")
            i += 1
            continue

        if is_heading(line) or is_callout(line):
            flush_paragraph()
            if out and out[-1] != "":
                out.append("")
            out.append(line)
            out.append("")
            i += 1
            continue

        if is_list(line):
            flush_paragraph()
            item = line
            i += 1
            while i < len(cleaned):
                nxt = cleaned[i]
                if not nxt:
                    break
                if is_heading(nxt) or is_callout(nxt) or is_list(nxt):
                    break
                item = f"{item} {nxt}".strip()
                i += 1
            out.append(item)
            continue

        paragraph.append(line)
        i += 1

    flush_paragraph()

    final: list[str] = []
    for line in out:
        if line == "" and final and final[-1] == "":
            continue
        final.append(line)

    return "\n".join(final).strip() + "\n"


def main() -> None:
    for path in sorted(CONTENT_DIR.glob("*.md")):
        original = path.read_text(encoding="utf-8")
        cleaned = reflow(original)
        path.write_text(cleaned, encoding="utf-8")


if __name__ == "__main__":
    main()
