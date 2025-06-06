from typing import Dict, Tuple, List, Optional
from PIL import Image
from src.models.minigpt_med import MiniGPTMedModel
from src.utils.config import get_minigpt_checkpoint
import logging

logger = logging.getLogger(__name__)

def process_images(images: List[Image.Image]) -> Tuple[List[Image.Image], str]:
    """Process images using MiniGPT-Med model"""
    processed_images = []
    vision_context = ""
    
    try:
        checkpoint_path = get_minigpt_checkpoint()
        minigpt_med = MiniGPTMedModel(checkpoint_path=checkpoint_path)
        
        for i, img in enumerate(images):
            vision_output = minigpt_med.process_image(img)
            processed_img = vision_output.get("processed_image")
            
            if processed_img:
                processed_images.append(processed_img)
                
            if vision_output.get("embeddings") is not None:
                embedding_summary = f"Embedding dims: {vision_output['embeddings'].shape}"
            else:
                embedding_summary = "No embeddings generated"
                
            vision_context += (
                f"[Image {i+1} processed. Dimensions: "
                f"{vision_output.get('width', 'N/A')}x{vision_output.get('height', 'N/A')}. "
                f"{embedding_summary}]\n"
            )
            
        logger.info("Image processing completed successfully")
        
    except Exception as e:
        logger.error(f"Image processing error: {str(e)}")
        vision_context = f"[Vision model processing failed: {str(e)}]\n"
    
    return processed_images, vision_context