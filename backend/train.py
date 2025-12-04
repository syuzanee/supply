import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from statsmodels.tsa.arima.model import ARIMA
import pickle
import os
import warnings
warnings.filterwarnings('ignore')

def train_supplier_model():
    """Train the supplier reliability prediction model"""
    print("\n" + "="*60)
    print("TRAINING SUPPLIER RELIABILITY MODEL")
    print("="*60)
    
    try:
        # Load supplier data
        df = pd.read_csv('supplier_data.csv')
        print(f"✓ Loaded supplier data: {len(df)} rows")
        print(f"  Columns: {list(df.columns)}")
        
        # Features for prediction
        X = df[['lead_time', 'cost', 'past_orders']]
        y = df['reliability']
        
        print(f"\n✓ Features: {list(X.columns)}")
        print(f"✓ Target: reliability (0=unreliable, 1=reliable)")
        print(f"  - Reliable suppliers: {sum(y == 1)}")
        print(f"  - Unreliable suppliers: {sum(y == 0)}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # Evaluate
        train_accuracy = model.score(X_train, y_train)
        test_accuracy = model.score(X_test, y_test)
        
        print(f"\n✓ Training accuracy: {train_accuracy:.2%}")
        print(f"✓ Testing accuracy: {test_accuracy:.2%}")
        
        # Save model
        os.makedirs('models', exist_ok=True)
        with open('models/supplier_model.pkl', 'wb') as f:
            pickle.dump(model, f)
        print(f"✓ Model saved to models/supplier_model.pkl")
        
        return True
        
    except FileNotFoundError:
        print("✗ ERROR: supplier_data.csv not found!")
        print("  Make sure the file is in the same directory as train.py")
        return False
    except Exception as e:
        print(f"✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

def train_inventory_model():
    """Train the inventory forecasting model"""
    print("\n" + "="*60)
    print("TRAINING INVENTORY FORECASTING MODEL")
    print("="*60)
    
    try:
        # Load inventory data
        df = pd.read_csv('inventory_data.csv')
        print(f"✓ Loaded inventory data: {len(df)} rows")
        print(f"  Columns: {list(df.columns)}")
        
        # Use stock_level for time series forecasting
        stock_levels = df['stock_level'].values
        
        print(f"\n✓ Stock level statistics:")
        print(f"  - Mean: {np.mean(stock_levels):.2f}")
        print(f"  - Min: {np.min(stock_levels):.2f}")
        print(f"  - Max: {np.max(stock_levels):.2f}")
        
        # Check if we have enough data
        if len(stock_levels) < 10:
            print(f"\n⚠ Warning: Only {len(stock_levels)} data points")
            print("  ARIMA models work better with more data (50+ points)")
        
        # Train ARIMA model
        print(f"\n⏳ Training ARIMA model... (this may take a moment)")
        model = ARIMA(stock_levels, order=(1, 1, 1))
        model_fit = model.fit()
        
        print(f"✓ ARIMA model trained successfully")
        print(f"  Model order: (1, 1, 1)")
        
        # Make a sample forecast
        forecast = model_fit.forecast(steps=5)
        print(f"\n✓ Sample 5-step forecast: {[f'{x:.1f}' for x in forecast]}")
        
        # Save model
        os.makedirs('models', exist_ok=True)
        with open('models/inventory_model.pkl', 'wb') as f:
            pickle.dump(model_fit, f)
        print(f"✓ Model saved to models/inventory_model.pkl")
        
        return True
        
    except FileNotFoundError:
        print("✗ ERROR: inventory_data.csv not found!")
        print("  Make sure the file is in the same directory as train.py")
        return False
    except Exception as e:
        print(f"✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

def train_shipment_model():
    """Train the shipment delay prediction model"""
    print("\n" + "="*60)
    print("TRAINING SHIPMENT DELAY PREDICTION MODEL")
    print("="*60)
    
    try:
        # Load shipment data
        df = pd.read_csv('shipment_data.csv')
        print(f"✓ Loaded shipment data: {len(df)} rows")
        print(f"  Columns: {list(df.columns)}")
        
        # Create binary delayed column from status
        df['delayed'] = df['status'].apply(lambda x: 1 if str(x).lower() == 'delayed' else 0)
        
        print(f"\n✓ Target variable created:")
        print(f"  - Delayed shipments: {sum(df['delayed'] == 1)}")
        print(f"  - On-time shipments: {sum(df['delayed'] == 0)}")
        
        # Select features for prediction
        X = df[['delivery_time', 'quantity', 'delay_time']]
        y = df['delayed']
        
        print(f"\n✓ Features: {list(X.columns)}")
        print(f"  - delivery_time: expected delivery time")
        print(f"  - quantity: shipment quantity")
        print(f"  - delay_time: historical delay time")
        
        # Handle any missing values
        X = X.fillna(X.mean())
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        model = LogisticRegression(max_iter=1000, random_state=42)
        model.fit(X_train, y_train)
        
        # Evaluate
        train_accuracy = model.score(X_train, y_train)
        test_accuracy = model.score(X_test, y_test)
        
        print(f"\n✓ Training accuracy: {train_accuracy:.2%}")
        print(f"✓ Testing accuracy: {test_accuracy:.2%}")
        
        # Feature importance (coefficients)
        print(f"\n✓ Feature coefficients:")
        for feature, coef in zip(X.columns, model.coef_[0]):
            print(f"  - {feature}: {coef:.4f}")
        
        # Save model
        os.makedirs('models', exist_ok=True)
        with open('models/shipment_model.pkl', 'wb') as f:
            pickle.dump(model, f)
        print(f"✓ Model saved to models/shipment_model.pkl")
        
        # Save feature names for later use
        with open('models/shipment_features.pkl', 'wb') as f:
            pickle.dump(list(X.columns), f)
        print(f"✓ Feature names saved to models/shipment_features.pkl")
        
        return True
        
    except FileNotFoundError:
        print("✗ ERROR: shipment_data.csv not found!")
        print("  Make sure the file is in the same directory as train.py")
        return False
    except KeyError as e:
        print(f"✗ ERROR: Missing column {e}")
        print(f"  Available columns: {list(df.columns)}")
        print("  Required columns: status, delivery_time, quantity, delay_time")
        return False
    except Exception as e:
        print(f"✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main training pipeline"""
    print("\n" + "="*60)
    print("SUPPLY CHAIN OPTIMIZATION - MODEL TRAINING")
    print("="*60)
    print("\nThis script will train 3 machine learning models:")
    print("  1. Supplier Reliability Predictor (Random Forest)")
    print("  2. Inventory Demand Forecaster (ARIMA)")
    print("  3. Shipment Delay Predictor (Logistic Regression)")
    
    results = {
        'supplier': False,
        'inventory': False,
        'shipment': False
    }
    
    # Train all models
    results['supplier'] = train_supplier_model()
    results['inventory'] = train_inventory_model()
    results['shipment'] = train_shipment_model()
    
    # Summary
    print("\n" + "="*60)
    print("TRAINING SUMMARY")
    print("="*60)
    
    for model_name, success in results.items():
        status = "✓ SUCCESS" if success else "✗ FAILED"
        print(f"{model_name.capitalize()} Model: {status}")
    
    successful = sum(results.values())
    total = len(results)
    
    print(f"\nOverall: {successful}/{total} models trained successfully")
    
    if successful == total:
        print("\n🎉 All models trained successfully!")
        print("\nNext steps:")
        print("  1. Start your backend: uvicorn app:app --reload")
        print("  2. Start your frontend: npm run dev")
        print("  3. Open http://localhost:3000 in your browser")
    else:
        print("\n⚠ Some models failed to train.")
        print("   Please check the error messages above and fix the issues.")
    
    print("="*60 + "\n")

if __name__ == "__main__":
    main()