import os
import yaml
from pathlib import Path
from typing import Dict, Any

def load_config() -> Dict[str, Any]:
    """Load application configuration from YAML file"""
    config_path = Path(__file__).parent.parent.parent / "config.yaml"
    if not config_path.exists():
        raise FileNotFoundError(f"Configuration file not found at {config_path}")
    
    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
    return config

def get_project_root() -> Path:
    """Get the project root directory"""
    return Path(__file__).parent.parent.parent

def get_checkpoints_dir() -> Path:
    """Get checkpoints directory path"""
    config = load_config()
    return get_project_root() / config['project']['checkpoints_dir']

def get_minigpt_checkpoint() -> Path:
    """Get MiniGPT checkpoint path"""
    config = load_config()
    return get_checkpoints_dir() / config['project']['minigpt_checkpoint']

def get_gemini_config() -> Dict[str, str]:
    """Get Gemini API configuration"""
    config = load_config()
    gemini_config = config['api']['gemini'].copy()
    gemini_config['api_key'] = os.getenv("GEMINI_API_KEY")
    return gemini_config

def get_system_prompts() -> Dict[str, str]:
    """Get system prompt templates"""
    config = load_config()
    return config['system_prompts']

def get_ui_config() -> Dict[str, Any]:
    """Get UI configuration"""
    config = load_config()
    return config['ui']

def get_logging_config() -> Dict[str, Any]:
    """Get logging configuration"""
    config = load_config()
    return config['logging']