import { useState } from 'react';
import api from '../services/api';
import './SupplierPredictor.css';

function SupplierPredictor() {
  const [formData, setFormData] = useState({
    lead_time: 7,
    cost: 50,
    past_orders: 100
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
    setResult(null);

    try {
      const prediction = await api.predictSupplier(formData);
      setResult(prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ lead_time: 7, cost: 50, past_orders: 100 });
    setResult(null);
    setError(null);
  };

  return (
    <div className="predictor-container">
      <div className="predictor-header">
        <h2>🏭 Supplier Reliability Predictor</h2>
        <p>Uses Random Forest ML model to predict supplier reliability</p>
      </div>

      <div className="predictor-content">
        {/* Input Form */}
        <div className="input-section">
          <h3>Supplier Details</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="lead_time">
                Lead Time (days)
                <span className="tooltip">ℹ️
                  <span className="tooltip-text">Expected delivery time in days</span>
                </span>
              </label>
              <input
                type="number"
                id="lead_time"
                name="lead_time"
                value={formData.lead_time}
                onChange={handleChange}
                min="1"
                max="365"
                required
              />
              <input
                type="range"
                name="lead_time"
                value={formData.lead_time}
                onChange={handleChange}
                min="1"
                max="365"
                className="range-slider"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cost">
                Cost per Unit ($)
                <span className="tooltip">ℹ️
                  <span className="tooltip-text">Unit cost in USD</span>
                </span>
              </label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
              />
              <input
                type="range"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                min="1"
                max="500"
                step="1"
                className="range-slider"
              />
            </div>

            <div className="form-group">
              <label htmlFor="past_orders">
                Past Orders
                <span className="tooltip">ℹ️
                  <span className="tooltip-text">Historical order count</span>
                </span>
              </label>
              <input
                type="number"
                id="past_orders"
                name="past_orders"
                value={formData.past_orders}
                onChange={handleChange}
                min="0"
                required
              />
              <input
                type="range"
                name="past_orders"
                value={formData.past_orders}
                onChange={handleChange}
                min="0"
                max="1000"
                className="range-slider"
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? '⏳ Predicting...' : '🎯 Predict Reliability'}
              </button>
              <button type="button" onClick={handleReset} className="btn-secondary">
                🔄 Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analyzing supplier data...</p>
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
              <h3>Prediction Results</h3>
              
              <div className={`reliability-badge ${result.reliability === 1 ? 'reliable' : 'unreliable'}`}>
                <div className="badge-icon">
                  {result.reliability === 1 ? '✅' : '⚠️'}
                </div>
                <div className="badge-content">
                  <h4>{result.reliability_label}</h4>
                  <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div className="probability-bars">
                <div className="prob-bar">
                  <div className="prob-label">
                    <span>Reliable</span>
                    <strong>{(result.probability_reliable * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="prob-track">
                    <div 
                      className="prob-fill reliable"
                      style={{ width: `${result.probability_reliable * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="prob-bar">
                  <div className="prob-label">
                    <span>Unreliable</span>
                    <strong>{(result.probability_unreliable * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="prob-track">
                    <div 
                      className="prob-fill unreliable"
                      style={{ width: `${result.probability_unreliable * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="result-details">
                <h4>Input Parameters</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Lead Time:</span>
                    <span className="detail-value">{result.input.lead_time} days</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Cost:</span>
                    <span className="detail-value">${result.input.cost.toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Past Orders:</span>
                    <span className="detail-value">{result.input.past_orders}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Model:</span>
                    <span className="detail-value">{result.model}</span>
                  </div>
                </div>
              </div>

              <div className="recommendation">
                <h4>💡 Recommendation</h4>
                <p>
                  {result.reliability === 1
                    ? 'This supplier shows strong reliability metrics. Recommended for partnership.'
                    : 'This supplier shows potential reliability concerns. Consider additional evaluation or backup suppliers.'}
                </p>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>Enter supplier details and click "Predict Reliability" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupplierPredictor;