import re

_HEADER_RE = re.compile(r"^(#{1,6})\s+(.*)$", re.MULTILINE)


def parse_sections(readme_text: str) -> list[dict]:
    """Split a markdown README into an ordered list of {heading, level, content}."""
    matches = list(_HEADER_RE.finditer(readme_text))
    if not matches:
        return [{"heading": "Document", "level": 1, "content": readme_text.strip()}]

    sections = []
    for i, match in enumerate(matches):
        heading = match.group(2).strip()
        level = len(match.group(1))
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(readme_text)
        content = readme_text[start:end].strip()
        sections.append({"heading": heading, "level": level, "content": content})
    return sections


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[str]:
    """Fixed-size sliding-window chunker used to prepare text for embedding."""
    text = text.strip()
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = max(end - overlap, start + 1)
    return chunks


def build_embedding_chunks(readme_text: str) -> list[str]:
    """Section-aware chunks ready to hand to ChromaDB, each prefixed with its heading."""
    chunks: list[str] = []
    for section in parse_sections(readme_text):
        prefix = f"{section['heading']}: " if section["heading"] != "Document" else ""
        for piece in chunk_text(section["content"]):
            chunks.append(prefix + piece)
    return chunks
