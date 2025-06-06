import os
import io
import base64
import logging
from PIL import Image
from fastapi import UploadFile
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

def save_uploaded_image(
    upload_file: UploadFile, 
    session_dir: str, 
    base_name: str
) -> str:
    """
    Save an uploaded image to the session directory
    
    Args:
        upload_file: Uploaded file
        session_dir: Session directory path
        base_name: Base name for the saved file
        
    Returns:
        Path to the saved image
    """
    # Get file extension from content type or filename
    content_type = upload_file.content_type or ""
    extension = ""
    
    if content_type.startswith("image/"):
        extension = content_type.split("/")[1]
    else:
        # Try to get extension from filename
        filename = upload_file.filename or ""
        if "." in filename:
            extension = filename.rsplit(".", 1)[1].lower()
    
    # Default to jpg if no extension found
    if not extension or extension not in ["jpg", "jpeg", "png", "gif", "bmp", "tiff"]:
        extension = "jpg"
    
    # Create filename
    filename = f"{base_name}.{extension}"
    file_path = os.path.join(session_dir, filename)
    
    # Save the file
    try:
        # Read the file content
        content = upload_file.file.read()
        
        # Save to disk
        with open(file_path, "wb") as f:
            f.write(content)
        
        logger.info(f"Saved uploaded image to {file_path}")
        return file_path
    
    except Exception as e:
        logger.error(f"Error saving uploaded image: {str(e)}")
        raise
    finally:
        # Reset file pointer
        upload_file.file.seek(0)

def get_image_path(session_id: str, image_name: str) -> str:
    """
    Get the path to an image in a session
    
    Args:
        session_id: Session identifier
        image_name: Image name
        
    Returns:
        Path to the image
    """
    return os.path.join("data", "sessions", session_id, image_name)

def resize_image(
    image_path: str, 
    max_size: Tuple[int, int] = (800, 800)
) -> Image.Image:
    """
    Resize an image while maintaining aspect ratio
    
    Args:
        image_path: Path to the image
        max_size: Maximum width and height
        
    Returns:
        Resized PIL Image
    """
    try:
        img = Image.open(image_path)
        img.thumbnail(max_size, Image.LANCZOS)
        return img
    except Exception as e:
        logger.error(f"Error resizing image {image_path}: {str(e)}")
        raise

def image_to_base64(image_path: str) -> str:
    """
    Convert an image to base64 encoding
    
    Args:
        image_path: Path to the image
        
    Returns:
        Base64 encoded string
    """
    try:
        with open(image_path, "rb") as img_file:
            return base64.b64encode(img_file.read()).decode()
    except Exception as e:
        logger.error(f"Error converting image to base64 {image_path}: {str(e)}")
        raise

def pil_to_base64(pil_image: Image.Image, format: str = "JPEG") -> str:
    """
    Convert a PIL Image to base64 encoding
    
    Args:
        pil_image: PIL Image object
        format: Image format for encoding
        
    Returns:
        Base64 encoded string
    """
    try:
        buffered = io.BytesIO()
        pil_image.save(buffered, format=format)
        return base64.b64encode(buffered.getvalue()).decode()
    except Exception as e:
        logger.error(f"Error converting PIL image to base64: {str(e)}")
        raise
