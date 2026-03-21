from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "babys-best-chance.pdf"
OUTPUT_DIR = ROOT / "content"


TOP_SECTIONS = {
    "pregnancy",
    "birth",
    "life with your baby",
    "baby care",
    "baby development",
    "feeding your baby",
    "appendix",
}

CALLOUTS = {
    "did you know?",
    "try this",
    "what you can do",
    "family & friends",
    "siblings",
    "partners",
    "money sense",
    "key takeaway",
    "how to",
    "medical emergency",
    "family story",
    "danger",
    "be aware",
    "seek care",
    "what is a food allergy?",
    "what is perinatal depression?",
    "what is perinatal anxiety?",
    "what is postpartum psychosis?",
    "what are the “baby blues”?",
}

SKIP_TITLES = {
    "territorial acknowledgement and commitment",
    "acknowledgements",
    "introduction",
    "how to use this handbook",
    "canada’s food guide",
    "canada's food guide",
    "index",
}

GRAPHIC_HEAVY_PAGES = {152, 153, 154}


@dataclass(frozen=True)
class OutlineEntry:
    title: str
    norm_title: str
    page: int
    depth: int
    top_section: str | None


@dataclass(frozen=True)
class Chunk:
    number: int
    filename: str
    title: str
    start_page: int
    end_page: int
    top_section: str | None


CHUNKS = [
    Chunk(1, "01-introduction-and-handbook-use.md", "Introduction and Handbook Use", 10, 12, None),
    Chunk(2, "02-pregnancy-support-lifestyle-and-nutrition.md", "Pregnancy: Support, Lifestyle, and Nutrition", 13, 27, "pregnancy"),
    Chunk(3, "03-pregnancy-self-care-health-and-risks.md", "Pregnancy: Self-Care, Health Care, and Risks", 28, 37, "pregnancy"),
    Chunk(4, "04-pregnancy-stages-and-your-developing-baby.md", "Pregnancy: Stages and Your Developing Baby", 38, 43, "pregnancy"),
    Chunk(5, "05-birth-preparation-and-labour.md", "Birth: Preparation and Labour", 44, 52, "birth"),
    Chunk(6, "06-birth-procedures-special-circumstances-and-loss.md", "Birth: Procedures, Special Circumstances, and Loss", 53, 59, "birth"),
    Chunk(7, "07-life-with-your-baby-home-and-physical-recovery.md", "Life With Your Baby: Home and Physical Recovery", 60, 62, "life with your baby"),
    Chunk(8, "08-life-with-your-baby-emotional-health-family-and-planning.md", "Life With Your Baby: Emotional Health, Family, and Planning", 63, 76, "life with your baby"),
    Chunk(9, "09-baby-care-sleep-attachment-diapering-and-cleaning.md", "Baby Care: Sleep, Attachment, Diapering, and Cleaning", 77, 87, "baby care"),
    Chunk(10, "10-baby-care-crying-habits-medical-care-and-safety.md", "Baby Care: Crying, Habits, Medical Care, and Safety", 88, 99, "baby care"),
    Chunk(11, "11-baby-development.md", "Baby Development", 100, 104, "baby development"),
    Chunk(12, "12-feeding-your-baby-breastfeeding-and-expressing-milk.md", "Feeding Your Baby: Breastfeeding or Chestfeeding and Expressing Milk", 105, 114, "feeding your baby"),
    Chunk(13, "13-feeding-your-baby-challenges-parent-nutrition-and-supplementing.md", "Feeding Your Baby: Challenges, Parent Nutrition, and Supplementing", 115, 123, "feeding your baby"),
    Chunk(14, "14-feeding-your-baby-formula-solids-allergies-and-resources.md", "Feeding Your Baby: Formula, Solids, Allergies, and Resources", 124, 150, "feeding your baby"),
    Chunk(15, "15-appendix-deciding-how-to-feed-your-baby.md", "Appendix: Deciding How to Feed Your Baby", 155, 156, "appendix"),
    Chunk(16, "16-appendix-birth-preference-and-postpartum-support-guides.md", "Appendix: Birth Preference and Postpartum Support Guides", 157, 164, "appendix"),
    Chunk(17, "17-appendix-well-being-and-early-post-birth-handouts.md", "Appendix: Well-Being and Early Post-Birth Handouts", 165, 170, "appendix"),
]


