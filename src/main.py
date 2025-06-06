import os
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import logging
from typing import List
from PIL import Image
import io

# Local imports
from src.utils.config import load_config, get_logging_config
from src.services.image_processing import process_images
from src.services.report_generation import generate_medical_report

# Configure logging
logging.basicConfig(
    level=get_logging_config()['level'],
    format=get_logging_config()['format']
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configuration
config = load_config()
SYSTEM_PROMPTS = config['system_prompts']

app = FastAPI()

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend files
app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("frontend/index.html", "r") as f:
        return HTMLResponse(content=f.read(), status_code=200)

@app.post("/analyze")
async def analyze_images(
    images: List[UploadFile] = File(...),
    patient_name: str = Form(...),
    patient_age: str = Form(...),
    patient_gender: str = Form(...),
    exam_type: str = Form(...),
    language: str = Form(...),
    prompt_template: str = Form(...),
    clinical_context: str = Form(...)
):
    # Process uploaded images
    image_data = []
    for image in images:
        contents = await image.read()
        img = Image.open(io.BytesIO(contents))
        image_data.append(img)
    
    # Process images and generate report
    # Process images and get context string
    processed_context = process_images(image_data)
    
    # Prepare patient data
    patient_data = {
        "name": patient_name,
        "age": patient_age,
        "gender": patient_gender,
        "exam_type": exam_type,
        "language": language,
        "prompt_template": prompt_template,
        "clinical_context": clinical_context
    }
    
    # Generate report
    try:
        report = generate_medical_report(
            image_context=str(processed_context),  # Ensure we pass a string
            patient_data=patient_data,
            language=language,
            prompt_template_name=prompt_template
        )
    except Exception as e:
        logger.error(f"Report generation failed: {str(e)}")
        return {"error": f"Report generation failed: {str(e)}"}
    
    return {"report": report}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)