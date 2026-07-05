"""Unified LLM client with a provider fallback chain.

Every call is attempted first against the OSM endpoint (primary, OpenAI-compatible),
then against each configured Groq key in order, followed by Zhipu AI (z.ai) and Hugging Face.
Each provider gets its own retry budget for transient failures before the client moves to the next provider.
"""

import asyncio
import logging
import re
import time
import inspect
import os
from dataclasses import dataclass

import httpx

from app.config import get_settings
from app.core.exceptions import LLMProviderError
from app.utils.json_parsing import extract_json

logger = logging.getLogger(__name__)


class ProviderHTTPError(Exception):
    def __init__(self, status_code: int, body: str):
        self.status_code = status_code
        self.body = body
        super().__init__(f"HTTP {status_code}: {body[:300]}")


@dataclass
class ProviderConfig:
    name: str
    url: str
    api_key: str
    model: str


def _build_providers() -> list[ProviderConfig]:
    settings = get_settings()
    providers: list[ProviderConfig] = []
    
    # 1. OSM (Primary)
    if settings.osm_api_key:
        providers.append(
            ProviderConfig("osm", settings.osm_api_url, settings.osm_api_key, settings.osm_model)
        )
    
    # 2. Groq Keys 1 to 7
    for idx, key in enumerate(settings.groq_api_keys, start=1):
        providers.append(
            ProviderConfig(f"groq-key-{idx}", settings.groq_api_url, key, settings.groq_model)
        )
        
    # 3. Zhipu AI (z.ai)
    if settings.zai_api_key:
        providers.append(
            ProviderConfig("z.ai", "https://open.bigmodel.cn/api/paas/v4/chat/completions", settings.zai_api_key, settings.zai_model)
        )
        
    # 4. Hugging Face
    if settings.hf_api_key:
        providers.append(
            ProviderConfig("huggingface", "https://api-inference.huggingface.co/v1/chat/completions", settings.hf_api_key, settings.hf_model)
        )
        
    return providers


async def _call_provider(
    client: httpx.AsyncClient,
    provider: ProviderConfig,
    messages: list[dict[str, str]],
    temperature: float,
) -> str:
    settings = get_settings()
    max_attempts = 3  # 1 initial + 2 retries
    
    for attempt in range(1, max_attempts + 1):
        try:
            payload = {
                "model": provider.model,
                "messages": messages,
                "temperature": temperature,
            }
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {provider.api_key}",
            }
            
            resp = await client.post(
                provider.url,
                json=payload,
                headers=headers,
                timeout=settings.llm_timeout_seconds,
            )
            
            if resp.status_code >= 400:
                raise ProviderHTTPError(resp.status_code, resp.text)
                
            data = resp.json()
            if not data or "choices" not in data or len(data["choices"]) == 0:
                raise ValueError("Empty or invalid response structure")
                
            return data["choices"][0]["message"]["content"]
            
        except Exception as exc:
            # Check if this error is transient and we should retry
            is_transient = False
            if isinstance(exc, (httpx.TimeoutException, httpx.NetworkError)):
                is_transient = True
            elif isinstance(exc, ProviderHTTPError) and (exc.status_code == 429 or exc.status_code >= 500):
                is_transient = True
                
            if is_transient and attempt < max_attempts:
                backoff_time = float(1 << (attempt - 1))
                logger.warning(
                    "Retrying %s (attempt %d of %d) after transient error: %s. Sleeping %.1fs...",
                    provider.name,
                    attempt,
                    max_attempts,
                    exc,
                    backoff_time
                )
                await asyncio.sleep(backoff_time)
                continue
            else:
                raise exc


def _parse_retry_after(body: str) -> float | None:
    match = re.search(r"try again in (?:(\d+)m)?([\d\.]+)s", body)
    if match:
        try:
            minutes = float(match.group(1)) if match.group(1) else 0.0
            seconds = float(match.group(2))
            return minutes * 60.0 + seconds
        except ValueError:
            pass
    return None


