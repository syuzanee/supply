// frontend/src/components/BatchProcessor.jsx

import { useState } from 'react';
import api from '../services/api';
import './BatchProcessor.css';

function BatchProcessor() {
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    lead_time: 7,
    cost: 50,
    past_orders: 100
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addSupplier = () => {
    if (newSupplier.name) {
      setSuppliers([
        ...suppliers,
        {
          id: Date.now(),
          ...newSupplier,
          lead_time: parseFloat(newSupplier.lead_time),
          cost: parseFloat(newSupplier.cost),
          past_orders: parseInt(newSupplier.past_orders)
        }
      ]);
      setNewSupplier({ name: '', lead_time: 7, cost: 50, past_orders: 100 });
    }
  };

  const removeSupplier = (id) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const handleBatchProcess = async () => {
    if (suppliers.length === 0) {
      setError('Please add at least one supplier');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const suppliersData = suppliers.map(({ id, name, ...rest }) => ({
        supplier_name: name,
        ...rest
      }));
      
      const batchResults = await api.batchEvaluateSuppliers(suppliersData);
      setResults(batchResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    setSuppliers([
      { id: 1, name: 'Supplier A', lead_time: 5, cost: 45, past_orders: 150 },
      { id: 2, name: 'Supplier B', lead_time: 10, cost: 55, past_orders: 80 },
      { id: 3, name: 'Supplier C', lead_time: 7, cost: 50, past_orders: 120 },
      { id: 4, name: 'Supplier D', lead_time: 15, cost: 40, past_orders: 60 }
    ]);
  };

  return (
    <div className="batch-container">
      <div className="batch-header">
        <h2>⚡ Batch Supplier Evaluation</h2>
        <p>Evaluate multiple suppliers simultaneously using parallel processing</p>
      </div>

      <div className="batch-content">
        {/* Input Section */}
        <div className="input-section">
          <div className="section-header">
            <h3>Supplier List</h3>
            <button onClick={loadSampleData} className="btn-secondary">
              📋 Load Sample Data
            </button>
          </div>

          <div className="supplier-input">
            <input
              type="text"
              placeholder="Supplier Name"
              value={newSupplier.name}
              onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
            />
            <input
              type="number"
              placeholder="Lead Time"
              value={newSupplier.lead_time}
              onChange={(e) => setNewSupplier({...newSupplier, lead_time: e.target.value})}
              min="1"
            />
            <input
              type="number"
              placeholder="Cost"
              value={newSupplier.cost}
              onChange={(e) => setNewSupplier({...newSupplier, cost: e.target.value})}
              min="0.01"
              step="0.01"
            />
            <input
              type="number"
              placeholder="Past Orders"
              value={newSupplier.past_orders}
              onChange={(e) => setNewSupplier({...newSupplier, past_orders: e.target.value})}
              min="0"
            />
            <button onClick={addSupplier} className="btn-add">
              ➕ Add
            </button>
          </div>

          <div className="suppliers-table">
            {suppliers.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Lead Time</th>
                    <th>Cost</th>
                    <th>Past Orders</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td><strong>{supplier.name}</strong></td>
                      <td>{supplier.lead_time} days</td>
                      <td>${(supplier.cost ?? 0).toFixed(2)}</td>
                      <td>{supplier.past_orders}</td>
                      <td>
                        <button
                          onClick={() => removeSupplier(supplier.id)}
                          className="btn-remove-small"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-table">
                <p>No suppliers added yet</p>
              </div>
            )}
          </div>

          <button
            onClick={handleBatchProcess}
            disabled={loading || suppliers.length === 0}
            className="btn-primary btn-large"
          >
            {loading ? '⏳ Processing...' : '🚀 Evaluate All Suppliers'}
          </button>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Processing {suppliers.length} suppliers in parallel...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <h3>❌ Error</h3>
              <p>{error}</p>
            </div>
          )}

          {results && !loading && (
            <div className="result-card">
              <h3>Batch Processing Results</h3>

              <div className="batch-summary">
                <div className="summary-stat">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <h4>{results.total_evaluated}</h4>
                    <p>Total Evaluated</p>
                  </div>
                </div>

                <div className="summary-stat success">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <h4>{results.reliable_count}</h4>
                    <p>Reliable</p>
                  </div>
                </div>

                <div className="summary-stat warning">
                  <div className="stat-icon">⚠️</div>
                  <div className="stat-info">
                    <h4>{results.unreliable_count}</h4>
                    <p>Unreliable</p>
                  </div>
                </div>

                <div className="summary-stat">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-info">
                    <h4>{(results.processing_time_seconds ?? 0).toFixed(2)}s</h4>
                    <p>Processing Time</p>
                  </div>
                </div>
              </div>

              <div className="results-table">
                <h4>Detailed Results</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Supplier</th>
                      <th>Status</th>
                      <th>Confidence</th>
                      <th>Reliable Prob.</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((result, index) => (
                      <tr key={index} className={result.reliability === 1 ? 'reliable-row' : 'unreliable-row'}>
                        <td><strong>{result.supplier_name}</strong></td>
                        <td>
                          <span className={`status-badge ${result.reliability === 1 ? 'reliable' : 'unreliable'}`}>
                            {result.reliability_label}
                          </span>
                        </td>
                        <td>{((result.confidence ?? 0) * 100).toFixed(1)}%</td>
                        <td>{((result.probability_reliable ?? 0) * 100).toFixed(1)}%</td>
                        <td>
                          <small>
                            LT: {result.input.lead_time}d | 
                            Cost: ${result.input.cost} | 
                            Orders: {result.input.past_orders}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="recommendation">
                <h4>📌 Recommendations</h4>
                <div className="recommendation-grid">
                  <div className="rec-card">
                    <h5>✅ Recommended Suppliers</h5>
                    <ul>
                      {results.results
                        .filter(r => r.reliability === 1)
                        .map((r, i) => (
                          <li key={i}>{r.supplier_name}</li>
                        ))}
                    </ul>
                  </div>
                  <div className="rec-card warning">
                    <h5>⚠️ Requires Review</h5>
                    <ul>
                      {results.results
                        .filter(r => r.reliability === 0)
                        .map((r, i) => (
                          <li key={i}>{r.supplier_name}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!results && !loading && !error && (
            <div className="empty-state">
              <div className="empty-icon">⚡</div>
              <p>Add suppliers and click "Evaluate All Suppliers" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BatchProcessor;