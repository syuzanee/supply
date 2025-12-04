/**
 * API Service Layer
 * Integrates: Computer Networks - RESTful API communication
 * Fixed: Handles 422 errors, undefined responses, and safe JSON parsing
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

      // Try to parse JSON if possible
      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        data = {};
      }

      // If response is not ok, throw detailed error
      if (!response.ok) {
        let errorMsg = data.detail || data.message || 'API request failed';
        throw { status: response.status, ...data, message: errorMsg };
      }

      return data;
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
    // Ensure payload is objects with lat/lon, not array of arrays
    const fixedData = {
      ...data,
      locations: data.locations.map(loc => {
        if (Array.isArray(loc)) {
          return { lat: loc[0], lon: loc[1] };
        }
        return loc;
      }),
    };

    return this.request('/api/v1/optimize/routing', {
      method: 'POST',
      body: JSON.stringify(fixedData),
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
