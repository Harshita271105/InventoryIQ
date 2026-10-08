# 📦 InventoryIQ

### Smart Inventory Management & Analytics Platform

> A full-stack, data-driven inventory management system for monitoring stock, analyzing sales activity, identifying inventory risks, and supporting smarter replenishment decisions.

---

## 🚀 About the Project

**InventoryIQ** is a full-stack inventory management platform built with a React + TypeScript frontend, a Python Flask REST API, and a SQLite database.

The application uses a public retail inventory dataset to provide realistic inventory records, historical transactions, stock-level analysis, category analytics, demand-based forecasting, alerts, supplier management, and downloadable reports.

The goal is to transform raw inventory data into **clear, actionable information** that helps users understand inventory health and identify products that may require attention.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📊 **Overview Dashboard** | Centralized view of inventory health, stock status, inventory value, and recent activity |
| 📦 **Inventory Management** | Monitor stock levels, reorder levels, inventory value, and stock conditions |
| 🛍️ **Product Management** | View, add, edit, search, filter, and delete products through the backend |
| 💳 **Transaction Tracking** | View and analyze historical inventory transactions |
| 📈 **Analytics** | Analyze sales activity, inventory value, category distribution, and product movement |
| 🔮 **Forecasting** | Estimate short-term demand, stock coverage, and potential stockout risk |
| 🚨 **Smart Alerts** | Identify out-of-stock, low-stock, and potential stockout-risk conditions |
| 🚚 **Supplier Management** | Add and manage supplier records and view supplier reliability information |
| 📋 **Reports** | Generate and download CSV reports for supported inventory and transaction data |
| 🔎 **Search & Filtering** | Search and filter products, inventory, and transactions |
| 🌗 **Theme Support** | Switch between dark and light interface themes |
| ⚙️ **Settings & Help** | Workspace settings, system information, and in-app support guidance |
| 🌐 **REST API** | React frontend communicates with the Flask backend through API endpoints |

---

## 🏗️ System Architecture

```text
                  Public Retail Dataset
                           │
                           ▼
                  Python Dataset Importer
                           │
                           ▼
                    SQLite Database
                           │
                           ▼
                     Flask REST API
                           │
                           ▼
                 React + TypeScript UI
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
        Analytics      Forecasting      Reports
            │              │              │
            └──────────────┼──────────────┘
                           ▼
                     Inventory Insights
```

---

## 🔄 Data Flow

```text
Retail Inventory CSV
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
Reports / Alerts / Forecasting
```

---

# 📊 Dataset

InventoryIQ uses the publicly available **Retail Store Inventory Forecasting Dataset** from Kaggle.

Dataset source:

**https://www.kaggle.com/datasets/anirudhchauhan/retail-store-inventory-forecasting-dataset**

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
| Stores | **5** |
| Imported transaction records | **72,740** |
| Dataset period | **2022-01-01 to 2024-01-01** |

### Product Categories

The dataset contains five categories:

- Clothing
- Electronics
- Furniture
- Groceries
- Toys

> **Note:** The source dataset does not contain individual product names or supplier names. InventoryIQ therefore derives display labels from the available Product ID and Category information rather than inventing source product names.

---

# 🧮 Core Inventory Calculations

## 💰 Inventory Value

Inventory value is calculated from current stock and unit price:

```text
Inventory Value = Current Stock × Unit Price
```

---

## 📦 Stock Classification

InventoryIQ classifies stock conditions using current stock and the configured reorder level.

```text
Healthy
Current Stock > Reorder Level

Low Stock
0 < Current Stock ≤ Reorder Level

Out of Stock
Current Stock = 0
```

Where a more specific critical threshold is not supported by the source dataset, the application does not present it as a source-derived business rule.

---

# 🔮 Forecasting & Stockout Risk

InventoryIQ uses a **rule-based, demand-driven forecasting heuristic** based on recent historical sales activity.

### Step 1 — Calculate Recent Demand

```text
Average Daily Demand =
Recent Units Sold ÷ Number of Recent Days
```

### Step 2 — Estimate Stock Coverage

```text
Stock Coverage =
Current Stock ÷ Average Daily Demand
```

### Step 3 — Identify Potential Risk

```text
If Stock Coverage ≤ 7 days
→ Product is flagged as potential stockout risk
```

This approach is intentionally simple and explainable so users can understand why a product has been flagged.

> ⚠️ **Important:** The current forecasting implementation is a rule-based heuristic, **not a machine-learning model**.

---

# 📈 Analytics

The Analytics dashboard provides dataset-driven insights including:

- 📊 Sales activity trends
- 💰 Inventory value
- 📂 Category-wise inventory value
- 🏆 Top-moving products
- 📦 Inventory health
- 📉 Historical transaction activity
- 📅 Selectable analysis ranges

The displayed metrics are calculated from the imported dataset and stored inventory records.

---

# 🚨 Smart Alerts

InventoryIQ identifies inventory conditions that may require attention.

Current alert categories include:

- 🔴 Out-of-stock products
- 🟠 Low-stock products
- 🟡 Potential stockout risks
- 🔵 Data availability warnings

The alert system uses actual product and transaction information from the application's backend and imported dataset rather than predefined mock dashboard values.

---

# 🚚 Supplier Management

InventoryIQ includes a supplier management interface backed by the application's SQLite database.

Users can:

- Add supplier records
- View supplier information
- Track reliability information
- View average delivery information
- Associate supplier information with the inventory workflow

