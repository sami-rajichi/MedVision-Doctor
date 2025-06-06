import os
import json
import logging
import shutil
from datetime import datetime
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class SessionManager:
    """
    Manages session data for MedVisionAI, including saving and retrieving
    session information, requests, and results.
    """
    
    def __init__(self, data_dir: str = "data/sessions"):
        """
        Initialize the session manager
        
        Args:
            data_dir: Directory to store session data
        """
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        logger.info(f"Session manager initialized with data directory: {data_dir}")
    
    def create_session(self, session_id: str) -> str:
        """
        Create a new session directory
        
        Args:
            session_id: Unique session identifier
            
        Returns:
            Path to the session directory
        """
        session_dir = os.path.join(self.data_dir, session_id)
        os.makedirs(session_dir, exist_ok=True)
        logger.info(f"Created session directory: {session_dir}")
        return session_dir
    
    def save_request(self, session_id: str, request_data: Dict[str, Any]) -> None:
        """
        Save request data for a session
        
        Args:
            session_id: Session identifier
            request_data: Request data to save
        """
        session_dir = os.path.join(self.data_dir, session_id)
        request_file = os.path.join(session_dir, "request.json")
        
        with open(request_file, "w") as f:
            json.dump(request_data, f, indent=2)
        
        logger.info(f"Saved request data for session {session_id}")
    
    def save_results(self, session_id: str, results: List[Dict[str, Any]]) -> None:
        """
        Save analysis results for a session
        
        Args:
            session_id: Session identifier
            results: Analysis results to save
        """
        session_dir = os.path.join(self.data_dir, session_id)
        results_file = os.path.join(session_dir, "results.json")
        
        with open(results_file, "w") as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"Saved results for session {session_id}")
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get all data for a session
        
        Args:
            session_id: Session identifier
            
        Returns:
            Session data or None if not found
        """
        session_dir = os.path.join(self.data_dir, session_id)
        if not os.path.exists(session_dir):
            logger.warning(f"Session directory not found: {session_dir}")
            return None
        
        request_file = os.path.join(session_dir, "request.json")
        results_file = os.path.join(session_dir, "results.json")
        
        session_data = {
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }
        
        if os.path.exists(request_file):
            with open(request_file, "r") as f:
                session_data["request"] = json.load(f)
        
        if os.path.exists(results_file):
            with open(results_file, "r") as f:
                session_data["results"] = json.load(f)
        
        return session_data
    
    def list_sessions(self) -> List[Dict[str, Any]]:
        """
        List all sessions with basic information
        
        Returns:
            List of session data
        """
        sessions = []
        
        if not os.path.exists(self.data_dir):
            logger.warning(f"Data directory not found: {self.data_dir}")
            return sessions
        
        for session_id in os.listdir(self.data_dir):
            session_dir = os.path.join(self.data_dir, session_id)
            if os.path.isdir(session_dir):
                request_file = os.path.join(session_dir, "request.json")
                if os.path.exists(request_file):
                    with open(request_file, "r") as f:
                        request_data = json.load(f)
                    
                    sessions.append({
                        "session_id": session_id,
                        "timestamp": request_data.get("timestamp", ""),
                        "patient_info": request_data.get("patient_info", {}),
                        "exam_type": request_data.get("exam_type", ""),
                        "image_count": len(request_data.get("image_paths", []))
                    })
        
        # Sort by timestamp (newest first)
        sessions.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        return sessions
    
    def delete_session(self, session_id: str) -> bool:
        """
        Delete a session and all its data
        
        Args:
            session_id: Session identifier
            
        Returns:
            True if successful, False otherwise
        """
        session_dir = os.path.join(self.data_dir, session_id)
        if not os.path.exists(session_dir):
            logger.warning(f"Session directory not found: {session_dir}")
            return False
        
        try:
            shutil.rmtree(session_dir)
            logger.info(f"Deleted session {session_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting session {session_id}: {str(e)}")
            return False
