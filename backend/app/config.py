from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # OSM (primary LLM provider)
    osm_api_url: str = "https://api.osmapi.com/v1/chat/completions"
    osm_api_key: str = ""
    osm_model: str = "gpt-5"

    # Groq (fallback chain)
    groq_api_url: str = "https://api.groq.com/openai/v1/chat/completions"
    groq_api_key_1: str = ""
    groq_api_key_2: str = ""
    groq_api_key_3: str = ""
    groq_api_key_4: str = ""
    groq_api_key_5: str = ""
    groq_api_key_6: str = ""
    groq_api_key_7: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # Zhipu AI (z.ai)
    zai_api_key: str = ""
    zai_model: str = "glm-4"

    # Hugging Face
    hf_api_key: str = ""
    hf_model: str = "Qwen/Qwen2.5-7B-Instruct"

    llm_timeout_seconds: int = 60
    llm_max_retries_per_provider: int = 2

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "ascendo"

    # ChromaDB
    chroma_persist_dir: str = "./chroma_data"

    # Auth
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    # App
    app_env: str = "development"
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # SMTP (transactional email)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_pass: str = ""
    smtp_from_name: str = "Ascendo AI"
    frontend_base_url: str = "http://127.0.0.1:4173"

    # Stripe (payments & subscriptions)
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_starter: str = ""
    stripe_price_growth: str = ""
    stripe_price_scale: str = ""

    @property
    def groq_api_keys(self) -> list[str]:
        return [
            k
            for k in (
                self.groq_api_key_1,
                self.groq_api_key_2,
                self.groq_api_key_3,
                self.groq_api_key_4,
                self.groq_api_key_5,
                self.groq_api_key_6,
                self.groq_api_key_7,
            )
            if k
        ]

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
