"""
Configuration Management System
Integrates:
- Software Engineering: Configuration management, Singleton pattern
- Systems Programming: File I/O operations
"""

import yaml
from pathlib import Path
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from functools import lru_cache


class ServerConfig(BaseModel):
    """Server configuration"""
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True
    workers: int = 4


class ModelConfig(BaseModel):
    """Model configuration"""
    directory: str = "models"
    auto_load: bool = True
    models: Dict[str, Dict[str, Any]] = Field(default_factory=dict)


class OptimizationConfig(BaseModel):
    """Optimization algorithms configuration"""
    routing: Dict[str, Any] = Field(default_factory=dict)
    inventory: Dict[str, Any] = Field(default_factory=dict)
    parallel: Dict[str, Any] = Field(default_factory=dict)


class LoggingConfig(BaseModel):
    """Logging configuration"""
    level: str = "INFO"
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    file: str = "logs/app.log"
    max_bytes: int = 10485760
    backup_count: int = 5


class Settings(BaseModel):
    """Main application settings"""
    app: Dict[str, Any] = Field(default_factory=dict)
    server: ServerConfig = Field(default_factory=ServerConfig)
    models: ModelConfig = Field(default_factory=ModelConfig)
    optimization: OptimizationConfig = Field(default_factory=OptimizationConfig)
    logging: LoggingConfig = Field(default_factory=LoggingConfig)
    cache: Dict[str, Any] = Field(default_factory=dict)
    security: Dict[str, Any] = Field(default_factory=dict)
    features: Dict[str, bool] = Field(default_factory=dict)

    @classmethod
    def load_from_yaml(cls, config_path: str = "config.yaml") -> "Settings":
        """Load settings from YAML file"""
        path = Path(config_path)
        
        if not path.exists():
            print(f"Warning: Config file {config_path} not found, using defaults")
            return cls()
        
        with open(path, 'r') as f:
            config_data = yaml.safe_load(f)
        
        return cls(**config_data)
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by dot notation (e.g., 'server.port')"""
        keys = key.split('.')
        value = self.model_dump()
        
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k, default)
            else:
                return default
        
        return value


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance (Singleton pattern)"""
    return Settings.load_from_yaml()


# Global settings instance
settings = get_settings()