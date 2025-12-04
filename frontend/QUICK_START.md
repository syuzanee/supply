# ⚡ Quick Start - 5 Minutes to Running App

## 🎯 Goal
Get your Supply Chain Optimization System running in 5 minutes!

## 📋 Prerequisites
- ✅ Python 3.8+
- ✅ Node.js 18+
- ✅ Backend already set up with models trained

## 🚀 3-Step Setup

### Step 1: Start Backend (Terminal 1)

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Wait for:** "Application startup complete"

### Step 2: Setup Frontend (Terminal 2)

```bash
cd frontend
npm install
cp .env.example .env
```

### Step 3: Start Frontend

```bash
npm run dev
```

**Result:** Browser opens at `http://localhost:3000`

## ✅ Quick Test

1. **Header** shows "Connected" with green indicator ✅
2. **Go to Supplier Predictor:**
   - Lead Time: 7
   - Cost: 50
   - Past Orders: 100
3. **Click "Predict Reliability"**
4. **See Results** 🎉

## 🔥 That's It!

You now have:
- ✅ Fully functional frontend
- ✅ Connected to backend API
- ✅ All 6 features working
- ✅ Real-time predictions

## 🛠️ If Something Goes Wrong

### Backend Not Working?
```bash
# Check backend health
curl http://localhost:8000/health
```

### Frontend Can't Connect?
```bash
# Check .env file
cat frontend/.env
# Should show: VITE_API_URL=http://localhost:8000
```

### Still Issues?
```bash
# Clear everything and restart
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📖 Next Steps

1. **Explore All Features:**
   - Dashboard - System overview
   - Supplier Predictor - ML predictions
   - Inventory Optimizer - EOQ calculations
   - Shipment Predictor - Delay forecasting
   - Vehicle Router - Route optimization
   - Batch Processor - Multiple suppliers

2. **Customize:**
   - Update colors in `App.css`
   - Add your logo
   - Modify layouts

3. **Deploy:**
   - See `INTEGRATION_GUIDE.md` for deployment instructions

## 🎊 Success!

Your dynamic, fully integrated Supply Chain Optimization System is now running!

**What you have:**
- Modern React UI
- Real-time API integration
- Dynamic data loading
- Professional styling
- Mobile responsive
- Production ready

**Time taken:** ~5 minutes ⚡

---

Need help? Check `INTEGRATION_GUIDE.md` for detailed troubleshooting!