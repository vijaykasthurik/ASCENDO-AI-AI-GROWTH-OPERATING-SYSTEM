class AscendoError(Exception):
    """Base exception for all domain errors."""


class LLMProviderError(AscendoError):
    """Raised when every provider in the LLM fallback chain has failed."""


class PlannerError(AscendoError):
    """Raised when the Master Planner cannot produce a valid agent plan."""


class NotFoundError(AscendoError):
    """Raised when a requested resource does not exist."""


class AuthError(AscendoError):
    """Raised on authentication/authorization failures."""
