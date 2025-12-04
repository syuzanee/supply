"""
Input Validation Utilities
Integrates:
- Software Engineering: Validation patterns
- Probability & Statistics: Statistical validation
"""

from typing import Any, Dict, List, Optional, Union
import numpy as np
from pydantic import BaseModel, Field, validator
from src.core.exceptions import ValidationError
from src.core.logger import get_logger

logger = get_logger(__name__)


class SupplierInputValidator(BaseModel):
    """
    Supplier input validation
    Integrates: Software Engineering - Pydantic validation
    """
    lead_time: int = Field(..., ge=1, le=365, description="Lead time in days")
    cost: float = Field(..., gt=0, description="Cost per unit")
    past_orders: int = Field(..., ge=0, description="Number of past orders")
    
    @validator('lead_time')
    def validate_lead_time(cls, v):
        if v < 1:
            raise ValueError("Lead time must be at least 1 day")
        if v > 365:
            raise ValueError("Lead time cannot exceed 365 days")
        return v
    
    @validator('cost')
    def validate_cost(cls, v):
        if v <= 0:
            raise ValueError("Cost must be positive")
        if v > 1000000:
            logger.warning(f"Unusually high cost detected: ${v:,.2f}")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "lead_time": 7,
                "cost": 50.0,
                "past_orders": 100
            }
        }


class ShipmentInputValidator(BaseModel):
    """Shipment input validation"""
    delivery_time: int = Field(..., ge=1, le=365, description="Expected delivery time in days")
    quantity: int = Field(..., ge=1, description="Shipment quantity")
    delay_time: int = Field(..., ge=0, description="Historical delay time in days")
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v < 1:
            raise ValueError("Quantity must be at least 1")
        if v > 1000000:
            logger.warning(f"Large quantity detected: {v:,} units")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "delivery_time": 10,
                "quantity": 500,
                "delay_time": 2
            }
        }


class InventoryForecastValidator(BaseModel):
    """Inventory forecast parameters validation"""
    steps: int = Field(5, ge=1, le=90, description="Number of forecast steps")
    confidence_level: float = Field(0.95, ge=0.5, le=0.99, description="Confidence level")
    
    @validator('steps')
    def validate_steps(cls, v):
        if v < 1:
            raise ValueError("Steps must be at least 1")
        if v > 90:
            raise ValueError("Cannot forecast more than 90 steps ahead")
        return v


class RoutingInputValidator(BaseModel):
    """
    Vehicle routing input validation
    Integrates: Graph Theory - Route optimization validation
    """
    locations: List[Dict[str, float]] = Field(..., min_items=2, description="List of location coordinates")
    demands: List[float] = Field(..., min_items=1, description="Demand at each location")
    vehicle_capacity: float = Field(..., gt=0, description="Vehicle capacity")
    max_distance: Optional[float] = Field(None, gt=0, description="Maximum route distance")
    
    @validator('locations')
    def validate_locations(cls, v):
        for i, loc in enumerate(v):
            if 'lat' not in loc or 'lon' not in loc:
                raise ValueError(f"Location {i} missing 'lat' or 'lon'")
            if not (-90 <= loc['lat'] <= 90):
                raise ValueError(f"Invalid latitude at location {i}: {loc['lat']}")
            if not (-180 <= loc['lon'] <= 180):
                raise ValueError(f"Invalid longitude at location {i}: {loc['lon']}")
        return v
    
    @validator('demands')
    def validate_demands(cls, v, values):
        if 'locations' in values and len(v) != len(values['locations']):
            raise ValueError("Number of demands must match number of locations")
        if any(d < 0 for d in v):
            raise ValueError("Demands cannot be negative")
        return v
    
    @validator('vehicle_capacity')
    def validate_capacity(cls, v, values):
        if 'demands' in values and v < sum(values['demands']):
            raise ValueError("Vehicle capacity insufficient for total demand")
        return v


def validate_array_statistics(
    data: Union[List[float], np.ndarray],
    min_length: int = 1,
    allow_negative: bool = False,
    check_outliers: bool = True
) -> Dict[str, Any]:
    """
    Validate numerical array and compute statistics
    Integrates: Probability & Statistics - Statistical validation
    """
    if isinstance(data, list):
        data = np.array(data)
    
    if len(data) < min_length:
        raise ValidationError(
            "data",
            f"Array must have at least {min_length} elements"
        )
    
    if not allow_negative and np.any(data < 0):
        raise ValidationError(
            "data",
            "Negative values are not allowed"
        )
    
    stats = {
        "count": len(data),
        "mean": float(np.mean(data)),
        "std": float(np.std(data)),
        "min": float(np.min(data)),
        "max": float(np.max(data)),
        "median": float(np.median(data))
    }
    
    # Check for outliers using IQR method
    if check_outliers and len(data) > 3:
        Q1 = np.percentile(data, 25)
        Q3 = np.percentile(data, 75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        outliers = np.sum((data < lower_bound) | (data > upper_bound))
        stats["outliers"] = int(outliers)
        
        if outliers > 0:
            logger.warning(f"Detected {outliers} outliers in data")
    
    return stats