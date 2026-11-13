"""Extract page-layout transcripts for the 2024 toddler guide and baby milestones.

Requires Poppler's pdftotext and pypdf. Source pages are physical PDF pages.
Layout transcripts preserve text associations; illustrations still require the PDF.
"""
from pathlib import Path
import re
import subprocess
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "toddlers-first-steps.pdf"
SECTIONS = [
    ("introduction", "Introduction and Handbook Use", 10, 12),
    ("attachment-and-brain-development", "Attachment, Temperament, and Brain Development", 13, 19),
    ("development-by-age", "Typical Child Development by Age: Physical, Social, Emotional, Cognitive, and Language", 20, 29),
    ("identity-independence-and-empathy", "Sexual Development, Gender Identity, Independence, and Empathy", 30, 34),
    ("play-toys-screens-and-reading", "Play, Toys, Screen Time, Reading, and Developmental Concerns", 35, 40),
    ("eating-and-breastfeeding", "Eating Well, Breastfeeding, Weaning, and Supplementing", 41, 48),
    ("formula-solids-and-cups", "Formula, Cleaning Feeding Equipment, Solid Foods, and Drinking From a Cup", 49, 53),
    ("feeding-by-age", "Feeding by Age and Meal and Snack Ideas", 54, 58),
    ("nutrition-choking-and-allergies", "Safe Foods and Drinks, Supplements, Choking, Picky Eating, and Food Allergies", 59, 67),
    ("growth-sleep-and-toileting", "Growth, Physical Activity, Sleep, and Learning to Use the Toilet", 68, 74),
    ("teeth-vision-and-hearing", "Teeth, Teething, Vision, and Hearing", 75, 80),
    ("sickness-and-immunization", "Preventing Sickness, Immunization, Fever, Cough, Cold, and Flu", 81, 86),
    ("discipline-and-behaviour", "Growing as a Parent, Positive Discipline, Tantrums, Biting, and Staying Calm", 87, 94),
    ("change-and-parenting-support", "Change, Loss, Parent Emotional Health, Relationships, and Support Needs", 95, 102),
    ("work-and-child-care", "Balancing Work and Child Care", 103, 105),
    ("home-safety", "Key Safety Messages and Childproofing Your Home", 106, 109),
    ("car-and-equipment-safety", "Car Seats, Car Safety, and Equipment Safety", 110, 114),
    ("outdoor-water-and-community-safety", "Outdoor, Water, Community, and Animal Safety", 115, 120),
    ("family-violence", "Family Violence and Abuse", 121, 122),
    ("resources", "Resources for Parents and Caregivers", 123, 142),
    ("food-guide", "Appendix: Canada’s Food Guide", 143, 146),
]


def outline_headings(reader):
    headings = []
    def walk(items):
        for item in items:
            if isinstance(item, list):
                walk(item)
            else:
                headings.append((reader.get_destination_page_number(item) + 1,
                                 re.sub(r"\s+", " ", item.title).strip()))
    walk(reader.outline)
    return headings


def extract_sections(pdf, sections, prefix, handbook):
    pages = subprocess.check_output(["pdftotext", "-layout", str(pdf), "-"]).decode().split("\f")
    headings = outline_headings(PdfReader(pdf))
    for slug, title, start, end in sections:
        parts = [f"# {title}", f"_Source pages: {start}-{end}_",
                 f"_Handbook: {handbook}._",
                 "The following page transcripts retain the source’s columns and tables. "
                 "Read age labels with their corresponding columns or rows. "
                 "Illustrations are available in the original PDF."]
        for number in range(start, end + 1):
            titles = list(dict.fromkeys(t for p, t in headings if p == number))
            parts.append(f"## PDF page {number}" + (f": {'; '.join(titles)}" if titles else ""))
            # Keep indentation, columns, check/cross symbols, numbers, and callouts.
            parts.append("```text\n" + pages[number - 1].rstrip() + "\n```")
        (ROOT / "content" / f"{prefix}{slug}.md").write_text("\n\n".join(parts) + "\n")


def main():
    extract_sections(PDF, SECTIONS, "tfs-", "Toddler’s First Steps, 4th edition, updated in 2024")
    extract_sections(ROOT / "babys-best-chance.pdf",
                     [("11-baby-development", "Baby Development", 100, 104)], "",
                     "Baby’s Best Chance, 8th edition, updated in 2024")


if __name__ == "__main__":
    main()
