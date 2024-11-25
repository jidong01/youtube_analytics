from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    YOUTUBE_API_KEY: str
    OPENAI_API_KEY: str
    DATABASE_URL: str = "sqlite:///./youtube.db"
    
    class Config:
        env_file = ".env"

settings = Settings() 