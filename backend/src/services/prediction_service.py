"""
Prediction Service Layer
Integrates:
- Software Engineering: Service layer pattern, dependency injection
- Artificial Intelligence: ML model management
- Systems Programming: Resource management
"""

import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Optional, List
from functools import lru_cache
import threading
from datetime import datetime

from src.core.config import settings
from src.core.logger import get_logger
from src.core.exceptions import ModelNotLoadedError, PredictionError
from src.utils.validators import (
    SupplierInputValidator,
    ShipmentInputValidator,
    InventoryForecastValidator
)

logger = get_logger(__name__)


class ModelCache:
    """
    Thread-safe model cache
    Integrates: Systems Programming - Thread synchronization
    """
    
    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._lock = threading.RLock()
    
    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            return self._cache.get(key)
    
    def set(self, key: str, value: Any) -> None:
        with self._lock:
            self._cache[key] = value
    
    def clear(self) -> None:
        with self._lock:
            self._cache.clear()


class PredictionService:
    """
    Centralized prediction service
    
    Integrates:
    - Artificial Intelligence: ML model orchestration
    - Software Engineering: Service layer, Singleton pattern
    - Systems Programming: Resource management
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.models: Dict[str, Any] = {}
        self.model_metadata: Dict[str, Dict[str, Any]] = {}
        self.cache = ModelCache()
        self.logger = logger
        self._initialized = True
        
        if settings.models.auto_load:
            self.load_all_models()
    
    def load_all_models(self) -> None:
        """Load all configured models"""
        self.logger.info("Loading all ML models...")
        
        model_dir = Path(settings.models.directory)
        if not model_dir.exists():
            self.logger.warning(f"Model directory not found: {model_dir}")
            return
        
        for model_name, config in settings.models.models.items():
            try:
                self.load_model(model_name, config)
            except Exception as e:
                self.logger.error(f"Failed to load {model_name} model: {e}")
        
        self.logger.info(f"Loaded {len(self.models)} models successfully")
    
    def load_model(self, model_name: str, config: Dict[str, Any]) -> None:
        """Load a specific model"""
        model_path = Path(settings.models.directory) / config['file']
        
        if not model_path.exists():
            self.logger.warning(f"Model file not found: {model_path}")
            return
        
        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            
            self.models[model_name] = model
            self.model_metadata[model_name] = {
                'type': config.get('type'),
                'features': config.get('features', []),
                'loaded_at': datetime.now().isoformat()
            }
            
            self.logger.info(f" Loaded {model_name} model ({config['type']})")
            
        except Exception as e:
            self.logger.error(f"Error loading {model_name} model: {e}")
            raise
    
    def predict_supplier_reliability(
        self,
        lead_time: int,
        cost: float,
        past_orders: int
    ) -> Dict[str, Any]:
        """
        Predict supplier reliability
        
        Integrates:
        - Artificial Intelligence: Random Forest classification
        - Probability & Statistics: Probability estimation
        """
        # Validate inputs
        input_data = SupplierInputValidator(
            lead_time=lead_time,
            cost=cost,
            past_orders=past_orders
        )
        
        # Check model availability
        if 'supplier' not in self.models:
            raise ModelNotLoadedError('supplier')
        
        try:
            model = self.models['supplier']
            
            # Prepare features with column names
            features = self.model_metadata['supplier'].get('features', ['lead_time', 'cost', 'past_orders'])
            X = pd.DataFrame([[input_data.lead_time, input_data.cost, input_data.past_orders]], columns=features)
            
            # Make prediction
            prediction = int(model.predict(X)[0])
            probabilities = model.predict_proba(X)[0]
            
            result = {
                'reliability': prediction,
                'reliability_label': 'Reliable' if prediction == 1 else 'Unreliable',
                'confidence': float(probabilities[prediction]),
                'probability_reliable': float(probabilities[1]),
                'probability_unreliable': float(probabilities[0]),
                'input': input_data.dict(),
                'model': 'RandomForestClassifier'
            }
            
            self.logger.info(f"Supplier prediction: {result['reliability_label']} "
                           f"(confidence: {result['confidence']:.2%})")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Supplier prediction failed: {e}")
            raise PredictionError('supplier', str(e))
    
    def forecast_inventory(
        self,
        steps: int = 5,
        confidence_level: float = 0.95
    ) -> Dict[str, Any]:
        """
        Forecast future inventory levels
        
        Integrates:
        - Probability & Statistics: ARIMA time series forecasting
        - Artificial Intelligence: Predictive modeling
        """
        # Validate inputs
        params = InventoryForecastValidator(
            steps=steps,
            confidence_level=confidence_level
        )
        
        # Check model availability
        if 'inventory' not in self.models:
            raise ModelNotLoadedError('inventory')
        
        try:
            model = self.models['inventory']
            
            # Make forecast
            forecast = model.forecast(steps=params.steps)
            
            # Calculate confidence intervals (if supported)
            try:
                forecast_result = model.get_forecast(steps=params.steps)
                conf_int = forecast_result.conf_int(alpha=1-params.confidence_level)
                
                lower_bounds = conf_int.iloc[:, 0].tolist()
                upper_bounds = conf_int.iloc[:, 1].tolist()
            except:
                # Fallback: simple standard deviation-based intervals
                std = np.std(forecast)
                lower_bounds = [float(f - 1.96*std) for f in forecast]
                upper_bounds = [float(f + 1.96*std) for f in forecast]
            
            result = {
                'forecast': [float(x) for x in forecast],
                'lower_bound': lower_bounds,
                'upper_bound': upper_bounds,
                'steps': params.steps,
                'confidence_level': params.confidence_level,
                'model': 'ARIMA',
                'statistics': {
                    'mean': float(np.mean(forecast)),
                    'std': float(np.std(forecast)),
                    'min': float(np.min(forecast)),
                    'max': float(np.max(forecast))
                }
            }
            
            self.logger.info(f"Inventory forecast generated for {params.steps} steps")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Inventory forecast failed: {e}")
            raise PredictionError('inventory', str(e))
    
    def predict_shipment_delay(
        self,
        delivery_time: int,
        quantity: int,
        delay_time: int
    ) -> Dict[str, Any]:
        """
        Predict shipment delay probability
        
        Integrates:
        - Artificial Intelligence: Logistic regression classification
        - Probability & Statistics: Probability estimation
        """
        # Validate inputs
        input_data = ShipmentInputValidator(
            delivery_time=delivery_time,
            quantity=quantity,
            delay_time=delay_time
        )
        
        # Check model availability
        if 'shipment' not in self.models:
            raise ModelNotLoadedError('shipment')
        
        try:
            model = self.models['shipment']
            
            # Prepare features with column names
            features = self.model_metadata['shipment'].get('features', ['delivery_time', 'quantity', 'delay_time'])
            X = pd.DataFrame([[
                input_data.delivery_time,
                input_data.quantity,
                input_data.delay_time
            ]], columns=features)
            
            # Make prediction
            prediction = int(model.predict(X)[0])
            probabilities = model.predict_proba(X)[0]
            
            # Calculate risk level
            delay_prob = float(probabilities[1])
            if delay_prob < 0.3:
                risk_level = "Low"
            elif delay_prob < 0.7:
                risk_level = "Medium"
            else:
                risk_level = "High"
            
            result = {
                'delayed': prediction,
                'status': 'Delayed' if prediction == 1 else 'On Time',
                'risk_level': risk_level,
                'probability_delayed': delay_prob,
                'probability_ontime': float(probabilities[0]),
                'confidence': float(probabilities[prediction]),
                'input': input_data.dict(),
                'model': 'LogisticRegression',
                'feature_importance': self._get_feature_importance(model, 'shipment')
            }
            
            self.logger.info(f"Shipment prediction: {result['status']} "
                           f"(risk: {risk_level}, prob: {delay_prob:.2%})")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Shipment prediction failed: {e}")
            raise PredictionError('shipment', str(e))
    
    def _get_feature_importance(
        self,
        model: Any,
        model_name: str
    ) -> Dict[str, float]:
        """Extract feature importance from model"""
        try:
            features = self.model_metadata[model_name].get('features', [])
            
            if hasattr(model, 'feature_importances_'):
                importances = model.feature_importances_
            elif hasattr(model, 'coef_'):
                importances = np.abs(model.coef_[0])
            else:
                return {}
            
            return {
                feature: float(importance)
                for feature, importance in zip(features, importances)
            }
        except:
            return {}
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        return {
            'loaded_models': list(self.models.keys()),
            'model_count': len(self.models),
            'metadata': self.model_metadata
        }
    
    def reload_models(self) -> None:
        """Reload all models (useful for model updates)"""
        self.logger.info("Reloading all models...")
        self.models.clear()
        self.model_metadata.clear()
        self.cache.clear()
        self.load_all_models()


# Global service instance
@lru_cache()
def get_prediction_service() -> PredictionService:
    """Get singleton prediction service instance"""
    return PredictionService()