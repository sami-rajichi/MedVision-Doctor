import logging
from .config import get_logging_config

def setup_logging():
    """Configure logging based on application config"""
    config = get_logging_config()
    logging.basicConfig(
        level=config['level'],
        format=config['format']
    )
    return logging.getLogger(__name__)