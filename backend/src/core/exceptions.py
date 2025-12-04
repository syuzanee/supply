"""
Custom Exception Classes
Integrates: Software Engineering - Error handling design patterns
"""

from typing import Any, Dict, Optional


class SupplyChainException(Exception):
    """Base exception for all supply chain errors"""
    
    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary"""
        return {
            "error": self.__class__.__name__,
            "message": self.message,
            "error_code": self.error_code,
            "details": self.details
        }


class ModelNotLoadedError(SupplyChainException):
    """Raised when a required model is not loaded"""
    
    def __init__(self, model_name: str):
        super().__init__(
            message=f"Model '{model_name}' is not loaded",
            error_code="MODEL_NOT_LOADED",
            details={"model_name": model_name}
        )


class ValidationError(SupplyChainException):
    """Raised when input validation fails"""
    
    def __init__(self, field: str, message: str):
        super().__init__(
            message=f"Validation error for field '{field}': {message}",
            error_code="VALIDATION_ERROR",
            details={"field": field}
        )


class OptimizationError(SupplyChainException):
    """Raised when optimization fails"""
    
    def __init__(self, message: str, algorithm: str):
        super().__init__(
            message=message,
            error_code="OPTIMIZATION_ERROR",
            details={"algorithm": algorithm}
        )


class DataLoadError(SupplyChainException):
    """Raised when data loading fails"""
    
    def __init__(self, file_path: str, reason: str):
        super().__init__(
            message=f"Failed to load data from '{file_path}': {reason}",
            error_code="DATA_LOAD_ERROR",
            details={"file_path": file_path, "reason": reason}
        )


class PredictionError(SupplyChainException):
    """Raised when prediction fails"""
    
    def __init__(self, model_name: str, reason: str):
        super().__init__(
            message=f"Prediction failed for model '{model_name}': {reason}",
            error_code="PREDICTION_ERROR",
            details={"model_name": model_name, "reason": reason}
        )