# 🔗 Complete Integration Guide

## Overview

This guide will help you integrate the dynamic React frontend with your FastAPI backend to create a fully functional Supply Chain Optimization System.

## 📋 Prerequisites

### Backend Requirements
- Python 3.8+
- FastAPI backend running
- Models trained and loaded
- CORS configured

### Frontend Requirements
- Node.js 18+
- npm 9+

## 🚀 Step-by-Step Setup

### Step 1: Verify Backend

First, ensure your backend is running properly:

```bash
# Navigate to backend directory
cd backend

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test in browser
# Visit: http://localhost:8000/docs
```

**Expected Response:**
- Swagger UI should load
- `/health` endpoint should return status "online"
- Models should be loaded

### Step 2: Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Make setup script executable (Linux/Mac)
chmod +x setup.sh

# Run setup script
./setup.sh

# Or manually install:
npm install
```

### Step 3: Configure Environment

Create `.env` file in frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

### Step 4: Start Frontend

```bash
npm run dev
```

The application should open at `http://localhost:3000`

### Step 5: Verify Integration

1. **Check API Status** in header (should show "Connected")
2. **Test Supplier Predictor:**
   - Enter: Lead Time=7, Cost=50, Past Orders=100
   - Click "Predict Reliability"
   - Should see results immediately

3. **Test Inventory Optimizer:**
   - Enter inventory parameters
   - Click "Optimize Inventory"
   - Should see EOQ, ROP, Safety Stock

4. **Test Other Features:**
   - Shipment Predictor
   - Vehicle Router
   - Batch Processor

## 🔧 Backend CORS Configuration

If you get CORS errors, update your backend `main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # Add your production domain here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📡 API Endpoints Mapping

### Frontend Component → Backend Endpoint

| Component | Method | Endpoint |
|-----------|--------|----------|
| Dashboard | GET | `/` and `/health` |
| Supplier Predictor | POST | `/api/v1/predict/supplier` |
| Inventory Optimizer | POST | `/api/v1/optimize/inventory` |
| Shipment Predictor | POST | `/api/v1/predict/shipment` |
| Vehicle Router | POST | `/api/v1/optimize/routing` |
| Batch Processor | POST | `/api/v1/batch/suppliers` |
| Model Info | GET | `/api/v1/models/info` |

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend API"

**Solution:**
1. Check backend is running: `curl http://localhost:8000/health`
2. Verify CORS settings in backend
3. Check `.env` file has correct URL
4. Clear browser cache

### Issue: "API request failed"

**Solution:**
1. Check request payload format
2. Verify endpoint exists in backend
3. Check backend logs for errors
4. Test endpoint directly in `/docs`

### Issue: "Models not loaded"

**Solution:**
1. Check backend logs for model loading errors
2. Verify model files exist in `backend/models/`
3. Ensure models are trained
4. Try `/api/v1/models/reload` endpoint

### Issue: Build errors

**Solution:**
```bash
# Clear all caches
rm -rf node_modules package-lock.json .vite
npm install
npm run dev
```

## 🔐 Security Considerations

### Development
- `.env` file is git-ignored
- API runs on localhost only
- CORS restricted to localhost

### Production
- Use HTTPS for both frontend and backend
- Update CORS to allow production domain only
- Use environment variables for secrets
- Enable rate limiting on backend
- Add authentication if needed

## 📊 Performance Optimization

### Frontend
```javascript
// Use React.memo for expensive components
const Dashboard = React.memo(() => { ... });

// Debounce API calls
const debouncedSearch = useMemo(
  () => debounce(fetchData, 300),
  []
);
```

### Backend
```python
# Add caching for expensive operations
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_calculation(params):
    ...
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
# Build for production
npm run build

# Deploy dist/ folder
# Set environment variable: VITE_API_URL=https://your-api.com
```

### Backend (Railway/Heroku/AWS)

```bash
# Ensure requirements.txt is up to date
pip freeze > requirements.txt

# Set environment variables
# Deploy using platform-specific instructions
```

### Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://backend:8000
    depends_on:
      - backend
```

## 📈 Monitoring

### Health Checks

Frontend automatically checks backend health on:
- Initial load
- Every 5 minutes
- After failed requests

### Error Tracking

Add error logging:

```javascript
// api.js
try {
  const response = await fetch(url, config);
  // ...
} catch (error) {
  // Send to logging service
  console.error('API Error:', error);
  // logError(error);
}
```

## 🧪 Testing

### Test Backend API

```bash
# Using curl
curl -X POST "http://localhost:8000/api/v1/predict/supplier" \
  -H "Content-Type: application/json" \
  -d '{"lead_time": 7, "cost": 50, "past_orders": 100}'

# Using Python
import requests
response = requests.post(
    "http://localhost:8000/api/v1/predict/supplier",
    json={"lead_time": 7, "cost": 50, "past_orders": 100}
)
print(response.json())
```

### Test Frontend Components

```bash
# Install testing libraries
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Deployment Guides](https://vitejs.dev/guide/static-deploy.html)

## 🤝 Support

If you encounter issues:

1. Check backend logs
2. Check browser console
3. Test API endpoints in `/docs`
4. Verify environment variables
5. Review this integration guide

## ✅ Integration Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] CORS configured correctly
- [ ] `.env` file created
- [ ] API health check passes
- [ ] All models loaded successfully
- [ ] Supplier predictor works
- [ ] Inventory optimizer works
- [ ] Shipment predictor works
- [ ] Vehicle router works
- [ ] Batch processor works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Production ready

---

**Congratulations!** 🎉 Your Supply Chain Optimization System is now fully integrated and ready to use!