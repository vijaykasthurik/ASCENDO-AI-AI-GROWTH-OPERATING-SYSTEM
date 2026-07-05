import logging

from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

logger = logging.getLogger(__name__)


def llm_retry(max_attempts: int, exception_types: tuple[type[Exception], ...]):
    """Retry decorator for a single provider attempt: short exponential backoff."""
    return retry(
        reraise=True,
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=1, min=1, max=8),
        retry=retry_if_exception_type(exception_types),
        before_sleep=lambda state: logger.warning(
            "Retrying LLM call (attempt %d) after error: %s",
            state.attempt_number,
            state.outcome.exception() if state.outcome else "unknown",
        ),
    )
