import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    PORT: int = int(os.getenv("PORT", "8000"))
    SEARCH_PROVIDER: str = os.getenv("SEARCH_PROVIDER", "demo")
    TAVILY_API_KEY: str | None = os.getenv("TAVILY_API_KEY")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "demo")
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-2.5-flash")
    SUPABASE_URL: str | None = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str | None = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    PYTHON_SERVICE_API_KEY: str | None = os.getenv("PYTHON_SERVICE_API_KEY")
    CORS_ORIGINS: list[str] = [
        origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")
    ]

settings = Settings()
