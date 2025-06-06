# MiniGPT-Med Technical Implementation Report

## 1. Overview
The MiniGPT-Med system is a medical imaging analysis platform that uses AI to generate diagnostic reports from medical images. The system consists of:

- **Frontend**: Web interface for image upload and report display
- **Backend**: FastAPI server handling image processing and report generation
- **Vision Model**: MiniGPT-Med for medical image understanding
- **Language Model**: Google Gemma via AI Studio API for report generation

## 2. AI Model Architecture

### 2.1 Vision Encoder
Implemented in [`src/models/minigpt_med.py`](src/models/minigpt_med.py)
```python
class MiniGPTMedVisionEncoder:
    def __init__(self, device="cuda", image_size=448, ...):
        # Initializes EVA-CLIP vision model
        self.image_processor = CLIPImageProcessor.from_pretrained(...)
        self.vision_model = CLIPVisionModel.from_pretrained(...)
        self.ln_vision = nn.LayerNorm(768)  # Vision feature normalization
```

Key features:
- Processes images at 448x448 resolution
- Uses EVA-CLIP vision backbone for feature extraction
- Outputs normalized vision features (768-dimensional)
- Freezes vision model parameters during inference

### 2.2 Projection Layer
```python
class MiniGPTMedProjection:
    def __init__(self, vision_hidden_size=768, llm_hidden_size=4096, ...):
        self.projection = nn.Linear(vision_hidden_size, llm_hidden_size)
    
    def project(self, vision_features):
        # Projects vision features to LLM input space
        features = vision_features[:, 1:, :]  # Skip CLS token
        return self.projection(features)
```
- Maps vision features to language model space
- Handles variable patch counts with padding
- Enables multimodal understanding by aligning visual and textual representations

### 2.3 Language Model (Gemma)
Implemented in [`src/services/report_generation.py`](src/services/report_generation.py)
- Uses Google's Gemma model via AI Studio API
- Accepts projected vision features as input
- Generates medical reports based on:
  - Image context
  - Patient data
  - Clinical context
  - Prompt templates from [`config.yaml`](config.yaml)

Key features:
- API-based integration (no local model weights)
- Supports multiple languages (English/French)
- Customizable prompt templates for different specialties
- Generates HTML-formatted reports

### 2.4 Full Model Pipeline
```python
class MiniGPTMedModel:
    def process_image(self, image):
        vision_features = self.vision_encoder.encode_image(image)
        projected_features = self.projection.project(vision_features)
        return {
            "embeddings": projected_features,
            "attention_mask": ...,
            "width": ...,
            "height": ...
        }
```
- End-to-end image processing
- Output includes embeddings and attention mask for LLM integration
- Preserves original image dimensions for spatial context

## 3. Image Processing Workflow
Implemented in [`src/services/image_processing.py`](src/services/image_processing.py)
1. Image upload via FastAPI endpoint
2. Conversion to PIL Image objects
3. Processing through vision encoder
4. Feature extraction and projection
5. Context preparation for report generation

## 4. Report Generation
Implemented in [`src/services/report_generation.py`](src/services/report_generation.py)
- Combines image features with patient data
- Uses prompt engineering with templates from config.yaml
- Generates structured reports in HTML format
- Supports multiple languages and medical specialties
- Integrates with Google Gemma via API

## 5. System Configuration
- **Environment**: Managed via `.env` file
  - `GEMINI_API_KEY`: Google AI Studio API key
- **Application Settings**: Managed via [`config.yaml`](config.yaml)
  - System prompts for different specialties
  - API host/port settings
  - Logging configuration
- **Logging**: Centralized in [`src/utils/logging.py`](src/utils/logging.py)

## 6. Performance Considerations
- **Hardware**: GPU acceleration recommended for vision processing (CUDA)
- **Precision**: Mixed-precision (fp16) support for vision model
- **API Optimization**: Async requests for Gemma API
- **Caching**: Session-based caching for repeated requests
- **Scalability**: Stateless architecture for horizontal scaling

## 7. Model Setup
- **MiniGPT-Med**: Download from:
  `https://drive.google.com/file/d/1kjGLk6s9LsBmXfLWQFCdlwF3aul08Cl8/view`
  Place in: `checkpoints/minigpt-med.pth`
- **Gemma**: Requires Google AI Studio API key
  Get from: [Google AI Studio](https://aistudio.google.com/)