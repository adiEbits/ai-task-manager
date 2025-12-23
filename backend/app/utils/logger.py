import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from pythonjsonlogger import jsonlogger
from colorlog import ColoredFormatter
from app.config import settings

# Create logs directory
LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok=True)

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter with additional fields"""
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        log_record['app'] = settings.APP_NAME
        log_record['environment'] = settings.ENVIRONMENT
        log_record['level'] = record.levelname

def setup_logger(name: str = "app") -> logging.Logger:
    """
    Setup centralized logger with console and file handlers
    
    Args:
        name: Logger name (usually __name__)
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    # Prevent duplicate handlers
    if logger.handlers:
        return logger
    
    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    logger.propagate = False
    
    # Console Handler (Colored)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    
    console_format = ColoredFormatter(
        "%(log_color)s%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        log_colors={
            'DEBUG': 'cyan',
            'INFO': 'green',
            'WARNING': 'yellow',
            'ERROR': 'red',
            'CRITICAL': 'red,bg_white',
        }
    )
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)
    
    # File Handler - General logs (Rotating)
    file_handler = RotatingFileHandler(
        LOGS_DIR / "app.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.INFO)
    
    file_format = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    file_handler.setFormatter(file_format)
    logger.addHandler(file_handler)
    
    # File Handler - JSON logs (for log analysis tools)
    json_handler = RotatingFileHandler(
        LOGS_DIR / "app.json",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    json_handler.setLevel(logging.INFO)
    json_handler.setFormatter(CustomJsonFormatter())
    logger.addHandler(json_handler)
    
    # File Handler - Error logs only
    error_handler = RotatingFileHandler(
        LOGS_DIR / "error.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_format)
    logger.addHandler(error_handler)
    
    return logger

# Create default logger instance
logger = setup_logger("app")

# Convenience functions
def log_request(method: str, path: str, status_code: int, duration: float):
    """Log HTTP request"""
    logger.info(
        f"REQUEST | {method} {path} | Status: {status_code} | Duration: {duration:.3f}s"
    )

def log_database(action: str, table: str, details: str = ""):
    """Log database operations"""
    logger.info(f"DATABASE | {action} | Table: {table} | {details}")

def log_auth(action: str, user_id: str = None, details: str = ""):
    """Log authentication events"""
    logger.info(f"AUTH | {action} | User: {user_id} | {details}")

def log_error(error: Exception, context: str = ""):
    """Log errors with context"""
    logger.error(f"ERROR | {context} | {type(error).__name__}: {str(error)}", exc_info=True)