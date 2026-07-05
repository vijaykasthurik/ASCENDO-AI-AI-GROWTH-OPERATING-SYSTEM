import json
import re
from typing import Any

import json_repair

_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL)


def extract_json(text: str) -> Any:
    """Best-effort extraction of a JSON value from an LLM's raw text response.

    Handles the common cases: pure JSON, JSON wrapped in a markdown code fence,
    or JSON with leading/trailing prose around the outermost {...} or [...] block.
    """
    text = text.strip()

    fence_match = _FENCE_RE.search(text)
    candidate = fence_match.group(1).strip() if fence_match else text

    try:
        # strict=False tolerates raw control characters (e.g. literal newlines)
        # that LLMs frequently leave unescaped inside multi-line string values.
        return json.loads(candidate, strict=False)
    except json.JSONDecodeError:
        pass

    start_obj, start_arr = candidate.find("{"), candidate.find("[")
    starts = [i for i in (start_obj, start_arr) if i != -1]
    if not starts:
        raise ValueError(f"No JSON object/array found in LLM output: {text[:300]!r}")
    start = min(starts)
    opener = candidate[start]
    closer = "}" if opener == "{" else "]"
    end = candidate.rfind(closer)
    # If the response was truncated mid-generation there may be no closing
    # bracket at all; still hand the tail to json_repair rather than giving up.
    sliced = candidate[start : end + 1] if end != -1 and end > start else candidate[start:]

    try:
        return json.loads(sliced, strict=False)
    except json.JSONDecodeError as e:
        # Fallback 1: remove non-printable control characters (0x00-0x1f except tab/newline/cr) and retry
        cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', sliced)
        try:
            return json.loads(cleaned, strict=False)
        except json.JSONDecodeError:
            pass

        # Fallback 2: genuinely malformed JSON (missing commas, truncated values, stray
        # tokens) is common from LLMs generating long, markdown-heavy string fields.
        # json_repair tolerates these structural errors far better than manual patching.
        try:
            repaired = json_repair.loads(cleaned)
        except Exception:
            raise e from None
        if repaired in (None, {}, []):
            raise e
        return repaired

