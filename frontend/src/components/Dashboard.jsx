import { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

function Dashboard({ apiStatus }) {
  const [stats, setStats] = useState({
    totalPredictions: 0,
    avgAccuracy: 0,
    optimizationsRun: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Simulate loading recent activity
    // In production, this would fetch from backend
    setRecentActivity([
      { id: 1, type: 'Supplier Prediction', time: '2 min ago', status: 'success' },
      { id: 2, type: 'Inventory Optimization', time: '5 min ago', status: 'success' },
      { id: 3, type: 'Route Optimization', time: '10 min ago', status: 'success' },
    ]);

    setStats({
      totalPredictions: 1247,
      avgAccuracy: 94.5,
      optimizationsRun: 328,
    });
  };

  const quickActions = [
    {
      title: 'Predict Supplier Reliability',
      icon: '🏭',
      description: 'Evaluate supplier reliability using ML',
      action: 'supplier'
    },
    {
      title: 'Optimize Inventory',
      icon: '📦',
      description: 'Calculate EOQ, ROP, and safety stock',
      action: 'inventory'
    },
    {
      title: 'Predict Shipment Delays',
      icon: '🚚',
      description: 'Forecast potential delivery delays',
      action: 'shipment'
    },
    {
      title: 'Optimize Vehicle Routes',
      icon: '🗺️',
      description: 'Find optimal delivery routes',
      action: 'routing'
    }
  ];

  return (
    <div className="dashboard">
      <h2>Dashboard Overview</h2>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{stats.totalPredictions.toLocaleString()}</h3>
            <p>Total Predictions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{stats.avgAccuracy}%</h3>
            <p>Average Accuracy</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>{stats.optimizationsRun}</h3>
            <p>Optimizations Run</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-content">
            <h3>{apiStatus.models?.length || 0}</h3>
            <p>Models Loaded</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div key={index} className="action-card">
              <div className="action-icon">{action.icon}</div>
              <h4>{action.title}</h4>
              <p>{action.description}</p>
              <button className="action-button">Get Started →</button>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className={`activity-status ${activity.status}`}></div>
              <div className="activity-content">
                <strong>{activity.type}</strong>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Model Status */}
      <section className="model-status">
        <h3>Loaded Models</h3>
        <div className="models-list">
          {apiStatus.models?.map((model, index) => (
            <div key={index} className="model-badge">
              <span className="model-indicator">✓</span>
              {model}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;