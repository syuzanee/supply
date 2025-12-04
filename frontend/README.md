# 🔗 Supply Chain Optimization System - Frontend

A modern, dynamic React frontend for the Supply Chain Optimization System with real-time API integration.

## ✨ Features

- **📊 Dynamic Dashboard** - Real-time statistics and quick actions
- **🏭 Supplier Predictor** - ML-powered supplier reliability prediction
- **📦 Inventory Optimizer** - EOQ, ROP, and safety stock calculations
- **🚚 Shipment Predictor** - Delivery delay probability forecasting
- **🗺️ Vehicle Router** - TSP-based route optimization
- **⚡ Batch Processor** - Parallel supplier evaluation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:8000

### Installation

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Start development server
npm run dev
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML entry point
├── src/
│   ├── components/             # React components
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── SupplierPredictor.jsx
│   │   ├── InventoryOptimizer.jsx
│   │   ├── ShipmentPredictor.jsx
│   │   ├── VehicleRouter.jsx
│   │   └── BatchProcessor.jsx
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # Global styles
│   └── main.jsx                # React entry point
├── package.json
├── vite.config.js
└── .env                        # Environment variables
```

## 🔌 API Integration

The frontend connects to your FastAPI backend through the `api.js` service layer:

```javascript
// Example API call
import api from './services/api';

const prediction = await api.predictSupplier({
  lead_time: 7,
  cost: 50,
  past_orders: 100
});
```

### Available API Methods

- `getHealth()` - Check API health
- `predictSupplier(data)` - Predict supplier reliability
- `forecastInventory(steps, confidenceLevel)` - Forecast inventory
- `predictShipment(data)` - Predict shipment delays
- `optimizeInventory(data)` - Optimize inventory parameters
- `optimizeRouting(data)` - Optimize delivery routes
- `batchEvaluateSuppliers(suppliers)` - Batch process suppliers
- `getModelsInfo()` - Get loaded models info
- `reloadModels()` - Reload ML models

## 🎨 Styling

The app uses custom CSS with modern design principles:

- **CSS Variables** for consistent theming
- **Flexbox & Grid** for responsive layouts
- **Smooth animations** for better UX
- **Mobile-first** responsive design

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

### Proxy Configuration

The Vite dev server proxies API requests to avoid CORS issues:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

## 🐛 Troubleshooting

### API Connection Issues

1. **Check backend is running**: Visit `http://localhost:8000/docs`
2. **Verify .env file**: Ensure `VITE_API_URL` is correct
3. **Check CORS**: Backend should allow frontend origin

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

## 📱 Responsive Design

The app is fully responsive:

- **Desktop**: Full grid layouts with side-by-side panels
- **Tablet**: Adjusted grid columns
- **Mobile**: Single column stacked layout

## 🎯 Key Components

### Dashboard
- System statistics
- Quick action cards
- Recent activity feed
- Model status display

### Supplier Predictor
- Interactive form with sliders
- Real-time prediction results
- Probability visualization
- Confidence metrics

### Inventory Optimizer
- Multi-parameter optimization
- Visual metric cards
- Implementation guide
- Cost analysis

### Shipment Predictor
- Delay probability calculation
- Risk level assessment
- Color-coded results
- Actionable recommendations

### Vehicle Router
- Dynamic location management
- Route visualization
- Distance calculations
- Segment-by-segment breakdown

### Batch Processor
- Multiple supplier input
- Parallel processing
- Summary statistics
- Detailed results table

## 🚦 Performance

- **Code splitting**: Components loaded on-demand
- **Optimized builds**: Minified production bundles
- **Caching**: API responses cached when appropriate
- **Lazy loading**: Images and components load progressively

## 🔐 Security

- **Environment variables**: Sensitive data in .env
- **API validation**: Input sanitization
- **HTTPS**: Use in production
- **CORS**: Properly configured backend

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [FastAPI Documentation](https://fastapi.tiangolo.com)

## 🤝 Contributing

1. Follow React best practices
2. Use consistent naming conventions
3. Add comments for complex logic
4. Test all API integrations
5. Ensure responsive design

## 📄 License

 the Supply Chain Optimization System project.

---

Built with ⚡ Vite + ⚛️ React