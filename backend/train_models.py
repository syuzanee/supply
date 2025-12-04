import numpy as np
import pandas as pd
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from statsmodels.tsa.arima.model import ARIMA
from pathlib import Path

# Create models directory
Path("models").mkdir(exist_ok=True)

# 1. Supplier Reliability (RandomForestClassifier)
np.random.seed(42)
n_samples = 5000
lead_times = np.random.randint(1, 31, n_samples)
costs = np.random.uniform(10, 200, n_samples)
past_orders = np.random.randint(0, 201, n_samples)
X_supplier = np.column_stack((lead_times, costs, past_orders))
reliability_scores = -0.5 * lead_times - 0.3 * costs + 0.2 * past_orders + np.random.normal(0, 10, n_samples)
y_supplier = (reliability_scores > 0).astype(int)

X_train, X_test, y_train, y_test = train_test_split(X_supplier, y_supplier, test_size=0.2, random_state=42)
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)
acc = accuracy_score(y_test, rf_model.predict(X_test))
print(f"Supplier model accuracy: {acc:.2f}")

with open("models/supplier_model.pkl", "wb") as f:
    pickle.dump(rf_model, f)

# 2. Shipment Delay (LogisticRegression)
delivery_times = np.random.randint(1, 11, n_samples)
quantities = np.random.randint(10, 201, n_samples)
delay_times = np.random.randint(0, 6, n_samples)
X_shipment = np.column_stack((delivery_times, quantities, delay_times))
delay_scores = 0.4 * delivery_times + 0.3 * quantities + 0.5 * delay_times + np.random.normal(0, 5, n_samples)
y_shipment = (delay_scores > 20).astype(int)

X_train, X_test, y_train, y_test = train_test_split(X_shipment, y_shipment, test_size=0.2, random_state=42)
lr_model = LogisticRegression(max_iter=200, random_state=42)
lr_model.fit(X_train, y_train)
acc = accuracy_score(y_test, lr_model.predict(X_test))
print(f"Shipment model accuracy: {acc:.2f}")

with open("models/shipment_model.pkl", "wb") as f:
    pickle.dump(lr_model, f)

# 3. Inventory Forecast (ARIMA)
dates = pd.date_range(start="2024-01-01", periods=365, freq="D")
trend = np.linspace(100, 200, 365)
seasonality = 20 * np.sin(2 * np.pi * np.arange(365) / 30)
noise = np.random.normal(0, 10, 365)
inventory_levels = trend + seasonality + noise
ts_data = pd.Series(inventory_levels, index=dates)

arima_model = ARIMA(ts_data, order=(1, 1, 1))
arima_fitted = arima_model.fit()
print(arima_fitted.summary())

with open("models/inventory_model.pkl", "wb") as f:
    pickle.dump(arima_fitted, f)

print("Models saved to 'models/' directory. Restart the app to load them.")