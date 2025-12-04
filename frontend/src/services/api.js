/**
 * API Service Layer
 * Integrates: Computer Networks - RESTful API communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'API request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Health Check
  async getHealth() {
    return this.request('/');
  }

  async getDetailedHealth() {
    return this.request('/health');
  }

  // Prediction APIs
  async predictSupplier(data) {
    return this.request('/api/v1/predict/supplier', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forecastInventory(steps = 5, confidenceLevel = 0.95) {
    return this.request(
      `/api/v1/predict/inventory?steps=${steps}&confidence_level=${confidenceLevel}`
    );
  }

  async predictShipment(data) {
    return this.request('/api/v1/predict/shipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Optimization APIs
  async optimizeInventory(data) {
    return this.request('/api/v1/optimize/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async optimizeRouting(data) {
    return this.request('/api/v1/optimize/routing', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Batch Processing
  async batchEvaluateSuppliers(suppliers) {
    return this.request('/api/v1/batch/suppliers', {
      method: 'POST',
      body: JSON.stringify(suppliers),
    });
  }

  // Model Info
  async getModelsInfo() {
    return this.request('/api/v1/models/info');
  }

  async reloadModels() {
    return this.request('/api/v1/models/reload', {
      method: 'POST',
    });
  }
}

export default new APIService();