> The public retail dataset does not provide supplier information, so supplier records entered through the application are application-managed data rather than values sourced from the Kaggle dataset.

---

# 📋 Reports

InventoryIQ supports CSV report generation for supported inventory and transaction data.

### 📦 Inventory Summary

Provides an overview of products, stock levels, and inventory values.

### 🔄 Stock Movement

Provides stock-related transaction information.

### 💳 Sales Report

Exports historical sales transaction data.

### ⚠️ Low Stock Report

Lists products currently below their configured reorder level.

### 💤 Dead Stock Report

Identifies products with limited recent sales activity based on the available historical dataset.

> Some report types that require business information not present in the source dataset are intentionally shown as unavailable rather than using fabricated values.

---

# 🛠️ Technology Stack

## Frontend

- ⚛️ **React**
- 📘 **TypeScript**
- ⚡ **Vite**
- 🎨 **CSS**
- 📊 **Recharts**
- 🧩 **Lucide React**
- 🎞️ **Framer Motion**

## Backend

- 🐍 **Python**
- 🌶️ **Flask**
- 🗄️ **SQLite**
- 🔗 **Flask-CORS**

## Data & Tools

- 📊 **CSV / public retail dataset**
- 💻 **Visual Studio Code**
- 🌱 **Git**
- 🐙 **GitHub**

---

# 📁 Project Structure

```text
InventoryIQ/
│
├── 📂 backend/
│   ├── 📂 models/
│   ├── 📂 routes/
│   ├── 📂 services/
│   ├── 📂 utils/
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
│   ├── 📄 api.ts
│   ├── 📄 App.tsx
│   ├── 📄 index.css
│   ├── 📄 main.tsx
│   └── 📄 vite-env.d.ts
│
├── 📄 .gitignore
├── 📄 package.json
├── 📄 README.md
├── 📄 postcss.config.js
└── 📄 vite.config.ts
```

> The previous frontend `mockData.ts` file has been removed. The application now relies on backend/API data and the imported dataset.

---

# 🔌 API Architecture

The React frontend communicates with the Flask backend through REST API endpoints.

### Products

```text
GET    /api/products
POST   /api/products
PUT    /api/products/<id>
DELETE /api/products/<id>
```

### Transactions

```text
GET /api/transactions
```

### Inventory

```text
GET /api/inventory/stock-in
GET /api/inventory/stock-out
```

### Search

```text
GET /api/search
```

### Exports

```text
GET /api/export/products
GET /api/export/transactions
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

## 3️⃣ Create a Python Virtual Environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

---

## 4️⃣ Install Backend Dependencies

Install the backend requirements used by the project.

```bash
pip install flask flask-cors
```

If additional packages are required by the local Python environment, install those as well.

---

## 5️⃣ Initialize the Database

```bash
python backend/database.py
```

---

## 6️⃣ Import the Dataset

Make sure the dataset is available at:

```text
data/raw/retail_store_inventory.csv
```

Then run:

```bash
python backend/import_dataset.py
```

The import script loads the public retail dataset into the SQLite database.

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

Open a separate terminal:

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

This separation keeps the frontend, API, business logic, and database responsibilities distinct, making the application easier to maintain and extend.

---

# 🎯 Project Goals

InventoryIQ was developed with the following goals:

- Reduce the effort required to monitor inventory.
- Provide a centralized view of stock conditions.
- Convert historical inventory data into actionable insights.
- Identify products that may require replenishment.
- Provide transparent and explainable inventory calculations.
- Make inventory information easier to understand through visual analytics.
- Generate useful reports from the underlying data.
- Demonstrate full-stack integration between a modern frontend and Python backend.

---

# ⚠️ Data Limitations

The public dataset does not contain sufficient information for some real-world business metrics.

InventoryIQ therefore avoids fabricating source data for areas such as:

- ❌ Supplier information from the source dataset
- ❌ Supplier delivery history from the source dataset
- ❌ Real purchase-order history
- ❌ Product cost
- ❌ Gross profit
- ❌ Real-time inventory events

Where the source data does not support a calculation, InventoryIQ either uses application-managed information where appropriate or displays the metric as unavailable.

This keeps the system transparent and data-driven.

---

# 🔮 Future Scope

Potential future improvements include:

- 🤖 Machine-learning-based demand forecasting
- 📡 Real-time inventory synchronization
- 👥 Role-based authentication and authorization
- 🚚 Integration with real supplier data
- 🛒 Full purchase-order workflow
- 📦 Automated reorder recommendations
- 📊 Advanced predictive analytics
- 🔔 Real-time notifications
- ☁️ Cloud database integration
- 📱 Expanded mobile optimization

---

# 🌟 Why InventoryIQ?

Traditional inventory monitoring can require manually checking large amounts of stock and transaction data.

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

🟢 **Completed Working Prototype**

Current implementation includes:

- ✅ Public dataset integration
- ✅ SQLite database
- ✅ Flask REST API
- ✅ React + TypeScript dashboard
- ✅ Inventory monitoring
- ✅ Product CRUD operations
- ✅ Transaction tracking
- ✅ Analytics
- ✅ Rule-based forecasting
- ✅ Smart alerts
- ✅ Supplier management
- ✅ CSV reports
- ✅ Search and filtering
- ✅ Dark / light theme
- ✅ Settings and Help & Support pages
- ✅ Dataset-driven Overview dashboard
- ✅ GitHub repository

---

## 👩‍💻 Author

**Harshita Verma**

Electronics & Computer Engineering

---

> ⭐ **InventoryIQ — Turning inventory data into actionable insights.**
