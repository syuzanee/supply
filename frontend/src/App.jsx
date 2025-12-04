import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import SupplierPredictor from './components/SupplierPredictor';
import InventoryOptimizer from './components/InventoryOptimizer';
import ShipmentPredictor from './components/ShipmentPredictor';
import VehicleRouter from './components/VehicleRouter';
import BatchProcessor from './components/BatchProcessor';
import api from './services/api';
import './App.css';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-state">
          <h2>⚠️ Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            🔄 Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState({ status: 'checking', models: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAPIHealth();
  }, []);

  const checkAPIHealth = async () => {
    try {
      const health = await api.getDetailedHealth();
      setApiStatus({
        status: 'online',
        models: health.models.loaded_models || [],
        config: health.config || {}
      });
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus({ status: 'offline', models: [] });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', component: Dashboard },
    { id: 'supplier', label: '🏭 Supplier Predictor', component: SupplierPredictor },
    { id: 'inventory', label: '📦 Inventory Optimizer', component: InventoryOptimizer },
    { id: 'shipment', label: '🚚 Shipment Predictor', component: ShipmentPredictor },
    { id: 'routing', label: '🗺️ Vehicle Routing', component: VehicleRouter },
    { id: 'batch', label: '⚡ Batch Processing', component: BatchProcessor },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Connecting to API...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🔗 Supply Chain Optimization System</h1>
          <div className="api-status">
            <span className={`status-indicator ${apiStatus.status}`}></span>
            <span>{apiStatus.status === 'online' ? 'Connected' : 'Offline'}</span>
            {apiStatus.status === 'online' && (
              <span className="model-count">
                {apiStatus.models.length} models loaded
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {apiStatus.status === 'offline' ? (
          <div className="error-state">
            <h2>⚠️ API Offline</h2>
            <p>Cannot connect to backend API at {api.baseURL}</p>
            <button onClick={checkAPIHealth} className="retry-button">
              🔄 Retry Connection
            </button>
          </div>
        ) : (
          <ErrorBoundary>
            <ActiveComponent apiStatus={apiStatus} />
          </ErrorBoundary>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Supply Chain Optimization v2.0 | Integrates: AI, Graph Theory, Statistics, Parallel Programming</p>
      </footer>
    </div>
  );
}

export default App;