def _get_caller_context(messages: list[dict[str, str]]) -> str:
    try:
        for frame_info in inspect.stack():
            filename = frame_info.filename.lower()
            func_name = frame_info.function.lower()
            if "master_planner" in filename or "master_planner" in func_name:
                return "Master Planner"
            if "agent" in filename or "agent" in func_name:
                return "Agent Team"
            if "engine" in filename or "engine" in func_name:
                return "Business Engine"
            if "copilot" in filename or "copilot" in func_name:
                return "Copilot"
    except Exception:
        pass
        
    for msg in messages:
        content = msg.get("content", "").lower()
        if "master plan" in content or "industry" in content:
            return "Master Planner"
        if "engine" in content:
            return "Business Engine"
        if "copilot" in content:
            return "Copilot"
            
    return "LLM Client"


def _get_error_summary(exc: Exception) -> str:
    if isinstance(exc, ProviderHTTPError):
        if exc.status_code == 429:
            return "429 Rate Limit"
        return f"HTTP {exc.status_code}"
    if isinstance(exc, httpx.TimeoutException):
        return "Timeout"
    if isinstance(exc, (httpx.NetworkError, httpx.TransportError)):
        return "Network Error"
    return "Error"


async def chat_completion(messages: list[dict[str, str]], temperature: float = 0.4) -> str:
    """Run a chat completion through the OSM -> Groq[1..7] -> Z.ai -> HF fallback chain.

    Raises LLMProviderError only after every configured provider has failed.
    """
    providers = _build_providers()
    if not providers:
        raise LLMProviderError("No LLM providers are configured (missing API keys).")

    caller = _get_caller_context(messages)
    errors: list[str] = []
    transitions: list[str] = []
    
    async with httpx.AsyncClient() as client:
        for provider in providers:
            start = time.perf_counter()
            try:
                content = await _call_provider(client, provider, messages, temperature)
                elapsed = time.perf_counter() - start
                
                # Format transition: e.g. "osm Timeout -> groq-key-1 Success"
                chain_parts = []
                for p, err in zip(providers[:len(transitions)], transitions):
                    chain_parts.append(f"{p.name} {err}")
                chain_parts.append(f"{provider.name} Success")
                transition_str = " -> ".join(chain_parts)
                
                logger.info("%s: %s (in %.2fs)", caller, transition_str, elapsed)
                return content
            except Exception as exc:  # noqa: BLE001
                elapsed = time.perf_counter() - start
                err_summary = _get_error_summary(exc)
                transitions.append(err_summary)
                errors.append(f"{provider.name}: {exc}")
                
                logger.warning(
                    "Provider %s failed after %.2fs: %s",
                    provider.name,
                    elapsed,
                    exc
                )
                
                if isinstance(exc, ProviderHTTPError) and exc.status_code == 429:
                    wait_time = _parse_retry_after(exc.body)
                    if wait_time is None:
                        wait_time = 5.0
                    wait_time = min(wait_time + 1.5, 90.0)
                    logger.warning("Rate limit (429) hit on %s. Sleeping for %.2fs...", provider.name, wait_time)
                    await asyncio.sleep(wait_time)

    # Log complete failure transition
    transition_str = " -> ".join(f"{p.name} {err}" for p, err in zip(providers, transitions))
    logger.error("%s: Fallback chain exhausted: %s", caller, transition_str)
    raise LLMProviderError("All LLM providers failed: " + " | ".join(errors))


async def chat_completion_json(messages: list[dict[str, str]], temperature: float = 0.4) -> dict:
    raw = await chat_completion(messages, temperature=temperature)
    try:
        return extract_json(raw)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to parse JSON from LLM response, retrying with repair instruction: %s", exc)
        repair_messages = messages + [
            {"role": "assistant", "content": raw},
            {
                "role": "user",
                "content": (
                    f"Your previous response could not be parsed as valid JSON ({exc}). "
                    "Respond again with ONLY the corrected, valid JSON object - no markdown "
                    "fences, no commentary, and make sure all string values properly escape "
                    "newlines and quotes."
                ),
            },
        ]
        raw_repaired = await chat_completion(repair_messages, temperature=temperature)
        return extract_json(raw_repaired)
