import requests
import logging
from typing import Dict, Optional
from src.utils.config import get_gemini_config, get_system_prompts

logger = logging.getLogger(__name__)

def generate_medical_report(
    image_context: str,
    patient_data: Dict[str, str],
    language: str,
    prompt_template_name: str
) -> str:
    """Generate medical report using Gemini API"""
    try:
        config = get_gemini_config()
        system_prompts = get_system_prompts()
        
        # Select appropriate prompt template
        template = system_prompts.get(prompt_template_name, system_prompts["General Medical Analysis"])
        system_prompt = template.format(language=language)
        
        # Build user prompt
        user_prompt = f"Patient: {patient_data.get('name', 'N/A')}, Age: {patient_data.get('age', 'N/A')}, "
        user_prompt += f"Gender: {patient_data.get('gender', 'N/A')}. Exam Type: {patient_data.get('exam_type', 'N/A')}. "
        user_prompt += f"Clinical Context: {patient_data.get('clinical_context', 'N/A')}.\n"
        user_prompt += f"Image Context: {image_context.strip()}\n"
        user_prompt += f"Task: Analyze the medical context and generate a report in {language}."
        
        # Prepare API request
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        api_url = f"{config['base_url']}/{config['model_id']}:generateContent?key={config['api_key']}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "role": "user",
                "parts": [{"text": full_prompt}]
            }],
            "generationConfig": {
                "temperature": 0.0,
                "maxOutputTokens": 2000,
                "topP": 0.95,
                "responseMimeType": "text/plain"
            }
        }
        
        # Send request to Gemini API
        logger.info("Sending request to Gemini API...")
        response = requests.post(api_url, headers=headers, json=payload)
        response.raise_for_status()
        
        # Extract and clean response
        response_data = response.json()
        if "candidates" in response_data and response_data["candidates"]:
            report_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
            
            # Clean markdown markers
            if report_text.startswith("```html"):
                report_text = report_text[7:].strip()
            elif report_text.startswith("```"):
                report_text = report_text[3:].strip()
            
            if report_text.endswith("```"):
                report_text = report_text[:-3].strip()
                
            logger.info("Report generated successfully")
            return report_text
            
        return "Error: No content returned from Gemini API"
        
    except Exception as e:
        logger.error(f"Report generation error: {str(e)}")
        return f"Error during report generation: {str(e)}"