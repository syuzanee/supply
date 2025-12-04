"""
Parallel Processing for Optimization
Integrates:
- Parallel Programming: Multi-threading, multi-processing
- Systems Programming: Resource management, synchronization
"""

import numpy as np
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
from typing import List, Dict, Any, Callable, Optional
import multiprocessing as mp
from functools import partial
import time

from src.core.logger import get_logger
from src.core.config import settings

logger = get_logger(__name__)


class ParallelOptimizer:
    """
    Parallel optimization framework
    
    Integrates:
    - Parallel Programming: Thread and process pools
    - Systems Programming: Resource management
    """
    
    def __init__(
        self,
        max_workers: Optional[int] = None,
        use_processes: bool = False
    ):
        """
        Initialize parallel optimizer.
        
        Args:
            max_workers: Maximum number of workers (None = CPU count)
            use_processes: Use processes instead of threads
        """
        self.max_workers = max_workers or mp.cpu_count()
        self.use_processes = use_processes
        self.logger = logger
        
        self.logger.info(
            f"Parallel optimizer initialized: {self.max_workers} workers "
            f"({'processes' if use_processes else 'threads'})"
        )
    
    def parallel_map(
        self,
        func: Callable,
        items: List[Any],
        chunk_size: Optional[int] = None
    ) -> List[Any]:
        """
        Parallel map operation.
        
        Integrates: Parallel Programming - Data parallelism
        """
        if not items:
            return []
        
        start_time = time.time()
        
        executor_class = ProcessPoolExecutor if self.use_processes else ThreadPoolExecutor
        
        with executor_class(max_workers=self.max_workers) as executor:
            if chunk_size:
                results = list(executor.map(func, items, chunksize=chunk_size))
            else:
                results = list(executor.map(func, items))
        
        elapsed = time.time() - start_time
        
        self.logger.info(
            f"Parallel map completed: {len(items)} items in {elapsed:.2f}s "
            f"({len(items)/elapsed:.1f} items/s)"
        )
        
        return results
    
    def parallel_batch_optimize(
        self,
        optimize_func: Callable,
        batches: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Optimize multiple batches in parallel.
        
        Integrates: Parallel Programming - Task parallelism
        """
        start_time = time.time()
        results = []
        
        executor_class = ProcessPoolExecutor if self.use_processes else ThreadPoolExecutor
        
        with executor_class(max_workers=self.max_workers) as executor:
            # Submit all tasks
            future_to_batch = {
                executor.submit(optimize_func, batch): i
                for i, batch in enumerate(batches)
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_batch):
                batch_idx = future_to_batch[future]
                try:
                    result = future.result()
                    results.append({
                        'batch_id': batch_idx,
                        'result': result,
                        'status': 'success'
                    })
                except Exception as e:
                    self.logger.error(f"Batch {batch_idx} failed: {e}")
                    results.append({
                        'batch_id': batch_idx,
                        'error': str(e),
                        'status': 'failed'
                    })
        
        # Sort by batch_id
        results.sort(key=lambda x: x['batch_id'])
        
        elapsed = time.time() - start_time
        successful = sum(1 for r in results if r['status'] == 'success')
        
        self.logger.info(
            f"Batch optimization: {successful}/{len(batches)} succeeded "
            f"in {elapsed:.2f}s"
        )
        
        return results
    
    def parallel_supplier_evaluation(
        self,
        suppliers: List[Dict[str, Any]],
        evaluation_func: Callable
    ) -> List[Dict[str, Any]]:
        """
        Evaluate multiple suppliers in parallel.
        
        Example use case for prediction service.
        """
        self.logger.info(f"Evaluating {len(suppliers)} suppliers in parallel...")
        
        return self.parallel_map(evaluation_func, suppliers)
    
    def parallel_monte_carlo_simulation(
        self,
        simulation_func: Callable,
        num_simulations: int,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Run Monte Carlo simulations in parallel.
        
        Integrates:
        - Parallel Programming: Embarrassingly parallel computation
        - Probability & Statistics: Monte Carlo methods
        """
        self.logger.info(f"Running {num_simulations} Monte Carlo simulations...")
        
        # Create simulation parameters for each run
        sim_params = [
            {**params, 'run_id': i, 'seed': i}
            for i in range(num_simulations)
        ]
        
        # Run simulations in parallel
        results = self.parallel_map(simulation_func, sim_params)
        
        # Aggregate results
        if not results:
            return {}
        
        # Extract metrics from each simulation
        # Extract metrics from each simulation
        metrics = {}
        for key in results[0].keys():
            if isinstance(results[0][key], (int, float)):
                values = [r[key] for r in results]
                metrics[key] = {
                    'mean': float(np.mean(values)),
                    'std': float(np.std(values)),
                    'min': float(np.min(values)),
                    'max': float(np.max(values))
                }

        return {
            'simulations': num_simulations,
            'metrics': metrics
        }
