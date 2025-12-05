import { useState } from 'react';
import api from '../services/api';
import './ShipmentPredictor.css';

function ShipmentPredictor() {
  const [formData, setFormData] = useState({
    delivery_time: 10,
    quantity: 500,
    delay_time: 2
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const prediction = await api.predictShipment(formData);
      setResult(prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      'Low': '#10b981',
      'Medium': '#f59e0b',
      'High': '#ef4444'
    };
    return colors[riskLevel] || '#6b7280';
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('on time')) return 'on-time';
    if (statusLower.includes('delay')) return 'likely-delay';
    return 'high-risk';
  };

  return (
    <div className="predictor-container">
      <div className="predictor-header">
        <h2>🚚 Shipment Delay Predictor</h2>
        <p>Predict shipment delay probability using Logistic Regression</p>
      </div>

      <div className="predictor-content">
        <div className="input-section">
          <h3>Shipment Details</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Expected Delivery Time (days)</label>
              <input
                type="number"
                name="delivery_time"
                value={formData.delivery_time}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Quantity (units)</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Historical Delay Time (days)</label>
              <input
                type="number"
                name="delay_time"
                value={formData.delay_time}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? '⏳ Predicting...' : '🎯 Predict Delay'}
            </button>
          </form>
        </div>

        <div className="results-section">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analyzing shipment data...</p>
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
              
              <div className={`status-badge ${getStatusClass(result.status)}`}>
                <div className="badge-icon">
                  {result.will_delay ? '⚠️' : '✅'}
                </div>
                <div className="badge-content">
                  <h4>{result.status || 'Status Unknown'}</h4>
                  <p style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                    Risk Level: {result.risk_level || 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="probability-section">
                <h4>Delay Probability</h4>
                <div className="probability-bar">
                  <div 
                    className="probability-fill"
                    style={{ 
                      width: `${(result.delay_probability || 0) * 100}%`,
                      backgroundColor: getRiskColor(result.risk_level)
                    }}
                  >
                    <span className="probability-text">
                      {((result.delay_probability || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="result-details">
                <h4>Shipment Details</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Expected Delivery:</span>
                    <span className="detail-value">
                      {result.input?.delivery_time || formData.delivery_time} days
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Quantity:</span>
                    <span className="detail-value">
                      {result.input?.quantity || formData.quantity} units
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Historical Delay:</span>
                    <span className="detail-value">
                      {result.input?.delay_time || formData.delay_time} days
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Model:</span>
                    <span className="detail-value">{result.model || 'Logistic Regression'}</span>
                  </div>
                </div>
              </div>

              <div className="recommendation">
                <h4>💡 Recommendations</h4>
                {result.recommendations && result.recommendations.length > 0 ? (
                  result.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <span className="rec-icon">•</span>
                      <span>{rec}</span>
                    </div>
                  ))
                ) : (
                  <div className="recommendation-item">
                    <span className="rec-icon">•</span>
                    <span>
                      {result.will_delay 
                        ? 'Consider expedited shipping options or contact the supplier for updates.'
                        : 'Shipment is expected to arrive on time. Continue monitoring.'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="empty-state">
              <div className="empty-icon">🚚</div>
              <p>Enter shipment details to predict delay probability</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShipmentPredictor;