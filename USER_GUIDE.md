# MiniGPT-Med Project Execution Guide

## 1. System Requirements
- **OS**: Windows/Linux/macOS
- **Python**: 3.12+
- **GPU**: NVIDIA GPU with CUDA 11.7+ (recommended for vision processing)
- **RAM**: 8GB+ 
- **Google AI Studio Account**: Required for Gemma API access

## 2. Installation Steps

### 2.1 Prerequisites
- Install [Python 3.12+](https://www.python.org/downloads/)
- Install [CUDA Toolkit](https://developer.nvidia.com/cuda-toolkit) (if using GPU)
- Install [Git](https://git-scm.com/downloads)

### 2.2 Setup Project
```bash
git clone https://github.com/sami-rajichi/MedVision-Doctor
cd MedVision-Doctor
```

### 2.3 Install Dependencies
```bash
pip install -r requirements.txt
```

### 2.4 Download Models
- **MiniGPT-Med**:  
  Download checkpoint: [Minigpt-med.pth](https://drive.google.com/file/d/1kjGLk6s9LsBmXfLWQFCdlwF3aul08Cl8/view)  
  Place in: `checkpoints/minigpt-med.pth`
- **Gemma**: No download needed - uses Google AI Studio API

### 2.5 Configure Environment
Create `.env` file with:
```env
# Gemma API configuration
GEMINI_API_KEY=your_api_key_here
```
Get API key from [Google AI Studio](https://aistudio.google.com/)

### 2.6 Configure System Settings (optional)
Edit `config.yaml` to customize:
- Report generation prompts
- API host/port settings
- Logging preferences

## 3. Running the Application

### 3.1 Start Backend Server
```bash
uvicorn src.main:app --reload
```
- Server runs at: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

### 3.2 Access Web Interface
Open `frontend/index.html` in browser or visit:  
`http://localhost:8000/static/index.html` or simply `http://localhost:8000/`

## 4. Using the System
1. **Upload Images**: Select medical images (JPG/PNG)
2. **Enter Patient Details**:
   - Name, Age, Gender
   - Exam type (X-Ray, MRI, etc.)
   - Clinical context notes
3. **Select Language**: Choose report language (English/French)
4. **Select Prompt Template**: Choose from available templates in `config.yaml`
5. **Generate Report**: Click "Generate" button

## 5. Example Usage
```python
# Sample API call
import requests

response = requests.post(
    "http://localhost:8000/analyze",
    files=[("images", ("xray.jpg", open("xray.jpg", "rb"), "image/jpeg"))],
    data={
        "patient_name": "John Doe",
        "patient_age": "45",
        "patient_gender": "Male",
        "exam_type": "Chest X-Ray",
        "language": "en",
        "prompt_template": "Radiology",
        "clinical_context": "Persistent cough for 3 weeks"
    }
)

print(response.json()["report"])
```

## 6. Troubleshooting
- **Gemma API errors**: Verify GEMINI_API_KEY in `.env` is valid
- **CUDA out of memory**: Reduce image size or use CPU
- **Dependency issues**: Reinstall with `pip install -r requirements.txt`
- **API errors**: Check server logs for detailed messages
- **Prompt template issues**: Verify template exists in `config.yaml`

## 7. Project Structure
```
medvision_project_refactored/
├── checkpoints/       # Model weights
│   └── minigpt-med.pth
├── frontend/          # Web interface
│   ├── index.html
│   └── script.js
├── src/               # Backend code
│   ├── models/        # AI models
│   │   └── minigpt_med.py
│   ├── services/      # Business logic
│   │   ├── image_processing.py
│   │   └── report_generation.py
│   ├── utils/         # Helper functions
│   │   ├── config.py
│   │   ├── image_utils.py
│   │   ├── logging.py
│   │   └── session_manager.py
│   └── main.py        # Application entry point
├── .env               # Environment config
├── .python-version    # Python version
├── config.yaml        # Application config
├── pyproject.toml     # Python dependencies
├── README.md          # Project overview
├── requirements.txt   # Install dependencies
├── TECHNICAL_REPORT.md # Technical documentation
├── USER_GUIDE.md      # This guide
├── todo.md            # Todo list
└── uv.lock            # Lock file for uv