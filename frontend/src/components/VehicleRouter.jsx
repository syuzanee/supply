import { useState } from 'react';
import api from '../services/api';
import './VehicleRouter.css';

function VehicleRouter() {
  const [depot, setDepot] = useState({ lat: 40.7128, lon: -74.0060, name: 'Warehouse' });
  const [customers, setCustomers] = useState([
    { lat: 40.7589, lon: -73.9851, demand: 100, name: 'Customer 1' },
    { lat: 40.7614, lon: -73.9776, demand: 150, name: 'Customer 2' },
    { lat: 40.7489, lon: -73.9680, demand: 200, name: 'Customer 3' }
  ]);
  const [newCustomer, setNewCustomer] = useState({
    lat: '',
    lon: '',
    demand: '',
    name: ''
  });
  const [algorithm, setAlgorithm] = useState('clarke_wright');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOptimize = async () => {
    if (customers.length === 0) {
      setError('Please add at least one customer location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format data correctly for the API
      const data = {
        depot: {
          lat: parseFloat(depot.lat),
          lon: parseFloat(depot.lon),
          name: depot.name
        },
        customers: customers.map(c => ({
          lat: parseFloat(c.lat),
          lon: parseFloat(c.lon),
          demand: parseFloat(c.demand),
          name: c.name
        })),
        algorithm: algorithm
      };

      console.log('Sending routing data:', data);
      
      const optimization = await api.optimizeRouting(data);
      setResult(optimization);
    } catch (err) {
      console.error('Routing error:', err);
      setError(err.message || 'Failed to optimize routes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    if (!newCustomer.lat || !newCustomer.lon || !newCustomer.demand || !newCustomer.name) {
      alert('Please fill all customer fields');
      return;
    }

    setCustomers([...customers, {
      lat: parseFloat(newCustomer.lat),
      lon: parseFloat(newCustomer.lon),
      demand: parseFloat(newCustomer.demand),
      name: newCustomer.name
    }]);

    // Reset form
    setNewCustomer({ lat: '', lon: '', demand: '', name: '' });
  };

  const handleRemoveCustomer = (index) => {
    setCustomers(customers.filter((_, i) => i !== index));
    setResult(null); // Clear results when removing customers
  };

  const handleDepotChange = (field, value) => {
    setDepot({ ...depot, [field]: value });
    setResult(null); // Clear results when changing depot
  };

  const handleNewCustomerChange = (field, value) => {
    setNewCustomer({ ...newCustomer, [field]: value });
  };

  return (
    <div className="router-container">
      <div className="router-header">
        <h2>🗺️ Vehicle Routing Optimizer</h2>
        <p>Optimize delivery routes using Graph Theory algorithms (Clarke-Wright or Nearest Neighbor)</p>
      </div>

      <div className="router-content">
        {/* Input Section */}
        <div className="input-section">
          <h3>Route Configuration</h3>
          
          {/* Algorithm Selector */}
          <div className="form-group">
            <label>Algorithm:</label>
            <select 
              value={algorithm} 
              onChange={(e) => setAlgorithm(e.target.value)}
              className="algorithm-select"
            >
              <option value="clarke_wright">Clarke-Wright Savings</option>
              <option value="nearest_neighbor">Nearest Neighbor</option>
            </select>
          </div>

          {/* Depot Configuration */}
          <div className="depot-section">
            <h4>📍 Depot Location</h4>
            <div className="depot-inputs">
              <input
                type="text"
                placeholder="Name"
                value={depot.name}
                onChange={(e) => handleDepotChange('name', e.target.value)}
              />
              <input
                type="number"
                placeholder="Latitude"
                value={depot.lat}
                onChange={(e) => handleDepotChange('lat', e.target.value)}
                step="0.0001"
              />
              <input
                type="number"
                placeholder="Longitude"
                value={depot.lon}
                onChange={(e) => handleDepotChange('lon', e.target.value)}
                step="0.0001"
              />
            </div>
          </div>

          {/* Add Customer */}
          <div className="customer-section">
            <h4>➕ Add Customer</h4>
            <div className="customer-inputs">
              <input
                type="text"
                placeholder="Name"
                value={newCustomer.name}
                onChange={(e) => handleNewCustomerChange('name', e.target.value)}
              />
              <input
                type="number"
                placeholder="Latitude"
                value={newCustomer.lat}
                onChange={(e) => handleNewCustomerChange('lat', e.target.value)}
                step="0.0001"
              />
              <input
                type="number"
                placeholder="Longitude"
                value={newCustomer.lon}
                onChange={(e) => handleNewCustomerChange('lon', e.target.value)}
                step="0.0001"
              />
              <input
                type="number"
                placeholder="Demand"
                value={newCustomer.demand}
                onChange={(e) => handleNewCustomerChange('demand', e.target.value)}
              />
              <button onClick={handleAddCustomer} className="btn-add">
                Add
              </button>
            </div>
          </div>

          {/* Customers List */}
          <div className="customers-list">
            <h4>📦 Customers ({customers.length})</h4>
            {customers.length === 0 ? (
              <p className="empty-message">No customers added yet</p>
            ) : (
              <div className="locations-list">
                {customers.map((customer, index) => (
                  <div key={index} className="location-item">
                    <div className="location-number">{index + 1}</div>
                    <div className="location-info">
                      <strong>{customer.name}</strong>
                      <small>
                        Lat: {customer.lat.toFixed(4)}, Lon: {customer.lon.toFixed(4)} | 
                        Demand: {customer.demand}
                      </small>
                    </div>
                    <button 
                      onClick={() => handleRemoveCustomer(index)}
                      className="btn-remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optimize Button */}
          <button 
            onClick={handleOptimize} 
            disabled={loading || customers.length === 0}
            className="btn-primary"
          >
            {loading ? '⏳ Optimizing...' : '🚀 Optimize Routes'}
          </button>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Calculating optimal routes...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <h3>❌ Error</h3>
              <p>{error}</p>
            </div>
          )}

          {result && !loading && (
            <div className="result-card">
              <h3>Optimization Results</h3>
              
              {/* Summary Statistics */}
              <div className="route-summary">
                <div className="summary-card">
                  <div className="summary-icon">🚚</div>
                  <div className="summary-content">
                    <h4>{result.statistics?.num_vehicles || 0}</h4>
                    <p>Vehicles Needed</p>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon">📏</div>
                  <div className="summary-content">
                    <h4>{result.statistics?.total_distance?.toFixed(2) || 0} km</h4>
                    <p>Total Distance</p>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon">📊</div>
                  <div className="summary-content">
                    <h4>{result.statistics?.avg_distance_per_route?.toFixed(2) || 0} km</h4>
                    <p>Avg per Route</p>
                  </div>
                </div>
              </div>

              {/* Routes Visualization */}
              {result.routes && result.routes.length > 0 && (
                <div className="routes-container">
                  <h4>🗺️ Optimized Routes</h4>
                  {result.routes.map((route, routeIndex) => (
                    <div key={routeIndex} className="route-card">
                      <div className="route-header">
                        <h5>Vehicle {route.vehicle_id + 1}</h5>
                        <div className="route-stats">
                          <span className="stat-badge">
                            📏 {route.total_distance?.toFixed(2) || 0} km
                          </span>
                          <span className="stat-badge">
                            📦 {route.total_demand?.toFixed(0) || 0} units
                          </span>
                        </div>
                      </div>

                      <div className="route-path">
                        {route.locations && route.locations.map((location, locIndex) => (
                          <div key={locIndex}>
                            <div className="route-stop">
                              <div className="stop-marker">
                                {locIndex === 0 || locIndex === route.locations.length - 1 
                                  ? '🏭' 
                                  : locIndex
                                }
                              </div>
                              <div className="stop-info">
                                <strong>{location.name}</strong>
                                <small>
                                  Lat: {location.lat?.toFixed(4)}, Lon: {location.lon?.toFixed(4)}
                                </small>
                              </div>
                            </div>
                            {locIndex < route.locations.length - 1 && (
                              <div className="route-arrow">↓</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Algorithm Info */}
              <div className="algorithm-info">
                <h4>ℹ️ Algorithm Used</h4>
                <p>
                  <strong>{result.algorithm === 'clarke_wright' ? 'Clarke-Wright Savings' : 'Nearest Neighbor'}</strong>
                  {result.algorithm === 'clarke_wright' 
                    ? ' - A greedy algorithm that merges routes based on savings in distance'
                    : ' - A constructive heuristic that builds routes by adding nearest unvisited customers'
                  }
                </p>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="empty-state">
              <div className="empty-icon">🗺️</div>
              <p>Add customers and click "Optimize Routes" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VehicleRouter;