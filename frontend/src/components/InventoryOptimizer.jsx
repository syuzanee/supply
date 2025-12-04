import { useState } from 'react';
import api from '../services/api';
import './InventoryOptimizer.css';

function InventoryOptimizer() {
  const [formData, setFormData] = useState({
    annual_demand: 10000,
    unit_cost: 25,
    demand_std: 500,
    lead_time_days: 7
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const optimization = await api.optimizeInventory(formData);
      setResult(optimization);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="optimizer-container">
      <div className="optimizer-header">
        <h2>📦 Inventory Optimization</h2>
        <p>Calculate EOQ, Reorder Point, and Safety Stock using statistical models</p>
      </div>

      <div className="optimizer-content">
        {/* Input Form */}
        <div className="input-section">
          <h3>Inventory Parameters</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Annual Demand (units)</label>
              <input
                type="number"
                name="annual_demand"
                value={formData.annual_demand}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Unit Cost ($)</label>
              <input
                type="number"
                name="unit_cost"
                value={formData.unit_cost}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Demand Std Deviation</label>
              <input
                type="number"
                name="demand_std"
                value={formData.demand_std}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Lead Time (days)</label>
              <input
                type="number"
                name="lead_time_days"
                value={formData.lead_time_days}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? '⏳ Optimizing...' : '⚡ Optimize Inventory'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {loading && <div className="spinner"></div>}
          {error && <div className="error-state">{error}</div>}

          {result && !loading && (
            <div className="result-card">
              <h3>Optimization Results</h3>
              
              <div className="metrics-grid">
                <div className="metric-card primary">
                  <div className="metric-icon">📊</div>
                  <div className="metric-content">
                    <h4>{result.economic_order_quantity.toLocaleString()}</h4>
                    <p>Economic Order Quantity</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">🔔</div>
                  <div className="metric-content">
                    <h4>{result.reorder_point.toLocaleString()}</h4>
                    <p>Reorder Point</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">🛡️</div>
                  <div className="metric-content">
                    <h4>{result.safety_stock.toLocaleString()}</h4>
                    <p>Safety Stock</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">💰</div>
                  <div className="metric-content">
                    <h4>${result.total_annual_cost.toLocaleString()}</h4>
                    <p>Total Annual Cost</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">📦</div>
                  <div className="metric-content">
                    <h4>{result.average_inventory.toLocaleString()}</h4>
                    <p>Average Inventory</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">📋</div>
                  <div className="metric-content">
                    <h4>{result.number_of_orders}</h4>
                    <p>Orders per Year</p>
                  </div>
                </div>
              </div>

              <div className="recommendation">
                <h4>📌 Implementation Guide</h4>
                <ul>
                  <li>Order <strong>{result.economic_order_quantity}</strong> units each time</li>
                  <li>Place new order when inventory reaches <strong>{result.reorder_point}</strong> units</li>
                  <li>Maintain safety stock of <strong>{result.safety_stock}</strong> units</li>
                  <li>Expected to place <strong>{result.number_of_orders}</strong> orders annually</li>
                  <li>Service level: <strong>{(result.service_level * 100).toFixed(0)}%</strong></li>
                </ul>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <p>Enter inventory parameters to calculate optimal policy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InventoryOptimizer;