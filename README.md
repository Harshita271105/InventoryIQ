# 📦 InventoryIQ

### Smart Inventory Management & Analytics Platform

> A data-driven inventory management system for monitoring stock, analyzing sales activity, identifying inventory risks, and supporting smarter replenishment decisions.

---

## 🚀 About the Project

**InventoryIQ** is a full-stack inventory management platform that combines a modern React dashboard with a Flask REST API and SQLite database.

The system uses a **public retail inventory dataset** to provide realistic inventory records, historical sales transactions, stock-level analysis, category analytics, forecasting insights, alerts, and downloadable reports.

The goal is to transform raw inventory data into **clear, actionable information** that can help businesses identify stock problems and make better inventory decisions.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📊 **Overview Dashboard** | Centralized view of inventory health, stock status, inventory value and activity |
| 📦 **Inventory Management** | Monitor current stock, reorder levels and inventory value |
| 🛍️ **Product Management** | View and manage the product catalog |
| 💳 **Transaction Tracking** | Analyze historical sales transactions |
| 📈 **Analytics** | Category-wise inventory value and sales activity analysis |
| 🔮 **Forecasting** | Estimate demand and identify potential stockout risks |
| 🚨 **Smart Alerts** | Detect low-stock and potential stockout situations |
| 📋 **Reports** | Generate downloadable CSV inventory and sales reports |
| 🔎 **Search** | Search products, SKUs and transactions |
| 🌐 **REST API** | Frontend communicates with a Flask backend through API endpoints |

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │     Public Dataset      │
                    │   Retail Inventory CSV  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    Dataset Importer     │
                    │      Python Script       │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      SQLite Database    │
                    │                         │
                    │  Products               │
                    │  Categories             │
                    │  Transactions           │
                    │  Stock History          │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      Flask REST API      │
                    │                         │
                    │  /products              │
                    │  /categories            │
                    │  /transactions           │
                    └────────────┬────────────┘
                                 │
                                 ▼
              ┌────────────────────────────────────┐
              │       React + TypeScript UI        │
              │                                    │
              │  Overview   Inventory   Products   │
              │  Transactions   Analytics          │
              │  Forecasting   Alerts   Reports    │
              └────────────────────────────────────┘
```

---

# 🔄 Data Flow

```text
CSV Dataset
     ↓
Python Data Import
     ↓
Data Cleaning & Transformation
     ↓
SQLite Storage
     ↓
Flask REST API
     ↓
React Frontend
     ↓
Calculations & Analytics
     ↓
Dashboard Insights
     ↓
Reports / Alerts / Forecasts
```

---

# 📊 Dataset

InventoryIQ uses the publicly available **Retail Store Inventory Forecasting Dataset** from Kaggle.

The source dataset contains retail inventory records with information such as:

- 📅 Date
- 🏪 Store ID
- 🏷️ Product ID
- 📂 Category
- 🌍 Region
- 📦 Inventory Level
- 🛒 Units Sold
- 📥 Units Ordered
- 🔮 Demand Forecast
- 💰 Price
- 🏷️ Discount
- 🌦️ Weather Condition
- 🎉 Holiday / Promotion
- 💵 Competitor Pricing
- 🌱 Seasonality

### Dataset Statistics

| Metric | Value |
|---|---:|
| Inventory records | **73,100** |
| Unique products | **100** |
| Categories | **5** |
| Sales transactions | **72,740** |
| Stores | **5** |
| Dataset period | **2022** |

### Product Categories

The dataset contains:

- 👕 Clothing
- 💻 Electronics
- 🪑 Furniture
- 🛒 Groceries
- 🧸 Toys

> **Note:** The source dataset does not contain individual product names or supplier names. Product labels displayed by InventoryIQ are derived from the available Product ID and Category information.

---

# 🧮 Core Inventory Calculations

## 💰 Inventory Value

Inventory value is calculated using the current stock and unit price:

```text
Inventory Value = Current Stock × Unit Price
```

---

## 📦 Stock Classification

Products are classified using their current stock and reorder level.

```text
Healthy
Current Stock > Reorder Level

