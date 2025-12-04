"""
Advanced Logging System
Integrates:
- Software Engineering: Logging best practices
- Systems Programming: File handling, rotation
"""

import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from typing import Optional
from .config import settings


class ColoredFormatter(logging.Formatter):
    """Colored console output for better readability"""
    
    COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[35m', # Magenta
    }
    RESET = '\033[0m'
    
    def format(self, record):
        if record.levelname in self.COLORS:
            record.levelname = (
                f"{self.COLORS[record.levelname]}"
                f"{record.levelname}{self.RESET}"
            )
        return super().format(record)


class LoggerManager:
    """
    Centralized logger management
    Integrates: Software Engineering - Singleton pattern
    """
    
    _loggers = {}
    _initialized = False
    
    @classmethod
    def setup(cls):
        """Initialize logging system"""
        if cls._initialized:
            return
        
        # Create logs directory
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        cls._initialized = True
    
    @classmethod
    def get_logger(cls, name: str) -> logging.Logger:
        """Get or create a logger"""
        if name in cls._loggers:
            return cls._loggers[name]
        
        cls.setup()
        
        logger = logging.getLogger(name)
        logger.setLevel(getattr(logging, settings.logging.level.upper()))
        
        # Remove existing handlers
        logger.handlers.clear()
        
        # Console handler with colors
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_formatter = ColoredFormatter(settings.logging.format)
        console_handler.setFormatter(console_formatter)
        logger.addHandler(console_handler)
        
        # File handler with rotation
        file_handler = RotatingFileHandler(
            settings.logging.file,
            maxBytes=settings.logging.max_bytes,
            backupCount=settings.logging.backup_count
        )
        file_handler.setLevel(logging.DEBUG)
        file_formatter = logging.Formatter(settings.logging.format)
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
        
        # Prevent propagation to root logger
        logger.propagate = False
        
        cls._loggers[name] = logger
        return logger


def get_logger(name: str) -> logging.Logger:
    """Convenience function to get logger"""
    return LoggerManager.get_logger(name)


# Default logger
logger = get_logger("supply_chain")