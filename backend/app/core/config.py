from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(
        default="sqlite:///./sketchpad.db",
        env="DATABASE_URL"
    )
    SECRET_KEY: str = Field(
        default="your-super-secret-jwt-secret-key-change-this-in-production",
        env="SECRET_KEY"
    )
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=1440,  # 24 hours
        env="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    FRONTEND_URL: str = Field(
        default="http://localhost:3000",
        env="FRONTEND_URL"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()