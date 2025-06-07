# MedVision Doctor (FastAPI + MiniGPT-Med + Gemma)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo-red)](https://youtu.be/dKqDJafCNqA)

## Overview

MedVision Doctor (Check [YouTube Demo](https://youtu.be/dKqDJafCNqA)) is a medical imaging analysis system that generates diagnostic reports from medical images. This exploratory tentative features:

- **FastAPI backend**: Robust API server for image processing and report generation
- **Modern frontend**: Clean HTML/JS interface for user interaction
- **MiniGPT-Med**: Vision-language model for medical image understanding
- **Comprehensive documentation**: Detailed technical and user guides

For in-depth information, see:
- [Technical Report](TECHNICAL_REPORT.md) - AI implementation details
- [User Guide](USER_GUIDE.md) - Setup and usage instructions

## Key Features

*   **FastAPI Backend**: High-performance Python API server
*   **Frontend UI**: Responsive web interface
*   **MiniGPT-Med Integration**: Advanced medical image understanding
*   **Multi-Image Analysis**: Process multiple images in a single session
*   **Customizable Reports**: Control report language and style
*   **Patient Context**: Include clinical details for personalized reports
*   **Comprehensive Documentation**: Technical and user guides

## System Architecture

*   **API Server**: FastAPI (`src/main.py`)
*   **Vision Model**: MiniGPT-Med (`src/models/minigpt_med.py`)
*   **Image Processing**: `src/services/image_processing.py`
*   **Report Generation**: `src/services/report_generation.py`
*   **Configuration**: Centralized in `config.yaml` and `.env`

## Requirements

*   **Python:** 3.12+
*   **GPU:** NVIDIA GPU with CUDA 11.7+ (recommended)
*   **RAM:** 8GB+
*   **Google AI Studio Account:** Required for Gemma API access

## Installation

1.  **Clone Repository:**
```bash
    git clone https://github.com/sami-rajichi/MedVision-Doctor
    cd MedVision-Doctor
```

2.  **Install Dependencies:**
```bash
    pip install -r requirements.txt
```

3.  **Download MiniGPT-Med Model:**
    Place `minigpt-med.pth` in `checkpoints/` directory
    [Download Link](https://drive.google.com/file/d/1kjGLk6s9LsBmXfLWQFCdlwF3aul08Cl8/view)

4.  **Configure Environment:**
    Create `.env` file with:
```env
# Gemma API configuration
GEMINI_API_KEY=your_api_key_here
```
Get API key from [Google AI Studio](https://aistudio.google.com/)

## Running the Application

1.  **Start Backend Server:**
```bash
    uvicorn src.main:app --reload
```
    - API docs: `http://localhost:8000/docs`

2.  **Access Web Interface:**
    Open `frontend/index.html` or visit:
    `http://localhost:8000/static/index.html`

## Project Structure

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
├── README.md          # This file
├── requirements.txt   # Install dependencies
├── TECHNICAL_REPORT.md # Technical documentation
├── USER_GUIDE.md      # User guide
├── todo.md            # Todo list
└── uv.lock            # Lock file for uv
```

## Usage Guide

For detailed instructions, see [USER_GUIDE.md](USER_GUIDE.md)

## Troubleshooting

For additional help, consult the [Technical Report](TECHNICAL_REPORT.md)
