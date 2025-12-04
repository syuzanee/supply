# **Supply Chain Optimization Dashboard**

In the digital age, where supply chains are the backbone of global commerce, the ability to **predict, optimize, and react** in real time has become a competitive superpower. This project is a modern, AI-powered command center designed to tackle the complex challenges of supply chain management with intelligence and style.

With an interactive interface built using **React, TypeScript, and Tailwind CSS**, and multiple machine learning models serving as the brains behind the operation, this project bridges the gap between **human decision-making and AI-driven insights**. 

An intelligent, modern dashboard designed to optimize supply chain operations through smart routing, demand forecasting, real-time monitoring, and data-driven decision making.

This project includes a React + Vite frontend and a FastAPI backend, along with machine-learning support for forecasting and optimization.

🚀 Features
🔍 Smart Supply Chain Tools

Demand Forecasting – Predict product demand using time-series or ML models.

Routing Optimization – Generate efficient vehicle routes using coordinates and constraints.

Inventory Tracking – Monitor stock levels and predict shortages.

Cost Optimization – Analyze supply chain costs and identify savings.

Interactive Dashboards – Charts, maps, and tables for complete visibility.

🖥️ Frontend (React)

Built with React + Vite

Routing, state management, interactive visuals

API integration with FastAPI backend

Clean UI with TailwindCSS

⚙️ Backend (FastAPI)

REST API endpoints for forecast, routing, and stock operations

Machine Learning model integration

Uvicorn dev server with live reload

Modular code structure

📁 Project Structure
supply/
│── backend/            # FastAPI app, ML models, routing logic
│   ├── app.py
│   ├── models/
│   └── utils/
│
│── frontend/           # React + Vite UI
│   ├── src/
│   ├── public/
│
│── assets/             # Images, icons, datasets
│── README.md
│── LICENSE

🛠️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/syuzanee/supply.git
cd supply

🖥️ Backend Setup (FastAPI)
Install dependencies
cd backend
pip install -r requirements.txt

Run the backend server
uvicorn app:app --reload


Backend will run at:
http://127.0.0.1:8000

🌐 Frontend Setup (React + Vite)
Install dependencies
cd frontend
npm install

Start frontend
npm run dev


Frontend will run at:
http://localhost:5173

🔗 API Endpoints (Example)
Method	Endpoint	Description
GET	/health	Check server status
POST	/route/optimize	Generate vehicle routing plan
POST	/forecast	Predict product demand
GET	/inventory	Get inventory list
🧠 Machine Learning

The backend supports:

Time-series forecasting (SARIMA / Prophet / custom models)

ML-based demand prediction

Optimization algorithms for routing

Models are loaded dynamically and reusable through a PredictionService class.

📸 Screenshots (Optional)

You can place UI screenshots inside /assets and link them here:

![Dashboard Preview](assets/dashboard.png)

📜 License

This project is licensed under the Apache-2.0 License.

🤝 Contributing

Pull requests are welcome!
If you want to contribute:

Fork the project

Create a new branch

Commit changes

Submit a PR

📧 Contact

---

<!-- Hero Image -->

## **📜 License**
This project is licensed under the Apache License.
