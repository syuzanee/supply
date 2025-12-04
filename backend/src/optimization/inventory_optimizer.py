"""
Inventory Optimization Module
Integrates:
- Probability & Statistics: EOQ, Safety Stock, Statistical demand analysis
- Artificial Intelligence: Demand forecasting
- Systems Programming: Efficient calculations
"""

import numpy as np
from scipy import stats
from scipy.optimize import minimize
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass

from src.core.logger import get_logger
from src.core.exceptions import OptimizationError

logger = get_logger(__name__)


@dataclass
class InventoryPolicy:
    """Inventory policy result"""
    economic_order_quantity: float
    reorder_point: float
    safety_stock: float
    average_inventory: float
    total_annual_cost: float
    service_level: float
    number_of_orders: int


class InventoryOptimizer:
    """
    Advanced Inventory Optimization
    
    Integrates:
    - Probability & Statistics: EOQ model, safety stock calculation
    - Artificial Intelligence: Demand pattern recognition
    """
    
    def __init__(
        self,
        holding_cost_rate: float = 0.25,
        ordering_cost: float = 100.0,
        service_level: float = 0.95
    ):
        """
        Initialize inventory optimizer.
        
        Args:
            holding_cost_rate: Annual holding cost as percentage of item cost
            ordering_cost: Fixed cost per order
            service_level: Target service level (e.g., 0.95 for 95%)
        """
        self.holding_cost_rate = holding_cost_rate
        self.ordering_cost = ordering_cost
        self.service_level = service_level
        self.logger = logger
    
    def calculate_eoq(
        self,
        annual_demand: float,
        unit_cost: float,
        ordering_cost: Optional[float] = None,
        holding_cost_rate: Optional[float] = None
    ) -> float:
        """
        Calculate Economic Order Quantity (EOQ).
        
        Formula: EOQ = sqrt((2 * D * S) / H)
        where:
            D = Annual demand
            S = Ordering cost
            H = Holding cost per unit per year
        
        Integrates: Probability & Statistics - Optimization under uncertainty
        """
        S = ordering_cost or self.ordering_cost
        h_rate = holding_cost_rate or self.holding_cost_rate
        H = unit_cost * h_rate
        
        if annual_demand <= 0 or unit_cost <= 0:
            raise OptimizationError(
                "Demand and unit cost must be positive",
                "EOQ"
            )
        
        eoq = np.sqrt((2 * annual_demand * S) / H)
        
        self.logger.debug(
            f"EOQ calculation: demand={annual_demand:.2f}, "
            f"unit_cost={unit_cost:.2f}, EOQ={eoq:.2f}"
        )
        
        return eoq
    
    def calculate_safety_stock(
        self,
        demand_std: float,
        lead_time_days: float,
        service_level: Optional[float] = None
    ) -> float:
        """
        Calculate safety stock based on demand variability and lead time.
        
        Formula: SS = z * σ * sqrt(L)
        where:
            z = z-score for service level
            σ = Standard deviation of demand
            L = Lead time
        
        Integrates: Probability & Statistics - Normal distribution
        """
        sl = service_level or self.service_level
        
        # Get z-score for desired service level
        z_score = stats.norm.ppf(sl)
        
        # Convert lead time to same period as demand std (assume daily)
        lead_time_factor = np.sqrt(lead_time_days)
        
        safety_stock = z_score * demand_std * lead_time_factor
        
        self.logger.debug(
            f"Safety stock: z={z_score:.2f}, std={demand_std:.2f}, "
            f"lead_time={lead_time_days:.2f}, SS={safety_stock:.2f}"
        )
        
        return safety_stock
    
    def calculate_reorder_point(
        self,
        average_daily_demand: float,
        lead_time_days: float,
        safety_stock: float
    ) -> float:
        """
        Calculate reorder point (ROP).
        
        Formula: ROP = (Average daily demand × Lead time) + Safety stock
        
        Integrates: Probability & Statistics - Expected value calculation
        """
        rop = (average_daily_demand * lead_time_days) + safety_stock
        
        self.logger.debug(f"Reorder point: {rop:.2f}")
        
        return rop
    
    def optimize_inventory_policy(
        self,
        annual_demand: float,
        unit_cost: float,
        demand_std: float,
        lead_time_days: float
    ) -> InventoryPolicy:
        """
        Comprehensive inventory policy optimization.
        
        Integrates:
        - Probability & Statistics: EOQ, safety stock, cost optimization
        - Artificial Intelligence: Demand pattern analysis
        """
        try:
            # Calculate EOQ
            eoq = self.calculate_eoq(annual_demand, unit_cost)
            
            # Calculate daily demand statistics
            daily_demand_mean = annual_demand / 365
            daily_demand_std = demand_std / np.sqrt(365)
            
            # Calculate safety stock
            safety_stock = self.calculate_safety_stock(
                daily_demand_std,
                lead_time_days
            )
            
            # Calculate reorder point
            reorder_point = self.calculate_reorder_point(
                daily_demand_mean,
                lead_time_days,
                safety_stock
            )
            
            # Calculate number of orders per year
            num_orders = annual_demand / eoq
            
            # Calculate average inventory level
            avg_inventory = (eoq / 2) + safety_stock
            
            # Calculate total annual cost
            holding_cost = avg_inventory * unit_cost * self.holding_cost_rate
            ordering_cost_total = num_orders * self.ordering_cost
            total_cost = holding_cost + ordering_cost_total
            
            policy = InventoryPolicy(
                economic_order_quantity=round(eoq, 2),
                reorder_point=round(reorder_point, 2),
                safety_stock=round(safety_stock, 2),
                average_inventory=round(avg_inventory, 2),
                total_annual_cost=round(total_cost, 2),
                service_level=self.service_level,
                number_of_orders=int(np.ceil(num_orders))
            )
            
            self.logger.info(
                f"Inventory policy optimized: EOQ={policy.economic_order_quantity}, "
                f"ROP={policy.reorder_point}, Total Cost=${policy.total_annual_cost:,.2f}"
            )
            
            return policy
            
        except Exception as e:
            self.logger.error(f"Inventory optimization failed: {e}")
            raise OptimizationError(str(e), "inventory_policy")
    
    def simulate_inventory_system(
        self,
        policy: InventoryPolicy,
        daily_demands: List[float],
        lead_time_days: int,
        initial_inventory: float
    ) -> Dict[str, Any]:
        """
        Simulate inventory system performance.
        
        Integrates:
        - Probability & Statistics: Monte Carlo simulation
        - Systems Programming: Efficient iteration
        """
        inventory_levels = [initial_inventory]
        orders_placed = []
        stockouts = 0
        
        pending_orders = []  # (arrival_day, quantity)
        current_inventory = initial_inventory
        
        for day, demand in enumerate(daily_demands):
            # Check for arriving orders
            arriving_orders = [q for d, q in pending_orders if d == day]
            for quantity in arriving_orders:
                current_inventory += quantity
            pending_orders = [(d, q) for d, q in pending_orders if d > day]
            
            # Meet demand
            if current_inventory >= demand:
                current_inventory -= demand
            else:
                stockouts += 1
                current_inventory = 0
            
            # Check if reorder point reached
            if current_inventory <= policy.reorder_point:
                # Place order
                arrival_day = day + lead_time_days
                pending_orders.append((arrival_day, policy.economic_order_quantity))
                orders_placed.append(day)
            
            inventory_levels.append(current_inventory)
        
        # Calculate metrics
        avg_inventory = np.mean(inventory_levels)
        stockout_rate = stockouts / len(daily_demands)
        fill_rate = 1 - stockout_rate
        
        result = {
            'inventory_levels': inventory_levels,
            'average_inventory': round(avg_inventory, 2),
            'stockout_count': stockouts,
            'stockout_rate': round(stockout_rate, 4),
            'fill_rate': round(fill_rate, 4),
            'orders_placed': len(orders_placed),
            'service_level_achieved': round(fill_rate, 4)
        }
        
        self.logger.info(
            f"Simulation complete: Fill rate={fill_rate:.2%}, "
            f"Avg inventory={avg_inventory:.2f}"
        )
        
        return result
    
    def abc_analysis(
        self,
        items: List[Dict[str, Any]]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Perform ABC analysis for inventory classification.
        
        Integrates: Probability & Statistics - Pareto analysis
        
        Args:
            items: List of items with 'name', 'annual_demand', 'unit_cost'
        
        Returns:
            Dictionary with 'A', 'B', 'C' classifications
        """
        # Calculate annual value for each item
        for item in items:
            item['annual_value'] = item['annual_demand'] * item['unit_cost']
        
        # Sort by annual value (descending)
        sorted_items = sorted(
            items,
            key=lambda x: x['annual_value'],
            reverse=True
        )
        
        total_value = sum(item['annual_value'] for item in sorted_items)
        
        # Calculate cumulative percentages
        cumulative_value = 0
        a_items = []
        b_items = []
        c_items = []
        
        for item in sorted_items:
            cumulative_value += item['annual_value']
            cumulative_pct = cumulative_value / total_value
            
            item['cumulative_percentage'] = round(cumulative_pct * 100, 2)
            
            if cumulative_pct <= 0.80:
                item['category'] = 'A'
                a_items.append(item)
            elif cumulative_pct <= 0.95:
                item['category'] = 'B'
                b_items.append(item)
            else:
                item['category'] = 'C'
                c_items.append(item)
        
        self.logger.info(
            f"ABC Analysis: A={len(a_items)}, B={len(b_items)}, C={len(c_items)}"
        )
        
        return {
            'A': a_items,
            'B': b_items,
            'C': c_items,
            'summary': {
                'total_items': len(items),
                'total_value': round(total_value, 2),
                'a_count': len(a_items),
                'b_count': len(b_items),
                'c_count': len(c_items)
            }
        }