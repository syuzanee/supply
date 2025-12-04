// frontend/src/components/VehicleRouter.jsx

import { useState } from 'react';
import api from '../services/api';
import './VehicleRouter.css';

function VehicleRouter() {
  const [locations, setLocations] = useState([
    { id: 1, lat: 40.7128, lon: -74.0060, name: 'New York' },
    { id: 2, lat: 34.0522, lon: -118.2437, name: 'Los Angeles' },
    { id: 3, lat: 41.8781, lon: -87.6298, name: 'Chicago' }
  ]);
  const [newLocation, setNewLocation] = useState({ lat: '', lon: '', name: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addLocation = () => {
    if (newLocation.lat && newLocation.lon && newLocation.name) {
      setLocations([
        ...locations,
        {
          id: Date.now(),
          lat: parseFloat(newLocation.lat),
          lon: parseFloat(newLocation.lon),
          name: newLocation.name
        }
      ]);
      setNewLocation({ lat: '', lon: '', name: '' });
    }
  };

  const removeLocation = (id) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const handleOptimize = async () => {
    if (locations.length < 2) {
      setError('Please add at least 2 locations');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const routeData = {
        locations: locations.map(loc => ({
          lat: loc.lat,
          lon: loc.lon,
          name: loc.name
        }))
      };
      const optimization = await api.optimizeRouting(routeData);
      setResult(optimization);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="router-container">
      <div className="router-header">
        <h2>🗺️ Vehicle Route Optimization</h2>
        <p>Find optimal delivery routes using Traveling Salesman Problem (TSP)</p>
      </div>

      <div className="router-content">
        {/* Location Input */}
        <div className="input-section">
          <h3>Delivery Locations</h3>
          
          <div className="location-input">
            <input
              type="number"
              placeholder="Latitude"
              value={newLocation.lat}
              onChange={(e) => setNewLocation({...newLocation, lat: e.target.value})}
              step="0.0001"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={newLocation.lon}
              onChange={(e) => setNewLocation({...newLocation, lon: e.target.value})}
              step="0.0001"
            />
            <input
              type="text"
              placeholder="Location Name"
              value={newLocation.name}
              onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
            />
            <button onClick={addLocation} className="btn-add">
              ➕ Add
            </button>
          </div>

          <div className="locations-list">
            {locations.map((loc, index) => (
              <div key={loc.id} className="location-item">
                <span className="location-number">{index + 1}</span>
                <div className="location-info">
                  <strong>{loc.name}</strong>
                  <small>({loc.lat.toFixed(4)}, {loc.lon.toFixed(4)})</small>
                </div>
                <button 
                  onClick={() => removeLocation(loc.id)}
                  className="btn-remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={handleOptimize}
            disabled={loading || locations.length < 2}
            className="btn-primary"
          >
            {loading ? '⏳ Optimizing...' : '🚀 Optimize Route'}
          </button>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Calculating optimal route...</p>
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
              <h3>Optimal Route Found</h3>

              <div className="route-summary">
                <div className="summary-card">
                  <div className="summary-icon">📏</div>
                  <div className="summary-content">
                    <h4>{result.total_distance.toFixed(2)} km</h4>
                    <p>Total Distance</p>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon">📍</div>
                  <div className="summary-content">
                    <h4>{result.route_order.length}</h4>
                    <p>Stops</p>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon">🎯</div>
                  <div className="summary-content">
                    <h4>{result.algorithm}</h4>
                    <p>Algorithm</p>
                  </div>
                </div>
              </div>

              <div className="route-visualization">
                <h4>Route Order</h4>
                <div className="route-path">
                  {result.route_order.map((stop, index) => (
                    <div key={index} className="route-stop">
                      <div className="stop-marker">{index + 1}</div>
                      <div className="stop-info">
                        <strong>{stop.name}</strong>
                        <small>({stop.lat.toFixed(4)}, {stop.lon.toFixed(4)})</small>
                      </div>
                      {index < result.route_order.length - 1 && (
                        <div className="route-arrow">→</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {result.segment_distances && (
                <div className="segment-details">
                  <h4>Segment Distances</h4>
                  <div className="segments-list">
                    {result.segment_distances.map((segment, index) => (
                      <div key={index} className="segment-item">
                        <span className="segment-route">
                          {result.route_order[index].name} → {result.route_order[index + 1].name}
                        </span>
                        <span className="segment-distance">
                          {segment.toFixed(2)} km
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!result && !loading && !error && (
            <div className="empty-state">
              <div className="empty-icon">🗺️</div>
              <p>Add locations and click "Optimize Route" to find the best path</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VehicleRouter;