def normalize(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text.casefold()


def slug_text(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.casefold()).strip("-")


def flatten_outline(items: Iterable, reader: PdfReader, depth: int = 0, top_section: str | None = None) -> list[OutlineEntry]:
    entries: list[OutlineEntry] = []
    active_top = top_section
    for item in items:
        if isinstance(item, list):
            entries.extend(flatten_outline(item, reader, depth + 1, active_top))
            continue

        title = getattr(item, "title", str(item)).strip()
        page = reader.get_destination_page_number(item) + 1
        norm_title = normalize(title)
        next_top = active_top
        if norm_title in TOP_SECTIONS:
            next_top = norm_title

        entries.append(OutlineEntry(title=title, norm_title=norm_title, page=page, depth=depth, top_section=next_top))
        active_top = next_top
    return entries


def clean_page_text(text: str, page_number: int) -> list[str]:
    lines = text.replace("\x00", " ").splitlines()
    cleaned: list[str] = []

    for raw_line in lines:
        line = raw_line.replace("\u00a0", " ").strip()
        if not line:
            cleaned.append("")
            continue
        if "Baby’s Best Chance" in line or "Baby's Best Chance" in line:
            continue
        if re.fullmatch(r"\d+", line):
            continue
        if page_number in GRAPHIC_HEAVY_PAGES:
            continue
        cleaned.append(line)

    while cleaned and cleaned[0] == "":
        cleaned.pop(0)
    while cleaned and cleaned[-1] == "":
        cleaned.pop()

    return cleaned


def is_list_item(line: str) -> bool:
    return bool(
        re.match(r"^(•|✔|✘|▪|¡|[0-9]+\.)\s", line)
        or re.match(r"^[A-Z]\)\s", line)
        or re.match(r"^[-*]\s", line)
    )


def is_question_prompt(line: str) -> bool:
    return line.endswith("?") and len(line.split()) <= 14


def is_heading_like(line: str, valid_headings: dict[str, OutlineEntry]) -> OutlineEntry | None:
    entry = valid_headings.get(normalize(line))
    if entry is not None:
        return entry
    return None


def is_upper_heading(line: str) -> bool:
    letters = [c for c in line if c.isalpha()]
    return bool(letters) and all(c.isupper() for c in letters) and len(line.split()) <= 8


def render_body(lines: list[str], heading_entries: dict[str, OutlineEntry], chunk: Chunk) -> str:
    output: list[str] = []
    paragraph: list[str] = []

    def flush_paragraph() -> None:
        if paragraph:
            joined = " ".join(paragraph)
            joined = re.sub(r"(?<=[A-Za-z])- (?=[a-z])", "", joined)
            joined = re.sub(r"\s+", " ", joined).strip()
            if joined:
                output.append(joined)
            paragraph.clear()

    seen_headings: set[str] = set()

    for line in lines:
        norm_line = normalize(line)
        heading_entry = is_heading_like(line, heading_entries)

        if line == "":
            flush_paragraph()
            if output and output[-1] != "":
                output.append("")
            continue

        if heading_entry is not None:
            if heading_entry.norm_title == normalize(chunk.top_section or ""):
                flush_paragraph()
                continue
            if heading_entry.norm_title in SKIP_TITLES:
                flush_paragraph()
                continue
            if heading_entry.norm_title in seen_headings:
                flush_paragraph()
                continue
            flush_paragraph()
            level = 2 if heading_entry.depth <= 1 else 3
            output.append(f'{"#" * level} {heading_entry.title}')
            output.append("")
            seen_headings.add(heading_entry.norm_title)
            continue

        if normalize(chunk.top_section or "") == norm_line:
            flush_paragraph()
            continue

        if norm_line in CALLOUTS or (is_upper_heading(line) and norm_line != normalize(chunk.top_section or "")):
            flush_paragraph()
            output.append(f"**{line}**")
            output.append("")
            continue

        if is_list_item(line):
            flush_paragraph()
            output.append(line)
            continue

        if is_question_prompt(line):
            flush_paragraph()
            output.append(f"**{line}**")
            output.append("")
            continue

        if output and output[-1].startswith("**") and not paragraph:
            paragraph.append(line)
            continue

        paragraph.append(line)

    flush_paragraph()

    while output and output[-1] == "":
        output.pop()

    compacted: list[str] = []
    for item in output:
        if item == "" and compacted and compacted[-1] == "":
            continue
        compacted.append(item)

    return "\n".join(compacted).strip() + "\n"


def build_chunk(reader: PdfReader, outline_entries: list[OutlineEntry], chunk: Chunk) -> str:
    relevant_entries: dict[str, OutlineEntry] = {}
    for entry in outline_entries:
        if not (chunk.start_page <= entry.page <= chunk.end_page):
            continue
        if chunk.top_section and entry.top_section != chunk.top_section:
            continue
        relevant_entries[entry.norm_title] = entry

    lines: list[str] = []
    for page_number in range(chunk.start_page, chunk.end_page + 1):
        if page_number in GRAPHIC_HEAVY_PAGES:
            continue
        page_text = reader.pages[page_number - 1].extract_text() or ""
        lines.extend(clean_page_text(page_text, page_number))
        lines.append("")

    body = render_body(lines, relevant_entries, chunk)
    page_note = f"_Source pages: {chunk.start_page}-{chunk.end_page}_"
    return f"# {chunk.title}\n\n{page_note}\n\n{body}"


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    reader = PdfReader(str(PDF_PATH))
    outline_entries = flatten_outline(reader.outline, reader)

    for chunk in CHUNKS:
        content = build_chunk(reader, outline_entries, chunk)
        (OUTPUT_DIR / chunk.filename).write_text(content, encoding="utf-8")


if __name__ == "__main__":
    main()