Low Stock
0 < Current Stock ≤ Reorder Level

Out of Stock
Current Stock = 0
```

A separate **Critical** category is not calculated from the current dataset because the source data does not define a critical-stock threshold.

---

## 🔮 Stockout Risk Estimation

InventoryIQ estimates stockout risk using recent historical sales activity.

### Step 1 — Calculate recent demand

```text
Average Daily Demand =
Recent Units Sold ÷ Number of Recent Days
```

### Step 2 — Estimate stock coverage

```text
Stock Coverage =
Current Stock ÷ Average Daily Demand
```

### Step 3 — Identify risk

```text
If Stock Coverage ≤ 7 days
→ Product is flagged as potential stockout risk
```

This provides a simple, explainable demand-based heuristic for inventory planning.

> ⚠️ The current implementation is a **rule-based forecasting heuristic**, not a machine-learning model.

---

# 📈 Analytics

The Analytics dashboard provides dataset-driven insights including:

- 📊 Sales activity trends
- 💰 Inventory value
- 📂 Category-wise inventory value
- 🏆 Top-moving products
- 📦 Inventory health
- 📉 Historical transaction activity

All displayed metrics are calculated from the imported dataset and stored inventory records.

---

# 🔮 Forecasting

The Forecasting module uses recent historical sales activity to estimate short-term demand.

It provides:

- Recent demand analysis
- Estimated 7-day demand
- Stock coverage
- Stockout-risk identification
- Reorder suggestions
- Products requiring attention

The forecasting approach is intentionally explainable so that inventory decisions can be traced back to historical sales data.

---

# 🚨 Smart Alerts

InventoryIQ automatically identifies inventory conditions that require attention.

Current alerts include:

- 🔴 Out-of-stock products
- 🟠 Low-stock products
- 🟡 Potential stockout risks
- 🔵 Data availability warnings

The alert system uses actual product and transaction information rather than predefined mock values.

---

# 📋 Reports

InventoryIQ supports CSV report generation for:

### 📦 Inventory Summary
Provides an overview of products, stock levels and inventory values.

### 🔄 Stock Movement
Provides stock-related transaction information.

### 💳 Sales Report
Exports historical sales transaction data.

### ⚠️ Low Stock Report
Lists products currently below their reorder level.

### 💤 Dead Stock Report
Identifies products with limited recent sales activity based on the available historical dataset.

---

# 🛠️ Technology Stack

## Frontend

- ⚛️ **React**
- 📘 **TypeScript**
- ⚡ **Vite**
- 🎨 **Tailwind CSS**
- 📊 **Recharts**
- 🧩 **Lucide React**

## Backend

- 🐍 **Python**
- 🌶️ **Flask**
- 🗄️ **SQLite**
- 🔗 **Flask-CORS**

## Tools

- 💻 Visual Studio Code
- 🌱 Git
- 🐙 GitHub

---

# 📁 Project Structure

```text
InventoryIQ/
│
├── 📂 backend/
│   ├── 📂 models/
│   ├── 📂 routes/
│   ├── 📂 services/
│   ├── 📄 app.py
│   ├── 📄 database.py
│   └── 📄 import_dataset.py
│
├── 📂 data/
│   └── 📂 raw/
│       └── 📄 retail_store_inventory.csv
│
├── 📂 database/
│   └── 🗄️ inventory.db
│
├── 📂 src/
│   ├── 📂 data/
│   ├── 📄 api.ts
│   ├── 📄 App.tsx
│   ├── 📄 index.css
│   └── 📄 main.tsx
│
├── 📄 .gitignore
├── 📄 package.json
├── 📄 README.md
└── 📄 vite.config.ts
```

---

# 🔌 API Architecture

The React frontend communicates with the Flask backend using REST API endpoints.

### Products

```text
GET /api/products
GET /api/products/<id>
```

### Categories

```text
GET /api/categories
```

### Transactions

```text
GET /api/transactions
GET /api/transactions/<id>
```

The API layer separates the frontend interface from the database and backend business logic.

---

# ⚙️ Running the Project Locally

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Harshita271105/InventoryIQ.git
cd InventoryIQ
```

