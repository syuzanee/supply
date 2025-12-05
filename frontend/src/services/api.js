/**
 * API Service Layer
 * Integrates: Computer Networks - RESTful API communication
 * Fixed: Handles 422 errors, undefined responses, safe JSON parsing, and validates all data structures
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
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          data = text ? JSON.parse(text) : {};
        } else {
          // If not JSON, try to read as text
          const text = await response.text();
          data = { message: text };
        }
      } catch (e) {
        console.warn('Failed to parse response:', e);
        data = { message: 'Invalid response format' };
      }

      // If response is not ok, throw detailed error
      if (!response.ok) {
        let errorMsg = data.detail || data.message || `HTTP ${response.status}: Request failed`;
        
        // Handle validation errors (422)
        if (response.status === 422 && data.detail) {
          if (Array.isArray(data.detail)) {
            errorMsg = data.detail.map(err => `${err.loc?.join('.') || 'field'}: ${err.msg}`).join(', ');
          }
        }
        
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      
      // Enhance error message for network errors
      if (error.message === 'Failed to fetch') {
        error.message = `Cannot connect to backend at ${this.baseURL}. Is the server running?`;
      }
      
      throw error;
    }
  }

  // Health Check
  async getHealth() {
    try {
      return await this.request('/');
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  async getDetailedHealth() {
    try {
      return await this.request('/health');
    } catch (error) {
      throw new Error(`Detailed health check failed: ${error.message}`);
    }
  }

  // Prediction APIs
  async predictSupplier(data) {
    try {
      const result = await this.request('/api/v1/predict/supplier', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Validate and provide defaults
      return {
        reliability_score: result.reliability_score ?? 0,
        confidence_interval: result.confidence_interval || { lower: 0, upper: 0 },
        feature_importance: result.feature_importance || {},
        model: result.model || 'LinearRegression',
        r2_score: result.r2_score ?? null,
        prediction_time: result.prediction_time || '<1ms',
        ...result
      };
    } catch (error) {
      throw new Error(`Supplier prediction failed: ${error.message}`);
    }
  }

  async forecastInventory(steps = 5, confidenceLevel = 0.95) {
    try {
      const result = await this.request(
        `/api/v1/predict/inventory?steps=${steps}&confidence_level=${confidenceLevel}`
      );

      // Validate response structure
      return {
        forecast: Array.isArray(result.forecast) ? result.forecast : [],
        confidence_intervals: result.confidence_intervals || [],
        metrics: result.metrics || {},
        model: result.model || 'ARIMA',
        steps: result.steps || steps,
        ...result
      };
    } catch (error) {
      throw new Error(`Inventory forecast failed: ${error.message}`);
    }
  }

  async predictShipment(data) {
    try {
      const result = await this.request('/api/v1/predict/shipment', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Validate and provide safe defaults
      return {
        delayed: result.delayed ?? null,
        status: result.status || 'Unknown',
        confidence: result.confidence ?? 0,
        probability_delayed: result.probability_delayed ?? 0,
        probability_ontime: result.probability_ontime ?? 0,
        risk_level: result.risk_level || 'Unknown',
        feature_importance: result.feature_importance || {},
        input: result.input || data,
        model: result.model || 'LogisticRegression',
        ...result
      };
    } catch (error) {
      throw new Error(`Shipment prediction failed: ${error.message}`);
    }
  }

  // Optimization APIs
  async optimizeInventory(data) {
    try {
      const result = await this.request('/api/v1/optimize/inventory', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return {
        optimal_order_quantity: result.optimal_order_quantity ?? 0,
        reorder_point: result.reorder_point ?? 0,
        total_cost: result.total_cost ?? 0,
        cost_breakdown: result.cost_breakdown || {},
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
        safety_stock: result.safety_stock ?? 0,
        ...result
      };
    } catch (error) {
      throw new Error(`Inventory optimization failed: ${error.message}`);
    }
  }

  async optimizeRouting(data) {
    try {
      // Ensure payload has proper structure
      let fixedData = { ...data };

      // Fix locations format if needed
      if (data.locations && Array.isArray(data.locations)) {
        fixedData.locations = data.locations.map(loc => {
          if (Array.isArray(loc)) {
            return { lat: loc[0], lon: loc[1] };
          }
          return loc;
        });
      }

      // Ensure customers array exists and is properly formatted
      if (data.customers && Array.isArray(data.customers)) {
        fixedData.customers = data.customers.map((customer, idx) => ({
          lat: parseFloat(customer.lat),
          lon: parseFloat(customer.lon),
          demand: parseFloat(customer.demand || 0),
          name: customer.name || `Customer ${idx + 1}`
        }));
      }

      // Ensure depot is properly formatted
      if (data.depot) {
        fixedData.depot = {
          lat: parseFloat(data.depot.lat),
          lon: parseFloat(data.depot.lon),
          name: data.depot.name || 'Depot'
        };
      }

      console.log('Sending routing request:', fixedData);

      const result = await this.request('/api/v1/optimize/routing', {
        method: 'POST',
        body: JSON.stringify(fixedData),
      });

      console.log('Received routing response:', result);

      // CRITICAL: Validate routes array
      if (!result.routes || !Array.isArray(result.routes)) {
        console.warn('Routes not in expected format, creating empty array');
        result.routes = [];
      }

      // Validate each route has proper structure
      const validatedRoutes = result.routes.map((route, index) => {
        // Ensure locations is an array
        let locations = [];
        if (route.locations && Array.isArray(route.locations)) {
          locations = route.locations.map(loc => ({
            lat: loc.lat ?? 0,
            lon: loc.lon ?? 0,
            name: loc.name || 'Location',
            demand: loc.demand ?? 0
          }));
        }

        return {
          vehicle_id: route.vehicle_id ?? index,
          locations: locations,
          total_distance: route.total_distance ?? 0,
          total_demand: route.total_demand ?? 0,
          ...route
        };
      });

      return {
        routes: validatedRoutes,
        statistics: {
          num_vehicles: result.statistics?.num_vehicles ?? validatedRoutes.length,
          total_distance: result.statistics?.total_distance ?? 0,
          avg_distance_per_route: result.statistics?.avg_distance_per_route ?? 0,
          ...result.statistics
        },
        algorithm: result.algorithm || data.algorithm || 'clarke_wright',
        optimization_time: result.optimization_time || '<1ms',
        ...result
      };
    } catch (error) {
      // Provide specific error for map issues
      if (error.message && error.message.includes('map')) {
        throw new Error('Server returned invalid route data. Please check backend response format.');
      }
      throw new Error(`Route optimization failed: ${error.message}`);
    }
  }

  // Batch Processing
  async batchEvaluateSuppliers(suppliers) {
    try {
      // Validate suppliers array
      if (!Array.isArray(suppliers)) {
        throw new Error('Suppliers must be an array');
      }

      const result = await this.request('/api/v1/batch/suppliers', {
        method: 'POST',
        body: JSON.stringify(suppliers),
      });

      // Ensure results is an array
      return {
        results: Array.isArray(result.results) ? result.results : [],
        total: result.total ?? suppliers.length,
        successful: result.successful ?? 0,
        failed: result.failed ?? 0,
        ...result
      };
    } catch (error) {
      throw new Error(`Batch supplier evaluation failed: ${error.message}`);
    }
  }

  // Model Info
  async getModelsInfo() {
    try {
      const result = await this.request('/api/v1/models/info');
      
      return {
        models: result.models || {},
        total_models: result.total_models ?? 0,
        status: result.status || 'unknown',
        ...result
      };
    } catch (error) {
      throw new Error(`Failed to get models info: ${error.message}`);
    }
  }

  async reloadModels() {
    try {
      const result = await this.request('/api/v1/models/reload', {
        method: 'POST',
      });

      return {
        status: result.status || 'unknown',
        message: result.message || 'Models reloaded',
        reloaded: result.reloaded || [],
        ...result
      };
    } catch (error) {
      throw new Error(`Failed to reload models: ${error.message}`);
    }
  }
}

export default new APIService();