"""
Vehicle Routing Problem (VRP) Optimization
Integrates:
- Graph Theory: VRP, shortest path, MST
- Algorithms: Clarke-Wright, Genetic Algorithm
- Systems Programming: Efficient graph operations
"""

import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass
import heapq
from itertools import combinations

from src.core.logger import get_logger
from src.core.exceptions import OptimizationError

logger = get_logger(__name__)


@dataclass
class Location:
    """Location node in the graph"""
    id: int
    name: str
    lat: float
    lon: float
    demand: float = 0.0


@dataclass
class Route:
    """Vehicle route"""
    vehicle_id: int
    locations: List[Location]
    total_distance: float
    total_demand: float


class VehicleRoutingOptimizer:
    """
    Vehicle Routing Problem Solver
    
    Integrates:
    - Graph Theory: Graph algorithms, shortest paths
    - Algorithms: Clarke-Wright savings algorithm
    - Parallel Programming: Multi-route optimization
    """
    
    def __init__(
        self,
        vehicle_capacity: float = 1000.0,
        max_distance: float = 500.0
    ):
        """
        Initialize VRP optimizer.
        
        Args:
            vehicle_capacity: Maximum capacity per vehicle
            max_distance: Maximum distance per route
        """
        self.vehicle_capacity = vehicle_capacity
        self.max_distance = max_distance
        self.logger = logger
    
    def haversine_distance(
        self,
        loc1: Location,
        loc2: Location
    ) -> float:
        """
        Calculate distance between two locations using Haversine formula.
        
        Integrates: Graph Theory - Distance metric for graph edges
        """
        # Convert to radians
        lat1, lon1 = np.radians([loc1.lat, loc1.lon])
        lat2, lon2 = np.radians([loc2.lat, loc2.lon])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
        c = 2 * np.arcsin(np.sqrt(a))
        
        # Earth radius in kilometers
        radius = 6371.0
        
        distance = radius * c
        
        return distance
    
    def build_distance_matrix(
        self,
        locations: List[Location]
    ) -> np.ndarray:
        """
        Build distance matrix for all location pairs.
        
        Integrates: Graph Theory - Adjacency matrix representation
        """
        n = len(locations)
        matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(i+1, n):
                dist = self.haversine_distance(locations[i], locations[j])
                matrix[i][j] = dist
                matrix[j][i] = dist
        
        self.logger.debug(f"Built distance matrix: {n}x{n}")
        
        return matrix
    
    def clarke_wright_algorithm(
        self,
        depot: Location,
        customers: List[Location],
        distance_matrix: np.ndarray
    ) -> List[Route]:
        """
        Clarke-Wright Savings Algorithm for VRP.
        
        Integrates:
        - Graph Theory: Savings algorithm for TSP/VRP
        - Algorithms: Greedy optimization
        
        Steps:
        1. Calculate savings for combining routes
        2. Sort savings in descending order
        3. Merge routes while respecting constraints
        """
        n = len(customers)
        
        # Calculate savings for all pairs
        savings = []
        for i in range(n):
            for j in range(i+1, n):
                # s(i,j) = d(0,i) + d(0,j) - d(i,j)
                saving = (
                    distance_matrix[0][i+1] +
                    distance_matrix[0][j+1] -
                    distance_matrix[i+1][j+1]
                )
                savings.append((saving, i, j))
        
        # Sort by savings (descending)
        savings.sort(reverse=True, key=lambda x: x[0])
        
        # Initialize: each customer in separate route
        routes = [[customer] for customer in customers]
        route_demands = [customer.demand for customer in customers]
        
        # Merge routes based on savings
        for saving, i, j in savings:
            # Find routes containing customers i and j
            route_i = None
            route_j = None
            
            for idx, route in enumerate(routes):
                if customers[i] in route:
                    route_i = idx
                if customers[j] in route:
                    route_j = idx
            
            # Check if customers are in different routes
            if route_i is None or route_j is None or route_i == route_j:
                continue
            
            # Check capacity constraint
            combined_demand = route_demands[route_i] + route_demands[route_j]
            if combined_demand > self.vehicle_capacity:
                continue
            
            # Merge routes
            routes[route_i].extend(routes[route_j])
            route_demands[route_i] = combined_demand
            
            # Remove merged route
            del routes[route_j]
            del route_demands[route_j]
        
        # Create Route objects
        result_routes = []
        for vehicle_id, (route_locs, demand) in enumerate(zip(routes, route_demands)):
            # Calculate total distance (depot -> customers -> depot)
            total_dist = distance_matrix[0][route_locs[0].id]
            
            for k in range(len(route_locs) - 1):
                total_dist += distance_matrix[route_locs[k].id][route_locs[k+1].id]
            
            total_dist += distance_matrix[route_locs[-1].id][0]
            
            result_routes.append(Route(
                vehicle_id=vehicle_id,
                locations=[depot] + route_locs + [depot],
                total_distance=round(total_dist, 2),
                total_demand=round(demand, 2)
            ))
        
        self.logger.info(
            f"Clarke-Wright: Generated {len(result_routes)} routes, "
            f"Total distance: {sum(r.total_distance for r in result_routes):.2f} km"
        )
        
        return result_routes
    
    def nearest_neighbor(
        self,
        depot: Location,
        customers: List[Location],
        distance_matrix: np.ndarray
    ) -> List[Route]:
        """
        Nearest Neighbor heuristic for VRP.
        
        Integrates: Graph Theory - Greedy graph traversal
        """
        unvisited = set(range(len(customers)))
        routes = []
        vehicle_id = 0
        
        while unvisited:
            current_route = [depot]
            current_demand = 0.0
            current_location = 0  # depot
            
            while unvisited:
                # Find nearest unvisited customer
                nearest_dist = float('inf')
                nearest_customer = None
                
                for customer_idx in unvisited:
                    dist = distance_matrix[current_location][customer_idx + 1]
                    if dist < nearest_dist:
                        # Check capacity constraint
                        if current_demand + customers[customer_idx].demand <= self.vehicle_capacity:
                            nearest_dist = dist
                            nearest_customer = customer_idx
                
                if nearest_customer is None:
                    break
                
                # Add to route
                current_route.append(customers[nearest_customer])
                current_demand += customers[nearest_customer].demand
                current_location = nearest_customer + 1
                unvisited.remove(nearest_customer)
            
            # Return to depot
            current_route.append(depot)
            
            # Calculate total distance
            total_dist = 0.0
            for i in range(len(current_route) - 1):
                loc1_idx = 0 if current_route[i] == depot else current_route[i].id
                loc2_idx = 0 if current_route[i+1] == depot else current_route[i+1].id
                total_dist += distance_matrix[loc1_idx][loc2_idx]
            
            routes.append(Route(
                vehicle_id=vehicle_id,
                locations=current_route,
                total_distance=round(total_dist, 2),
                total_demand=round(current_demand, 2)
            ))
            
            vehicle_id += 1
        
        self.logger.info(
            f"Nearest Neighbor: Generated {len(routes)} routes"
        )
        
        return routes
    
    def optimize_routes(
        self,
        depot: Dict[str, Any],
        customers: List[Dict[str, Any]],
        algorithm: str = 'clarke_wright'
    ) -> Dict[str, Any]:
        """
        Main optimization method.
        
        Args:
            depot: Depot location dict with 'lat', 'lon', 'name'
            customers: List of customer dicts with 'lat', 'lon', 'demand', 'name'
            algorithm: 'clarke_wright' or 'nearest_neighbor'
        
        Returns:
            Optimization result with routes and statistics
        """
        try:
            # Create Location objects
            depot_loc = Location(
                id=0,
                name=depot.get('name', 'Depot'),
                lat=depot['lat'],
                lon=depot['lon'],
                demand=0.0
            )
            
            customer_locs = [
                Location(
                    id=i+1,
                    name=c.get('name', f'Customer {i+1}'),
                    lat=c['lat'],
                    lon=c['lon'],
                    demand=c.get('demand', 0.0)
                )
                for i, c in enumerate(customers)
            ]
            
            # Build distance matrix
            all_locations = [depot_loc] + customer_locs
            distance_matrix = self.build_distance_matrix(all_locations)
            
            # Run optimization algorithm
            if algorithm == 'clarke_wright':
                routes = self.clarke_wright_algorithm(
                    depot_loc,
                    customer_locs,
                    distance_matrix
                )
            elif algorithm == 'nearest_neighbor':
                routes = self.nearest_neighbor(
                    depot_loc,
                    customer_locs,
                    distance_matrix
                )
            else:
                raise OptimizationError(
                    f"Unknown algorithm: {algorithm}",
                    "vehicle_routing"
                )
            
            # Calculate statistics
            total_distance = sum(r.total_distance for r in routes)
            total_demand = sum(r.total_demand for r in routes)
            avg_distance = total_distance / len(routes) if routes else 0
            
            result = {
                'routes': [
                    {
                        'vehicle_id': r.vehicle_id,
                        'locations': [
                            {'name': loc.name, 'lat': loc.lat, 'lon': loc.lon}
                            for loc in r.locations
                        ],
                        'total_distance': r.total_distance,
                        'total_demand': r.total_demand
                    }
                    for r in routes
                ],
                'statistics': {
                    'num_vehicles': len(routes),
                    'total_distance': round(total_distance, 2),
                    'total_demand': round(total_demand, 2),
                    'avg_distance_per_route': round(avg_distance, 2),
                    'vehicle_utilization': round(
                        (total_demand / (len(routes) * self.vehicle_capacity)) * 100, 2
                    )
                },
                'algorithm': algorithm
            }
            
            self.logger.info(
                f"Route optimization complete: {len(routes)} routes, "
                f"{total_distance:.2f} km total"
            )
            
            return result
            
        except Exception as e:
            self.logger.error(f"Route optimization failed: {e}")
            raise OptimizationError(str(e), "vehicle_routing")
    
    def dijkstra_shortest_path(
        self,
        distance_matrix: np.ndarray,
        start: int,
        end: int
    ) -> Tuple[float, List[int]]:
        """
        Dijkstra's algorithm for shortest path.
        
        Integrates: Graph Theory - Shortest path algorithm
        """
        n = len(distance_matrix)
        distances = [float('inf')] * n
        distances[start] = 0
        previous = [-1] * n
        visited = set()
        
        # Priority queue: (distance, node)
        pq = [(0, start)]
        
        while pq:
            current_dist, current = heapq.heappop(pq)
            
            if current in visited:
                continue
            
            visited.add(current)
            
            if current == end:
                break
            
            for neighbor in range(n):
                if neighbor not in visited and distance_matrix[current][neighbor] > 0:
                    distance = current_dist + distance_matrix[current][neighbor]
                    
                    if distance < distances[neighbor]:
                        distances[neighbor] = distance
                        previous[neighbor] = current
                        heapq.heappush(pq, (distance, neighbor))
        
        # Reconstruct path
        path = []
        current = end
        while current != -1:
            path.append(current)
            current = previous[current]
        path.reverse()
        
        return distances[end], path