---

## 2️⃣ Install Frontend Dependencies

```bash
npm install
```

---

## 3️⃣ Create Python Virtual Environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

---

## 4️⃣ Install Backend Dependencies

```bash
pip install flask flask-cors
```

---

## 5️⃣ Initialize the Database

```bash
python backend/database.py
```

---

## 6️⃣ Import the Dataset

```bash
python backend/import_dataset.py
```

The import script loads the public dataset into the SQLite database.

---

## 7️⃣ Start the Backend

```bash
python backend/app.py
```

Backend:

```text
http://127.0.0.1:5000
```

---

## 8️⃣ Start the Frontend

In a separate terminal:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🧠 Design Approach

InventoryIQ follows a layered architecture:

```text
Presentation Layer
        │
        ▼
React + TypeScript
        │
        ▼
API Layer
        │
        ▼
Flask REST API
        │
        ▼
Service Layer
        │
        ▼
Database Layer
        │
        ▼
SQLite
```

This separation makes the application easier to maintain, test and extend.

---

# 🎯 Project Goals

InventoryIQ was developed with the following goals:

- Reduce the effort required to monitor inventory.
- Provide a centralized view of stock conditions.
- Convert historical inventory data into actionable insights.
- Identify products that require replenishment.
- Provide transparent and explainable inventory calculations.
- Make inventory information easier to understand through visual analytics.
- Generate useful reports from the underlying data.

---

# ⚠️ Data Limitations

The public dataset does not contain sufficient information for certain business metrics.

Therefore, InventoryIQ does **not fabricate** the following information:

- ❌ Supplier names
- ❌ Supplier delivery history
- ❌ Purchase orders
- ❌ Product cost
- ❌ Gross profit
- ❌ Real-time inventory events

Where the source data does not support a calculation, InventoryIQ displays the metric as unavailable.

This keeps the dashboard data-driven and transparent.

---

# 🔮 Future Scope

Potential future improvements include:

- 🤖 Machine-learning-based demand forecasting
- 📡 Real-time inventory synchronization
- 👥 Role-based authentication and authorization
- 🏢 Supplier management
- 🚚 Supplier performance tracking
- 🛒 Purchase order management
- 📦 Automated reorder recommendations
- 📊 Advanced predictive analytics
- 🔔 Real-time notifications
- ☁️ Cloud database integration
- 📱 Mobile-friendly inventory management

---

# 🌟 Why InventoryIQ?

Traditional inventory monitoring often requires manually checking large amounts of data.

InventoryIQ brings the important information together in one place:

```text
Raw Inventory Data
        ↓
Data Processing
        ↓
Inventory Metrics
        ↓
Visual Analytics
        ↓
Risk Detection
        ↓
Actionable Insights
```

Instead of simply storing inventory records, the system helps users **understand what is happening with their inventory and where attention may be required.**

---

# 📌 Project Status

🟢 **Active Development**

Current implementation includes:

- ✅ Dataset integration
- ✅ SQLite database
- ✅ Flask REST API
- ✅ React dashboard
- ✅ Inventory monitoring
- ✅ Transaction tracking
- ✅ Analytics
- ✅ Forecasting
- ✅ Smart alerts
- ✅ CSV reports
- ✅ Dataset-driven Overview dashboard

---

## 👩‍💻 Author

**Harshita Verma**

Electronics & Computer Engineering

---

> ⭐ InventoryIQ — Turning inventory data into actionable insights.