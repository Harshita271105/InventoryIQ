import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  CirclePlus,
  ClipboardList,
  Clock3,
  Download,
  FileBarChart,
  FileText,
  Filter,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Package,
  Plus,
  Receipt,
  Search,
  Settings,
  Sparkles,
  Target,
  Truck,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiGet, apiPost } from "./api";

import {
  navItems,
  type InventoryStatus,
  type Product,
  type TransactionType,
} from "@/data/mockData";

type IconName =
  | "layout"
  | "boxes"
  | "package"
  | "receipt"
  | "chart"
  | "sparkles"
  | "bell"
  | "truck"
  | "file";
type ModalType = "product" | "transaction" | null;

const iconMap: Record<IconName, typeof LayoutDashboard> = {
  layout: LayoutDashboard,
  boxes: Boxes,
  package: Package,
  receipt: Receipt,
  chart: BarChart3,
  sparkles: Sparkles,
  bell: Bell,
  truck: Truck,
  file: FileText,
};
const statusClasses: Record<InventoryStatus, string> = {
  Healthy: "status-healthy",
  "Low Stock": "status-low",
  Critical: "status-critical",
  "Out of Stock": "status-out",
};
const transactionClasses: Record<TransactionType, string> = {
  Purchase: "transaction-purchase",
  Sale: "transaction-sale",
  Return: "transaction-return",
  Adjustment: "transaction-adjustment",
};

type BackendProduct = {
  id: number;
  name: string;
  sku: string;
  category_id: number | null;
  supplier_id: number | null;
  description: string | null;
  unit_price: number;
  current_stock: number;
  reorder_level: number;
  inventory_value: number;
  status: "HEALTHY" | "LOW_STOCK" | "CRITICAL" | "OUT_OF_STOCK";
};

type BackendCategory = {
  id: number;
  name: string;
  description?: string | null;
};

type BackendSupplier = {
  id: number;
  name: string;
};

const backendStatusMap: Record<BackendProduct["status"], InventoryStatus> = {
  HEALTHY: "Healthy",
  LOW_STOCK: "Low Stock",
  CRITICAL: "Critical",
  OUT_OF_STOCK: "Out of Stock",
};

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All statuses" | InventoryStatus
  >("All statuses");
  const [toast, setToast] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);

      const [backendProducts, categories, suppliers] =
        await Promise.all([
          apiGet<BackendProduct[]>("/products"),
          apiGet<BackendCategory[]>("/categories"),
          apiGet<BackendSupplier[]>("/suppliers"),
        ]);

      const categoryMap = new Map(
        categories.map((category) => [
          category.id,
          category.name,
        ]),
      );

      const supplierMap = new Map(
        suppliers.map((supplier) => [
          supplier.id,
          supplier.name,
        ]),
      );

      const mappedProducts: Product[] =
        backendProducts.map((product) => ({
          id: String(product.id),
          name: product.name,
          sku: product.sku,
          category:
            categoryMap.get(product.category_id ?? -1) ??
            `Category #${product.category_id ?? "N/A"}`,
          stock: product.current_stock,
          reserved: 0,
          price: product.unit_price,
          status: backendStatusMap[product.status],
          supplier:
            supplierMap.get(product.supplier_id ?? -1) ??
            `Supplier #${product.supplier_id ?? "N/A"}`,
          reorderLevel: product.reorder_level,
          updated: "Dataset",
        }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch =
          `${product.name} ${product.sku} ${product.category}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "All statuses" || product.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [products, search, statusFilter],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

const handleAction = (action: string) => {
  setQuickActionOpen(false);

  if (action === "Add Product") {
    setModal("product");
    return;
  }

  if (action === "Record Transaction") {
    setModal("transaction");
    return;
  }

  if (
    action === "Forecasting" ||
    action === "Transactions" ||
    action === "Inventory" ||
    action === "Products" ||
    action === "Analytics" ||
    action === "Alerts" ||
    action === "Suppliers" ||
    action === "Reports" ||
    action === "Settings"
  ) {
    setActivePage(action);
    setSidebarOpen(false);
    return;
  }

  if (action === "Export CSV") {
    if (products.length === 0) {
      showToast("No inventory data is available to export.");
      return;
    }

    const headers = [
      "Product ID",
      "Product Name",
      "SKU",
      "Category",
      "Current Stock",
      "Unit Price",
      "Inventory Value",
      "Reorder Level",
      "Status",
      "Supplier",
    ];

    const rows = products.map((product) => [
      product.id,
      product.name,
      product.sku,
      product.category,
      product.stock,
      product.price.toFixed(2),
      (product.stock * product.price).toFixed(2),
      product.reorderLevel,
      product.status,
      product.supplier,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "InventoryIQ_Inventory.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast("Inventory CSV downloaded.");
    return;
  }

  showToast(`${action} is ready to connect to your Python backend.`);
};

  return (
    <div className={`app-shell ${theme}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Sidebar
  activePage={activePage}
  open={sidebarOpen}
  theme={theme}
  onThemeChange={setTheme}
  onNavigate={(page) => {
    setActivePage(page);
    setSidebarOpen(false);
  }}
/>
      <main className="main-content">
        <Topbar
  search={search}
  setSearch={setSearch}
  onMenu={() => setSidebarOpen(true)}
  onQuickAction={() =>
    setQuickActionOpen((open) => !open)
  }
/>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activePage === "Overview" && (
  <Overview
    onAction={handleAction}
    totalProducts={products.length}
  />
)}
            {activePage === "Inventory" && (
              <InventoryPage
  products={filteredProducts}
  totalUnits={products.reduce((total, product) => total + product.stock, 0)}
  inventoryValue={products.reduce(
  (total, product) => total + product.stock * product.price,
  0
)}
needsAttention={products.filter(
  (product) =>
    product.status === "Low Stock" ||
    product.status === "Critical" ||
    product.status === "Out of Stock"
).length}
  search={search}
  setSearch={setSearch}
  statusFilter={statusFilter}
  setStatusFilter={setStatusFilter}
                onAction={handleAction}
              />
            )}
            {activePage === "Products" && (
              <ProductsPage
                products={filteredProducts}
                onAction={handleAction}
              />
            )}
            {activePage === "Transactions" && (
              <TransactionsPage onAction={handleAction} />
            )}
            {activePage === "Analytics" && <AnalyticsPage />}
            {activePage === "Forecasting" && <ForecastingPage />}
            {activePage === "Alerts" && <AlertsPage showToast={showToast} />}
            {activePage === "Suppliers" && <SuppliersPage />}
            {activePage === "Reports" && <ReportsPage showToast={showToast} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <AnimatePresence>
        {quickActionOpen && <QuickActionMenu onAction={handleAction} />}
      </AnimatePresence>
      <AnimatePresence>
        {modal && (
          <Modal
            type={modal}
            onClose={() => setModal(null)}
            onSave={() => {
              setModal(null);
              showToast(
                modal === "product"
                  ? "Product added to your catalog."
                  : "Transaction recorded successfully.",
              );
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <span className="toast-icon">
              <Check size={15} />
            </span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sidebar({
  activePage,
  open,
  onNavigate,
  theme,
  onThemeChange,
}: {
  activePage: string;
  open: boolean;
  onNavigate: (page: string) => void;
  theme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
}) {
  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand">
        <div className="brand-mark">
          <Boxes size={19} />
        </div>

        <div>
          <strong>
            Inventory<span>IQ</span>
          </strong>
          <small>Smart inventory platform</small>
        </div>

        <button
          className="sidebar-close"
          onClick={() => onNavigate(activePage)}
        >
          <X size={17} />
        </button>
      </div>

      <div className="sidebar-section-label">Workspace</div>

      <nav>
        {navItems.map((item) => {
          const Icon = iconMap[item.icon as IconName];

          return (
            <button
              key={item.label}
              className={`nav-item ${
                activePage === item.label ? "active" : ""
              }`}
              onClick={() => onNavigate(item.label)}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-section-label">System</div>

        <button className="nav-item">
          <Settings size={17} />
          <span>Settings</span>
        </button>

        <button className="nav-item">
          <CircleHelp size={17} />
          <span>Help & Support</span>
        </button>

        <div className="profile-card">
          <div className="avatar avatar-photo">AU</div>

          <div>
            <strong>Admin User</strong>
            <small>Administrator</small>
          </div>

          <ChevronDown size={15} />
        </div>

        <div className="theme-switch">
          <button
            className={theme === "dark" ? "theme-active" : ""}
            onClick={() => onThemeChange("dark")}
          >
            <Zap size={14} />
            Dark
          </button>

          <button
            className={theme === "light" ? "theme-active" : ""}
            onClick={() => onThemeChange("light")}
          >
            Light
          </button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({
  search,
  setSearch,
  onMenu,
  onQuickAction,
}: {
  search: string;
  setSearch: (value: string) => void;
  onMenu: () => void;
  onQuickAction: () => void;
}) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenu}>
        <Menu size={20} />
      </button>

      <div className="global-search">
        <Search size={17} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products, SKU, transactions..."
        />
        <kbd>⌘ K</kbd>
      </div>

      <button className="date-button">
        <CalendarDays size={15} />
        Jan 1, 2022 - Jan 1, 2024
      </button>

      <div className="topbar-actions">
        <button className="icon-button notification">
          <Bell size={18} />
        </button>

        <div className="top-user">
          <div className="avatar avatar-photo">AU</div>
          <div>
            <strong>Admin User</strong>
            <small>Administrator</small>
          </div>
          <ChevronDown size={15} />
        </div>

        <button
          className="quick-action-button"
          onClick={onQuickAction}
        >
          <Plus size={16} />
          Quick Action
        </button>
      </div>
    </header>
  );
}

function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Overview({
  onAction,
  totalProducts,
}: {
  onAction: (action: string) => void;
  totalProducts: number;
}) {
  return (
    <div className="page">
      <PageHeader
        title="Good morning, Admin. 👋"
        subtitle="Here’s an overview of your inventory based on the public dataset."
        action={
          <div className="header-actions">
            <button
              className="secondary-button"
              onClick={() => onAction("Add Product")}
            >
              <CirclePlus size={16} />
              Add Product
            </button>

            <button
              className="secondary-button"
              onClick={() => onAction("Record Transaction")}
            >
              <Receipt size={16} />
              Record Transaction
            </button>

            <button
              className="secondary-button"
              onClick={() => onAction("Export CSV")}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        }
      />

      <KpiGrid totalProducts={totalProducts} />

      <div className="dashboard-grid top-grid">
        <HealthCard />
        <TrendCard />
        <ActivityCard onNavigate={onAction} />
      </div>

      <div className="dashboard-grid bottom-grid">
        <StatusCard />
        <CategoriesCard />
        <SmartAlerts />
        <InsightCard onNavigate={onAction} />
      </div>

      <SummaryCard />
    </div>
  );
}

const kpis = [
  {
    label: "Total Products",
    value: "0",
    change: "Dataset-based",
    icon: Package,
    tone: "green",
    points: [12, 18, 11, 23, 18, 28, 20, 34],
  },
  {
    label: "Inventory Value",
    value: "$0",
    change: "Dataset-based",
    icon: Target,
    tone: "purple",
    points: [12, 20, 15, 28, 19, 30, 24, 36],
  },
  {
    label: "Low Stock Items",
    value: "0",
    change: "Current stock",
    icon: AlertTriangle,
    tone: "amber",
    points: [9, 20, 14, 23, 17, 31, 25, 37],
  },
  {
    label: "Out of Stock",
    value: "0",
    change: "Current stock",
    icon: Boxes,
    tone: "red",
    points: [10, 15, 13, 18, 17, 26, 23, 36],
  },
  {
    label: "Inventory Turnover",
    value: "N/A",
    change: "Dataset-based",
    icon: BarChart3,
    tone: "blue",
    points: [8, 19, 14, 24, 18, 27, 24, 35],
  },
];

function KpiGrid({ totalProducts }: { totalProducts: number }) {
  const [products, setProducts] = useState<BackendProduct[]>([]);

  useEffect(() => {
    apiGet<BackendProduct[]>("/products")
      .then((data) => setProducts(data))
      .catch((error) => {
        console.error("Failed to load KPI data:", error);
      });
  }, []);

  const inventoryValue = products.reduce(
    (total, product) =>
      total + product.current_stock * product.unit_price,
    0,
  );

  const lowStockItems = products.filter(
    (product) => product.current_stock > 0 &&
      product.current_stock <= product.reorder_level,
  ).length;

  const outOfStockItems = products.filter(
    (product) => product.current_stock === 0,
  ).length;

  const kpiValues: Record<string, string> = {
    "Total Products": totalProducts.toLocaleString(),
    "Inventory Value": `$${inventoryValue.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`,
    "Low Stock Items": lowStockItems.toLocaleString(),
    "Out of Stock": outOfStockItems.toLocaleString(),
    "Inventory Turnover": "N/A",
  };

  return (
    <div className="kpi-grid">
      {kpis.map((kpi, index) => (
        <motion.div
          className="kpi-card"
          key={kpi.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
        >
          <div className="kpi-top">
            <span>{kpi.label}</span>
            <div className={`kpi-icon ${kpi.tone}`}>
              <kpi.icon size={17} />
            </div>
          </div>

          <strong>
            {kpiValues[kpi.label] ?? kpi.value}
          </strong>

          <div className="kpi-bottom">
            <span className="positive">
              <ArrowUpRight size={12} />
              {kpi.change}
            </span>
            <small>
              {kpi.label === "Inventory Turnover"
                ? "Not available in dataset"
                : "From public dataset"}
            </small>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
function MiniSparkline({ points, tone }: { points: number[]; tone: string }) {
  return (
    <div className={`mini-sparkline spark-${tone}`}>
      {points.map((point, index) => (
        <i key={index} style={{ height: `${point}px` }} />
      ))}
    </div>
  );
}

function Card({
  title,
  children,
  className = "",
  action,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={`card ${className}`}>
      <div className="card-header">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function HealthCard() {
  const [products, setProducts] = useState<BackendProduct[]>([]);

  useEffect(() => {
    apiGet<BackendProduct[]>("/products")
      .then((data) => setProducts(data))
      .catch((error) => {
        console.error("Failed to load health data:", error);
      });
  }, []);

  const totalProducts = products.length;

  const healthyProducts = products.filter(
    (product) => product.current_stock > product.reorder_level,
  ).length;

  const stockAvailability =
    totalProducts > 0
      ? Math.round((healthyProducts / totalProducts) * 100)
      : 0;

  const healthMetrics = [
    {
      label: "Stock Availability",
      value: `${stockAvailability}%`,
      tone: stockAvailability >= 80 ? "green" : "amber",
      width: `${stockAvailability}%`,
    },
    {
      label: "Demand Accuracy",
      value: "N/A",
      tone: "amber",
      width: "0%",
    },
    {
      label: "Turnover Efficiency",
      value: "N/A",
      tone: "green",
      width: "0%",
    },
    {
      label: "Supply Reliability",
      value: "N/A",
      tone: "green",
      width: "0%",
    },
  ];

  return (
    <Card title="Inventory Health Score" className="health-card">
      <div className="health-content">
        <div className="score-ring">
          <div>
            <strong>{stockAvailability}</strong>
            <span>/100</span>
          </div>
        </div>

        <div className="health-bars">
          {healthMetrics.map((metric) => (
            <div className="health-bar" key={metric.label}>
              <div>
                <span>{metric.label}</span>
                <b>{metric.value}</b>
              </div>

              <div className="bar-track">
                {metric.value !== "N/A" && (
                  <i
                    className={metric.tone}
                    style={{ width: metric.width }}
                  />
                )}
              </div>
            </div>
          ))}

          <div className="healthy-label">
            <span>✓</span>
            {stockAvailability >= 80 ? "Healthy" : "Needs Attention"}
          </div>
        </div>
      </div>
    </Card>
  );
}
function TrendCard() {
  type DatasetTransaction = {
    id: number;
    product_id: number;
    user_id: number | null;
    type: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    notes: string | null;
    transaction_date: string;
  };

  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [transactions, setTransactions] = useState<DatasetTransaction[]>([]);

  useEffect(() => {
    Promise.all([
      apiGet<BackendProduct[]>("/products"),
      apiGet<DatasetTransaction[]>("/transactions"),
    ])
      .then(([productData, transactionData]) => {
        setProducts(productData);
        setTransactions(transactionData);
      })
      .catch((error) => {
        console.error("Failed to load trend data:", error);
      });
  }, []);

  const inventoryValue = products.reduce(
    (total, product) =>
      total + product.current_stock * product.unit_price,
    0,
  );

  const salesByDate = new Map<string, number>();

  transactions.forEach((transaction) => {
    const dateValue = transaction.transaction_date;

    if (!dateValue) return;

    const dateMatch = String(dateValue).match(/\d{4}-\d{2}-\d{2}/);

    if (!dateMatch) return;

    const date = dateMatch[0];

    const transactionType = String(transaction.type || "").toLowerCase();

    if (
      transactionType !== "sale" &&
      transactionType !== "sales"
    ) {
      return;
    }

    const salesValue =
      Number(transaction.quantity || 0) *
      Number(transaction.unit_price || 0);

    salesByDate.set(
      date,
      (salesByDate.get(date) || 0) + salesValue,
    );
  });

  const sortedDates = Array.from(salesByDate.keys()).sort();

  const recentDates = sortedDates.slice(-30);

  const chartData = recentDates.map((date) => ({
    day: new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: Math.round(inventoryValue / 1000),
    sales: Math.round((salesByDate.get(date) || 0) / 1000),
  }));

  return (
    <Card
      title="Inventory Value Trend"
      className="trend-card"
      action={
        <div className="chart-tabs">
          <button>7D</button>
          <button className="selected">30D</button>
          <button>90D</button>
          <button>1Y</button>
        </div>
      }
    >
      <div className="chart-legend">
        <span>
          <i className="dot green-dot" />
          Inventory Value
        </span>

        <span>
          <i className="dot blue-dot" />
          Sales
        </span>

        <span style={{ opacity: 0.5 }}>
          <i className="dot purple-dot" />
          Purchases N/A
        </span>
      </div>

      <div className="trend-chart">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="greenFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#48d597"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor="#48d597"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#263141"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                tick={{ fill: "#8390a5", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />

              <YAxis
                tick={{ fill: "#8390a5", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}K`}
                domain={[0, "auto"]}
              />

              <Tooltip
                contentStyle={{
                  background: "#111a27",
                  border: "1px solid #2a394e",
                  borderRadius: 10,
                  color: "#fff",
                }}
                formatter={(value, name) => {
                  if (name === "value") {
                    return [
                      `$${Number(value ?? 0)}K`,
                      "Inventory Value",
                    ];
                  }

                  return [
                    `$${Number(value ?? 0)}K`,
                    "Sales",
                  ];
                }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#48d597"
                fill="url(#greenFill)"
                strokeWidth={2}
              />

              <Line
                type="monotone"
                dataKey="sales"
                stroke="#5487fa"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8390a5",
              fontSize: 13,
            }}
          >
            Loading sales data...
          </div>
        )}
      </div>
    </Card>
  );
}
function ActivityCard({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  type DatasetTransaction = {
    id: number;
    product_id: number;
    user_id: number | null;
    type: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    notes: string | null;
    transaction_date: string;
  };

  const [transactions, setTransactions] = useState<DatasetTransaction[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);

  useEffect(() => {
    Promise.all([
      apiGet<DatasetTransaction[]>("/transactions"),
      apiGet<BackendProduct[]>("/products"),
    ])
      .then(([transactionData, productData]) => {
        setTransactions(transactionData);
        setProducts(productData);
      })
      .catch((error) => {
        console.error("Failed to load activity data:", error);
      });
  }, []);

  const productMap = new Map(
    products.map((product) => [product.id, product]),
  );

  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const dateA = new Date(a.transaction_date).getTime();
      const dateB = new Date(b.transaction_date).getTime();

      if (dateB !== dateA) {
        return dateB - dateA;
      }

      return b.id - a.id;
    })
    .slice(0, 5);

  const formatDate = (dateValue: string) => {
    const dateMatch = String(dateValue).match(
      /\d{4}-\d{2}-\d{2}/,
    );

    if (!dateMatch) return "Dataset";

    return new Date(
      `${dateMatch[0]}T00:00:00`,
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card
      title="Recent Activity"
      className="activity-card"
      action={
        <span className="live-label">
          <i />
          Dataset
        </span>
      }
    >
      <div className="activity-list">
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction, index) => {
            const product = productMap.get(transaction.product_id);

            return (
              <motion.div
                className="activity-row"
                key={transaction.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="activity-icon blue">
                  <Activity size={14} />
                </div>

                <div>
                  <strong>
                    {transaction.type === "Sale"
                      ? "Product sold"
                      : transaction.type}
                  </strong>

                  <span>
                    {product?.name ||
                      `Product #${transaction.product_id}`}
                  </span>
                </div>

                <time>
                  {formatDate(transaction.transaction_date)}
                </time>
              </motion.div>
            );
          })
        ) : (
          <div
            style={{
              padding: "24px 0",
              textAlign: "center",
              color: "#8390a5",
              fontSize: 13,
            }}
          >
            Loading activity...
          </div>
        )}
      </div>

      <button
  className="view-link"
  onClick={() => onNavigate("Transactions")}
>
  View all activity <ArrowRight size={14} />
</button>
    </Card>
  );
}
function StatusCard() {
  const [products, setProducts] = useState<BackendProduct[]>([]);

  useEffect(() => {
    apiGet<BackendProduct[]>("/products")
      .then((data) => setProducts(data))
      .catch((error) => {
        console.error("Failed to load status data:", error);
      });
  }, []);

  const totalProducts = products.length;

  const healthyCount = products.filter(
    (product) => product.current_stock > product.reorder_level,
  ).length;

  const lowStockCount = products.filter(
    (product) =>
      product.current_stock > 0 &&
      product.current_stock <= product.reorder_level,
  ).length;

  const outOfStockCount = products.filter(
    (product) => product.current_stock === 0,
  ).length;

  const criticalCount = 0;

  const getPercent = (value: number) =>
    totalProducts > 0
      ? ((value / totalProducts) * 100).toFixed(1)
      : "0.0";

  const status = [
    {
      label: "Healthy",
      value: healthyCount,
      percent: getPercent(healthyCount),
      color: "#48d597",
    },
    {
      label: "Low Stock",
      value: lowStockCount,
      percent: getPercent(lowStockCount),
      color: "#f5aa38",
    },
    {
      label: "Critical",
      value: criticalCount,
      percent: getPercent(criticalCount),
      color: "#ee5b62",
    },
    {
      label: "Out of Stock",
      value: outOfStockCount,
      percent: getPercent(outOfStockCount),
      color: "#a878f6",
    },
  ];

  return (
    <Card title="Stock Status Overview" className="status-card">
      <div className="status-content">
        <div className="donut-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={status.filter((item) => item.value > 0)}
                dataKey="value"
                innerRadius={48}
                outerRadius={74}
                startAngle={90}
                endAngle={-270}
                paddingAngle={1}
                stroke="#101824"
                strokeWidth={2}
              >
                {status
                  .filter((item) => item.value > 0)
                  .map((entry) => (
                    <Cell
                      key={entry.label}
                      fill={entry.color}
                    />
                  ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="donut-center">
            <strong>{totalProducts.toLocaleString()}</strong>
            <span>Products</span>
          </div>
        </div>

        <div className="status-legend">
          {status.map((item) => (
            <div key={item.label}>
              <span>
                <i style={{ background: item.color }} />
                {item.label}
              </span>

              <b>
                {item.label === "Critical"
                  ? "N/A"
                  : item.value.toLocaleString()}{" "}
                <small>
                  {item.label === "Critical"
                    ? "(not available)"
                    : `(${item.percent}%)`}
                </small>
              </b>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
function CategoriesCard() {
  type DatasetCategory = {
    id: number;
    name: string;
  };

  type ProductWithCategory = BackendProduct & {
    category_id?: number;
  };

  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<DatasetCategory[]>([]);

  useEffect(() => {
    Promise.all([
      apiGet<BackendProduct[]>("/products"),
      apiGet<DatasetCategory[]>("/categories"),
    ])
      .then(([productData, categoryData]) => {
        setProducts(productData as ProductWithCategory[]);
        setCategories(categoryData);
      })
      .catch((error) => {
        console.error("Failed to load category data:", error);
      });
  }, []);

  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  const categoryValues = new Map<string, number>();

  products.forEach((product) => {
    const categoryName =
      categoryMap.get(product.category_id ?? 0) || "Unknown";

    const value =
      Number(product.current_stock || 0) *
      Number(product.unit_price || 0);

    categoryValues.set(
      categoryName,
      (categoryValues.get(categoryName) || 0) + value,
    );
  });

  const categoryData = Array.from(categoryValues.entries())
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const highestValue =
    categoryData.length > 0 ? categoryData[0].value : 1;

  const categoryColors = [
    "#48d597",
    "#5487fa",
    "#a878f6",
    "#f5aa38",
    "#ee5b62",
  ];

  return (
    <Card
      title="Top Categories by Value"
      className="categories-card"
    >
      <div className="category-list">
        {categoryData.length > 0 ? (
          categoryData.map((item, index) => (
            <div
              className="category-row"
              key={item.name}
            >
              <div>
                <span>{item.name}</span>
                <b>
                  ${Math.round(item.value).toLocaleString()}
                </b>
              </div>

              <div className="category-track">
                <i
                  style={{
                    width: `${(item.value / highestValue) * 100}%`,
                    background: categoryColors[index],
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <span
            style={{
              color: "#8390a5",
              fontSize: 13,
            }}
          >
            Loading category data...
          </span>
        )}
      </div>

      <button className="view-link">
        View full analytics <ArrowRight size={14} />
      </button>
    </Card>
  );
}
function SmartAlerts() {
  const [products, setProducts] = useState<BackendProduct[]>([]);

  useEffect(() => {
    apiGet<BackendProduct[]>("/products")
      .then((data) => setProducts(data))
      .catch((error) => {
        console.error("Failed to load alert data:", error);
      });
  }, []);

  const outOfStockCount = products.filter(
    (product) => product.current_stock === 0,
  ).length;

  const lowStockCount = products.filter(
    (product) =>
      product.current_stock > 0 &&
      product.current_stock <= product.reorder_level,
  ).length;

  const stockoutRiskCount = products.filter(
    (product) =>
      product.current_stock > 0 &&
      product.current_stock <= product.reorder_level,
  ).length;

  return (
    <Card
      title="Smart Alerts"
      className="smart-alerts"
      action={
        <button className="plain-link">
          View all <ArrowRight size={13} />
        </button>
      }
    >
      <div className="alert-list">
        <div className="alert-row critical">
          <AlertTriangle size={14} />
          <div>
            <strong>
              {outOfStockCount} products are out of stock
            </strong>
            <span>
              {outOfStockCount > 0
                ? "Immediate attention required"
                : "No products currently out of stock"}
            </span>
          </div>
        </div>

        <div className="alert-row warning">
          <AlertTriangle size={14} />
          <div>
            <strong>
              {lowStockCount} products are running low
            </strong>
            <span>
              {lowStockCount > 0
                ? "Reorder suggested"
                : "No low-stock products"}
            </span>
          </div>
        </div>

        <div className="alert-row warning">
          <Clock3 size={14} />
          <div>
            <strong>
              {stockoutRiskCount} products need attention
            </strong>
            <span>
              Based on current stock levels
            </span>
          </div>
        </div>

        <div className="alert-row info">
          <Truck size={14} />
          <div>
            <strong>Supplier data unavailable</strong>
            <span>
              Source dataset does not contain supplier information
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
function InsightCard({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  type DatasetTransaction = {
    id: number;
    product_id: number;
    user_id: number | null;
    type: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    notes: string | null;
    transaction_date: string;
  };

  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [transactions, setTransactions] = useState<DatasetTransaction[]>([]);

  useEffect(() => {
    Promise.all([
      apiGet<BackendProduct[]>("/products"),
      apiGet<DatasetTransaction[]>("/transactions"),
    ])
      .then(([productData, transactionData]) => {
        setProducts(productData);
        setTransactions(transactionData);
      })
      .catch((error) => {
        console.error("Failed to load insight data:", error);
      });
  }, []);

  const salesTransactions = transactions.filter(
    (transaction) =>
      String(transaction.type).toLowerCase() === "sale",
  );

  const dates = Array.from(
    new Set(
      salesTransactions
        .map((transaction) => {
          const match = String(
            transaction.transaction_date,
          ).match(/\d{4}-\d{2}-\d{2}/);

          return match ? match[0] : null;
        })
        .filter(Boolean),
    ),
  ).sort();

  const recentDates = dates.slice(-7);

  const recentSales = salesTransactions.filter((transaction) => {
    const match = String(
      transaction.transaction_date,
    ).match(/\d{4}-\d{2}-\d{2}/);

    return match && recentDates.includes(match[0]);
  });

  const salesByProduct = new Map<number, number>();

  recentSales.forEach((transaction) => {
    salesByProduct.set(
      transaction.product_id,
      (salesByProduct.get(transaction.product_id) || 0) +
        Number(transaction.quantity || 0),
    );
  });

  const stockoutRiskCount = products.filter((product) => {
    const unitsSold = salesByProduct.get(product.id) || 0;

    if (unitsSold <= 0) return false;

    const days = recentDates.length || 1;
    const dailyDemand = unitsSold / days;

    const stockCoverage =
      product.current_stock / dailyDemand;

    return stockCoverage <= 7;
  }).length;

  return (
    <Card title="AI Insight" className="insight-card">
      <Sparkles className="insight-spark" size={34} />

      <p>
        Based on recent sales activity,{" "}
        <strong>{stockoutRiskCount} products</strong> may
        face stockout risk within the next 7 days.
      </p>

      <button
        className="purple-button"
        onClick={() => onNavigate("Forecasting")}
      >
        View Predictions <ArrowRight size={14} />
      </button>
    </Card>
  );
}

function SummaryCard() {
  type DatasetTransaction = {
    id: number;
    product_id: number;
    user_id: number | null;
    type: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    notes: string | null;
    transaction_date: string;
  };

  const [transactions, setTransactions] = useState<DatasetTransaction[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);

  useEffect(() => {
    Promise.all([
      apiGet<DatasetTransaction[]>("/transactions"),
      apiGet<BackendProduct[]>("/products"),
    ])
      .then(([transactionData, productData]) => {
        setTransactions(transactionData);
        setProducts(productData);
      })
      .catch((error) => {
        console.error("Failed to load summary data:", error);
      });
  }, []);

  const salesTransactions = transactions.filter(
    (transaction) =>
      String(transaction.type).toLowerCase() === "sale",
  );

  const totalSales = salesTransactions.reduce(
    (total, transaction) =>
      total + Number(transaction.total_amount || 0),
    0,
  );

  const totalTransactions = transactions.length;

  const averageSaleValue =
    salesTransactions.length > 0
      ? totalSales / salesTransactions.length
      : 0;

  const summaryStats = [
    {
      label: "Sales",
      value: `$${Math.round(totalSales).toLocaleString()}`,
      change: "Dataset total",
    },
    {
      label: "Purchases",
      value: "N/A",
      change: "Not available",
    },
    {
      label: "Products",
      value: products.length.toLocaleString(),
      change: "Current catalog",
    },
    {
      label: "Transactions",
      value: totalTransactions.toLocaleString(),
      change: "Dataset total",
    },
    {
      label: "Avg. Sale Value",
      value: `$${averageSaleValue.toFixed(2)}`,
      change: "Calculated",
    },
    {
      label: "Gross Profit",
      value: "N/A",
      change: "Cost data unavailable",
    },
  ];

  return (
    <section className="summary-card">
      <div>
        <span>Dataset Summary</span>
        <h2>Inventory operations overview</h2>
      </div>

      {summaryStats.map((stat) => (
        <div className="summary-stat" key={stat.label}>
          <small>{stat.label}</small>

          <strong>{stat.value}</strong>

          <span>
            {stat.change}
          </span>
        </div>
      ))}

      <div className="summary-visual">
        <Package size={58} />
      </div>
    </section>
  );
}

function Toolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onAction,
}: {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: "All statuses" | InventoryStatus;
  setStatusFilter: (value: "All statuses" | InventoryStatus) => void;
  onAction: (action: string) => void;
}) {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All statuses");
    setMoreFiltersOpen(false);
  };

  const applyStatusFilter = (
    value: "All statuses" | InventoryStatus,
  ) => {
    setStatusFilter(value);
    setMoreFiltersOpen(false);
  };

  return (
    <div className="toolbar">
      <div className="table-search">
        <Search size={16} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search inventory..."
        />
      </div>

      <select
        value={statusFilter}
        onChange={(event) =>
          setStatusFilter(
            event.target.value as "All statuses" | InventoryStatus,
          )
        }
      >
        <option>All statuses</option>
        <option>Healthy</option>
        <option>Low Stock</option>
        <option>Critical</option>
        <option>Out of Stock</option>
      </select>

      <div className="more-filters-wrapper">
        <button
          className="filter-button"
          onClick={() => setMoreFiltersOpen((open) => !open)}
        >
          <Filter size={15} />
          More filters
          <ChevronDown
            size={14}
            style={{
              transform: moreFiltersOpen
                ? "rotate(180deg)"
                : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>

        {moreFiltersOpen && (
          <div className="more-filters-menu">
            <div className="more-filters-title">
              Filter inventory
            </div>

            <button
              onClick={() =>
                applyStatusFilter("All statuses")
              }
            >
              <span>All products</span>
              {statusFilter === "All statuses" && <Check size={14} />}
            </button>

            <button
              onClick={() =>
                applyStatusFilter("Healthy")
              }
            >
              <span>Healthy stock</span>
              {statusFilter === "Healthy" && <Check size={14} />}
            </button>

            <button
              onClick={() =>
                applyStatusFilter("Low Stock")
              }
            >
              <span>Low stock</span>
              {statusFilter === "Low Stock" && <Check size={14} />}
            </button>

            <button
              onClick={() =>
                applyStatusFilter("Critical")
              }
            >
              <span>Critical stock</span>
              {statusFilter === "Critical" && <Check size={14} />}
            </button>

            <button
              onClick={() =>
                applyStatusFilter("Out of Stock")
              }
            >
              <span>Out of stock</span>
              {statusFilter === "Out of Stock" && <Check size={14} />}
            </button>

            <div className="more-filters-divider" />

            <button
              className="clear-filter-option"
              onClick={clearFilters}
            >
              <span>Clear all filters</span>
            </button>
          </div>
        )}
      </div>

      <button
        className="primary-button"
        onClick={() => onAction("Add Product")}
      >
        <Plus size={15} />
        Add Product
      </button>
    </div>
  );
}

function InventoryPage({
  products: filtered,
  totalUnits,
  inventoryValue,
  needsAttention,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onAction,
}: {
  products: Product[];
  totalUnits: number;
  inventoryValue: number;
  needsAttention: number;
  search: string;
  setSearch: (value: string) => void;
  statusFilter: "All statuses" | InventoryStatus;
  setStatusFilter: (value: "All statuses" | InventoryStatus) => void;
  onAction: (action: string) => void;
}) {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Workspace / Inventory"
        title="Inventory"
        subtitle="Manage stock levels, availability, and inventory value."
      />

      <div className="inventory-summary">
        <div>
          <span>Total units</span>
          <strong>{totalUnits.toLocaleString()}</strong>
          <small className="positive">From public dataset</small>
        </div>

        <div>
          <span>Inventory value</span>
          <strong>
            $
            {inventoryValue.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </strong>
          <small className="positive">Calculated from current stock</small>
        </div>

        <div>
          <span>Needs attention</span>
          <strong>{needsAttention}</strong>
          <small className="negative">Based on current stock levels</small>
        </div>

        <div>
          <span>Avg. stock age</span>
          <strong>N/A</strong>
          <small>Not available in dataset</small>
        </div>
      </div>

      <Card
        title="All inventory"
        action={
          <span className="muted-count">
            {filtered.length} of {filtered.length} products
          </span>
        }
      >
        <Toolbar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onAction={onAction}
        />

        <InventoryTable products={filtered} />
      </Card>
    </div>
  );
}
function InventoryTable({ products: rows }: { products: Product[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 30;

  const totalPages = Math.ceil(rows.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [rows.length]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const visibleRows = rows.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>
              <input type="checkbox" />
            </th>
            <th>Product</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Available</th>
            <th>Unit price</th>
            <th>Inventory value</th>
            <th>Status</th>
            <th>Updated</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {visibleRows.map((product) => (
            <tr key={product.id}>
              <td>
                <input type="checkbox" />
              </td>

              <td>
                <div className="product-cell">
                  <div className="product-thumb">
                    <Package size={16} />
                  </div>

                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.supplier}</span>
                  </div>
                </div>
              </td>

              <td className="mono">{product.sku}</td>

              <td>{product.category}</td>

              <td>
                <strong>{product.stock}</strong>
                <span className="table-muted">
                  {" "}
                  / {product.reorderLevel} min
                </span>
              </td>

              <td>{product.stock - product.reserved}</td>

              <td>${product.price.toFixed(2)}</td>

              <td>
                <strong>
                  $
                  {(product.stock * product.price).toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 0,
                    },
                  )}
                </strong>
              </td>

              <td>
                <span
                  className={`status-badge ${statusClasses[product.status]}`}
                >
                  <i />
                  {product.status}
                </span>
              </td>

              <td className="table-muted">{product.updated}</td>

              <td>
                <button className="more-button">
                  <MoreHorizontal size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="empty-state">
          <Package size={28} />
          <strong>No products found</strong>
          <span>Try adjusting your search or filters.</span>
        </div>
      )}

      <div className="table-footer">
        <span>
          Showing{" "}
          {rows.length === 0
            ? "0"
            : `${startIndex + 1}–${Math.min(endIndex, rows.length)}`}{" "}
          of {rows.length}
        </span>

        <div>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={currentPage === page ? "page-active" : ""}
              >
                {page}
              </button>
            ),
          )}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductsPage({
  products: rows,
  onAction,
}: {
  products: Product[];
  onAction: (action: string) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(rows.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [rows.length]);

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const visibleRows = rows.slice(
    startIndex,
    endIndex,
  );

  const goToPage = (page: number) => {
    setCurrentPage(
      Math.max(
        1,
        Math.min(page, totalPages),
      ),
    );

    setOpenMenuId(null);
  };

  const startItem =
    rows.length === 0
      ? 0
      : startIndex + 1;

  const endItem = Math.min(
    endIndex,
    rows.length,
  );

  const handleCopySku = async (
    product: Product,
  ) => {
    try {
      await navigator.clipboard.writeText(
        product.sku,
      );

      setOpenMenuId(null);
      alert(`SKU copied: ${product.sku}`);
    } catch (error) {
      console.error(
        "Failed to copy SKU:",
        error,
      );
    }
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Workspace / Catalog"
        title="Products"
        subtitle="Your product catalog, enriched with inventory intelligence."
        action={
          <button
            className="primary-button"
            onClick={() =>
              onAction("Add Product")
            }
          >
            <Plus size={15} />
            Add Product
          </button>
        }
      />

      <div className="product-grid">
        {visibleRows.map((product) => (
          <motion.div
            className="product-card"
            key={product.id}
            whileHover={{ y: -3 }}
          >
            <div className="product-card-top">
              <div className="large-thumb">
                <Package size={29} />
              </div>

              <div className="product-menu-wrapper">
                <button
                  className="more-button"
                  onClick={() =>
                    setOpenMenuId(
                      openMenuId === product.id
                        ? null
                        : product.id,
                    )
                  }
                >
                  <MoreHorizontal size={17} />
                </button>

                {openMenuId === product.id && (
                  <div className="product-menu">
                    <button
                      onClick={() => {
                        setSelectedProduct(
                          product,
                        );
                        setOpenMenuId(null);
                      }}
                    >
                      <Package size={14} />
                      View details
                    </button>

                    <button
                      onClick={() =>
                        handleCopySku(product)
                      }
                    >
                      <Copy size={14} />
                      Copy SKU
                    </button>
                  </div>
                )}
              </div>
            </div>

            <span
              className={`status-badge ${
                statusClasses[
                  product.status
                ]
              }`}
            >
              <i />
              {product.status}
            </span>

            <h3>{product.name}</h3>

            <p>
              {product.sku} ·{" "}
              {product.category}
            </p>

            <div className="product-card-meta">
              <div>
                <small>
                  Current stock
                </small>

                <strong>
                  {product.stock}
                </strong>
              </div>

              <div>
                <small>
                  Unit price
                </small>

                <strong>
                  $
                  {product.price.toFixed(
                    2,
                  )}
                </strong>
              </div>

              <div>
                <small>
                  Supplier
                </small>

                <strong>
                  {product.supplier}
                </strong>
              </div>
            </div>

            <button
              className="card-link"
              onClick={() =>
                setSelectedProduct(product)
              }
            >
              View product{" "}
              <ArrowRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {rows.length > 0 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {startItem}–{endItem} of{" "}
            {rows.length}
          </span>

          <div className="pagination-controls">
            <button
              className="pagination-button"
              disabled={currentPage === 1}
              onClick={() =>
                goToPage(currentPage - 1)
              }
            >
              Previous
            </button>

            {Array.from(
              {
                length: totalPages,
              },
              (_, index) => index + 1,
            ).map((page) => (
              <button
                key={page}
                className={`pagination-number ${
                  currentPage === page
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goToPage(page)
                }
              >
                {page}
              </button>
            ))}

            <button
              className="pagination-button"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                goToPage(currentPage + 1)
              }
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div
          className="product-details-overlay"
          onClick={() =>
            setSelectedProduct(null)
          }
        >
          <div
            className="product-details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="product-details-header">
              <div>
                <span>
                  Product details
                </span>

                <h2>
                  {selectedProduct.name}
                </h2>
              </div>

              <button
                className="more-button"
                onClick={() =>
                  setSelectedProduct(null)
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="product-details-grid">
              <div>
                <small>SKU</small>
                <strong>
                  {selectedProduct.sku}
                </strong>
              </div>

              <div>
                <small>Category</small>
                <strong>
                  {selectedProduct.category}
                </strong>
              </div>

              <div>
                <small>Status</small>
                <strong>
                  {selectedProduct.status}
                </strong>
              </div>

              <div>
                <small>Current stock</small>
                <strong>
                  {selectedProduct.stock}
                </strong>
              </div>

              <div>
                <small>Reorder level</small>
                <strong>
                  {selectedProduct.reorderLevel}
                </strong>
              </div>

              <div>
                <small>Unit price</small>
                <strong>
                  $
                  {selectedProduct.price.toFixed(
                    2,
                  )}
                </strong>
              </div>

              <div>
                <small>Supplier</small>
                <strong>
                  {selectedProduct.supplier}
                </strong>
              </div>

              <div>
                <small>Updated</small>
                <strong>
                  {selectedProduct.updated}
                </strong>
              </div>
            </div>

            <button
              className="primary-button"
              onClick={() =>
                setSelectedProduct(null)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionsPage({
  onAction,
}: {
  onAction: (action: string) => void;
}) {
  type BackendTransaction = {
    id: number;
    product_id: number;
    user_id: number | null;
    type: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    notes: string | null;
    transaction_date: string;
  };

  type BackendProduct = {
    id: number;
    name: string;
    sku: string;
  };

  const [transactionData, setTransactionData] =
    useState<BackendTransaction[]>([]);

  const [productData, setProductData] =
    useState<BackendProduct[]>([]);

  const [loading, setLoading] = useState(true);

  const [transactionSearch, setTransactionSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("All types");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 20;

  useEffect(() => {
    async function loadTransactions() {
      try {
        const [
          transactionsResponse,
          productsResponse,
        ] = await Promise.all([
          apiGet<BackendTransaction[]>(
            "/transactions",
          ),
          apiGet<BackendProduct[]>(
            "/products",
          ),
        ]);

        setTransactionData(
          transactionsResponse,
        );

        setProductData(productsResponse);
      } catch (error) {
        console.error(
          "Failed to load transactions:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  const productMap = new Map(
    productData.map((product) => [
      product.id,
      product,
    ]),
  );

  const getTransactionType = (
    type: string,
  ): TransactionType => {
    const normalized = type.toLowerCase();

    if (normalized === "sale")
      return "Sale";

    if (normalized === "purchase")
      return "Purchase";

    if (normalized === "return")
      return "Return";

    return "Adjustment";
  };

  /*
   * ---------------------------------------------------------
   * FILTER TRANSACTIONS
   * ---------------------------------------------------------
   */

  const filteredTransactions =
    transactionData.filter(
      (transaction) => {
        const product =
          productMap.get(
            transaction.product_id,
          );

        const searchValue =
          transactionSearch
            .trim()
            .toLowerCase();

        const matchesSearch =
          !searchValue ||
          String(transaction.id)
            .toLowerCase()
            .includes(searchValue) ||
          product?.name
            .toLowerCase()
            .includes(searchValue) ||
          product?.sku
            .toLowerCase()
            .includes(searchValue);

        const transactionType =
          getTransactionType(
            transaction.type,
          );

        const matchesType =
          typeFilter === "All types" ||
          transactionType === typeFilter;

        const transactionDate =
          transaction.transaction_date
            ?.split(" ")[0] || "";

        const matchesFromDate =
          !fromDate ||
          transactionDate >= fromDate;

        const matchesToDate =
          !toDate ||
          transactionDate <= toDate;

        return (
          matchesSearch &&
          matchesType &&
          matchesFromDate &&
          matchesToDate
        );
      },
    );

  /*
   * ---------------------------------------------------------
   * PAGINATION
   * ---------------------------------------------------------
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredTransactions.length /
        itemsPerPage,
    ),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    transactionSearch,
    typeFilter,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const visibleTransactions =
    filteredTransactions.slice(
      startIndex,
      endIndex,
    );

  const startItem =
    filteredTransactions.length === 0
      ? 0
      : startIndex + 1;

  const endItem = Math.min(
    endIndex,
    filteredTransactions.length,
  );

  const goToPage = (page: number) => {
    setCurrentPage(
      Math.max(
        1,
        Math.min(page, totalPages),
      ),
    );
  };

  /*
   * ---------------------------------------------------------
   * KPI VALUES
   * ---------------------------------------------------------
   */

  const totalTransactions =
    transactionData.length;

  const unitsSold =
    transactionData
      .filter(
        (transaction) =>
          transaction.type.toLowerCase() ===
          "sale",
      )
      .reduce(
        (sum, transaction) =>
          sum +
          Math.abs(transaction.quantity),
        0,
      );

  /*
   * ---------------------------------------------------------
   * CLEAR FILTERS
   * ---------------------------------------------------------
   */

  const clearFilters = () => {
    setTransactionSearch("");
    setTypeFilter("All types");
    setFromDate("");
    setToDate("");
  };

  const hasFilters =
    transactionSearch ||
    typeFilter !== "All types" ||
    fromDate ||
    toDate;

  /*
   * ---------------------------------------------------------
   * EXPORT CSV
   * ---------------------------------------------------------
   */

  const exportTransactions = () => {
    if (
      filteredTransactions.length === 0
    ) {
      alert(
        "There are no transactions to export.",
      );
      return;
    }

    const header = [
      "Transaction ID",
      "Product",
      "SKU",
      "Type",
      "Quantity",
      "Unit Price",
      "Total Amount",
      "Date",
      "User",
    ];

    const rows =
      filteredTransactions.map(
        (transaction) => {
          const product =
            productMap.get(
              transaction.product_id,
            );

          const type =
            getTransactionType(
              transaction.type,
            );

          return [
            transaction.id,
            product?.name ||
              `Product #${transaction.product_id}`,
            product?.sku || "N/A",
            type,
            transaction.quantity,
            transaction.unit_price.toFixed(
              2,
            ),
            Math.abs(
              transaction.total_amount,
            ).toFixed(2),
            transaction.transaction_date,
            transaction.user_id
              ? `User #${transaction.user_id}`
              : "Dataset",
          ];
        },
      );

    const csvContent = [
      header,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
              /"/g,
              '""',
            )}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "InventoryIQ_Transactions.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="page">
      <PageHeader
        eyebrow="Workspace / Operations"
        title="Transactions"
        subtitle="Track every movement across your inventory."
        action={
          <button
            className="primary-button"
            onClick={() =>
              onAction(
                "Record Transaction",
              )
            }
          >
            <Plus size={15} />
            Record transaction
          </button>
        }
      />

      <div className="transaction-kpis">
        <div>
          <span>Total transactions</span>

          <strong>
            {totalTransactions.toLocaleString()}
          </strong>

          <small>
            From public inventory dataset
          </small>
        </div>

        <div>
          <span>Units sold</span>

          <strong>
            {unitsSold.toLocaleString()}
          </strong>

          <small>
            Based on recorded sales
          </small>
        </div>

        <div>
          <span>Units received</span>

          <strong>N/A</strong>

          <small>
            Not available in source data
          </small>
        </div>
      </div>

      <Card
        title="Transactions"
        action={
          <button
            className="filter-button"
            onClick={
              exportTransactions
            }
          >
            <Download size={15} />
            Export CSV
          </button>
        }
      >
        {/* FILTER BAR */}

        <div className="transaction-filters">
          <div className="table-search">
            <Search size={16} />

            <input
              value={transactionSearch}
              onChange={(event) =>
                setTransactionSearch(
                  event.target.value,
                )
              }
              placeholder="Search ID, product or SKU..."
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value,
              )
            }
          >
            <option>All types</option>
            <option>Sale</option>
            <option>Purchase</option>
            <option>Return</option>
            <option>Adjustment</option>
          </select>

          <div className="transaction-date-filter">
            <label>
              From
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(event) =>
                setFromDate(
                  event.target.value,
                )
              }
            />
          </div>

          <div className="transaction-date-filter">
            <label>
              To
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(event) =>
                setToDate(
                  event.target.value,
                )
              }
            />
          </div>

          {hasFilters && (
            <button
              className="filter-button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  Transaction ID
                </th>

                <th>Product</th>

                <th>Type</th>

                <th>Quantity</th>

                <th>Price</th>

                <th>Total</th>

                <th>Date</th>

                <th>User</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    Loading transactions...
                  </td>
                </tr>
              ) : visibleTransactions.length ===
                0 ? (
                <tr>
                  <td colSpan={8}>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                visibleTransactions.map(
                  (transaction) => {
                    const product =
                      productMap.get(
                        transaction.product_id,
                      );

                    const type =
                      getTransactionType(
                        transaction.type,
                      );

                    return (
                      <tr
                        key={
                          transaction.id
                        }
                      >
                        <td className="mono">
                          {transaction.id}
                        </td>

                        <td>
                          <div className="product-cell">
                            <div className="product-thumb">
                              <Package
                                size={15}
                              />
                            </div>

                            <div>
                              <strong>
                                {product?.name ||
                                  `Product #${transaction.product_id}`}
                              </strong>

                              <span>
                                {product?.sku ||
                                  "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`transaction-badge ${transactionClasses[type]}`}
                          >
                            {type}
                          </span>
                        </td>

                        <td>
                          {transaction.quantity >
                          0
                            ? "+"
                            : ""}

                          {
                            transaction.quantity
                          }
                        </td>

                        <td>
                          $
                          {transaction.unit_price.toFixed(
                            2,
                          )}
                        </td>

                        <td>
                          <strong>
                            $
                            {Math.abs(
                              transaction.total_amount,
                            ).toLocaleString(
                              undefined,
                              {
                                maximumFractionDigits: 2,
                              },
                            )}
                          </strong>
                        </td>

                        <td className="table-muted">
                          {
                            transaction.transaction_date
                          }
                        </td>

                        <td>
                          {transaction.user_id
                            ? `User #${transaction.user_id}`
                            : "Dataset"}
                        </td>
                      </tr>
                    );
                  },
                )
              )}
            </tbody>
          </table>

          <div className="table-footer">
            <span>
              Showing {startItem}–
              {endItem} of{" "}
              {filteredTransactions.length.toLocaleString()}
            </span>

            <div>
              <button
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  goToPage(
                    currentPage - 1,
                  )
                }
              >
                Previous
              </button>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) =>
                  index + 1,
              ).map((page) => (
                <button
                  key={page}
                  className={
                    currentPage === page
                      ? "page-active"
                      : ""
                  }
                  onClick={() =>
                    goToPage(page)
                  }
                >
                  {page}
                </button>
              ))}

              <button
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  goToPage(
                    currentPage + 1,
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AnalyticsPage() {
  type BackendTransaction = {
    id: number;
    product_id: number;
    user_id: number | null;
    type: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    notes: string | null;
    transaction_date: string;
  };

  type BackendProduct = {
    id: number;
    name: string;
    sku: string;
    category_id: number | null;
    unit_price: number;
    current_stock: number;
    reorder_level: number;
  };

  type BackendCategory = {
    id: number;
    name: string;
  };

  type AnalyticsRange =
    | "Full dataset"
    | "Last 90 days"
    | "Last 30 days";

  const [transactionData, setTransactionData] =
    useState<BackendTransaction[]>([]);

  const [productData, setProductData] =
    useState<BackendProduct[]>([]);

  const [categoryData, setCategoryData] =
    useState<BackendCategory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [analyticsRange, setAnalyticsRange] =
    useState<AnalyticsRange>("Full dataset");

  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        setLoading(true);

        const [
          transactions,
          products,
          categories,
        ] = await Promise.all([
          apiGet<BackendTransaction[]>(
            "/transactions",
          ),
          apiGet<BackendProduct[]>(
            "/products",
          ),
          apiGet<BackendCategory[]>(
            "/categories",
          ),
        ]);

        setTransactionData(transactions);
        setProductData(products);
        setCategoryData(categories);
      } catch (error) {
        console.error(
          "Failed to load analytics data:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalyticsData();
  }, []);

  const categoryMap = new Map(
    categoryData.map((category) => [
      category.id,
      category.name,
    ]),
  );

  const productMap = new Map(
    productData.map((product) => [
      product.id,
      product,
    ]),
  );

  /*
   * ---------------------------------------------------------
   * DATE RANGE
   * ---------------------------------------------------------
   */

  const allSalesTransactions =
    transactionData.filter(
      (transaction) =>
        transaction.type.toLowerCase() === "sale",
    );

  const latestDatasetDate =
    allSalesTransactions.length > 0
      ? Math.max(
          ...allSalesTransactions.map(
            (transaction) =>
              new Date(
                transaction.transaction_date,
              ).getTime(),
          ),
        )
      : 0;

  const rangeDays =
    analyticsRange === "Last 30 days"
      ? 30
      : analyticsRange === "Last 90 days"
        ? 90
        : null;

  const rangeStartDate =
    rangeDays !== null &&
    latestDatasetDate
      ? latestDatasetDate -
        (rangeDays - 1) *
          24 *
          60 *
          60 *
          1000
      : null;

  const salesTransactions =
    rangeStartDate !== null
      ? allSalesTransactions.filter(
          (transaction) =>
            new Date(
              transaction.transaction_date,
            ).getTime() >=
            rangeStartDate,
        )
      : allSalesTransactions;

  /*
   * ---------------------------------------------------------
   * SALES ACTIVITY
   * ---------------------------------------------------------
   */

  const trendMap = new Map<
    string,
    {
      day: string;
      sales: number;
      purchases: number;
    }
  >();

  salesTransactions.forEach(
    (transaction) => {
      const date =
        transaction.transaction_date?.split(
          " ",
        )[0] || "";

      if (!date) return;

      if (!trendMap.has(date)) {
        trendMap.set(date, {
          day: date,
          sales: 0,
          purchases: 0,
        });
      }

      trendMap.get(date)!.sales +=
        Math.abs(transaction.quantity);
    },
  );

 const trendData = Array.from(
  trendMap.values(),
)
  .sort((a, b) =>
    a.day.localeCompare(b.day),
  )
  .slice(
    analyticsRange === "Full dataset"
      ? -12
      : rangeDays === 30
        ? -30
        : -90,
  )
  .map((item) => ({
    ...item,
    day: new Date(
      item.day,
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  })); 

  /*
   * ---------------------------------------------------------
   * CATEGORY DISTRIBUTION
   *
   * For a selected range, category distribution is
   * calculated from sales value during that period.
   *
   * For Full dataset, it uses current inventory value.
   * ---------------------------------------------------------
   */

  const categoryTotals =
    new Map<string, number>();

  if (
    analyticsRange === "Full dataset"
  ) {
    productData.forEach((product) => {
      const category =
        categoryMap.get(
          product.category_id ?? -1,
        ) || "Uncategorized";

      const value =
        product.current_stock *
        product.unit_price;

      categoryTotals.set(
        category,
        (categoryTotals.get(category) ||
          0) + value,
      );
    });
  } else {
    salesTransactions.forEach(
      (transaction) => {
        const product =
          productMap.get(
            transaction.product_id,
          );

        if (!product) return;

        const category =
          categoryMap.get(
            product.category_id ?? -1,
          ) || "Uncategorized";

        const value =
          Math.abs(transaction.quantity) *
          transaction.unit_price;

        categoryTotals.set(
          category,
          (categoryTotals.get(category) ||
            0) + value,
        );
      },
    );
  }

  const categoryColors = [
    "#48d597",
    "#5487fa",
    "#a878f6",
    "#f5a742",
    "#ef6672",
  ];

  const categoryDistribution =
    Array.from(
      categoryTotals.entries(),
    )
      .map(
        ([name, value], index) => ({
          name,
          value,
          color:
            categoryColors[
              index %
                categoryColors.length
            ],
        }),
      )
      .sort(
        (a, b) => b.value - a.value,
      )
      .slice(0, 5);

  /*
   * ---------------------------------------------------------
   * CURRENT INVENTORY VALUE
   * ---------------------------------------------------------
   */

  const totalInventoryValue =
    productData.reduce(
      (sum, product) =>
        sum +
        product.current_stock *
          product.unit_price,
      0,
    );

  /*
   * ---------------------------------------------------------
   * TOP MOVERS
   * ---------------------------------------------------------
   */

  const moverMap = new Map<
    number,
    {
      product: BackendProduct;
      units: number;
    }
  >();

  salesTransactions.forEach(
    (transaction) => {
      const product =
        productMap.get(
          transaction.product_id,
        );

      if (!product) return;

      if (!moverMap.has(product.id)) {
        moverMap.set(product.id, {
          product,
          units: 0,
        });
      }

      moverMap.get(product.id)!.units +=
        Math.abs(transaction.quantity);
    },
  );

  const topMovers = Array.from(
    moverMap.values(),
  )
    .sort(
      (a, b) => b.units - a.units,
    )
    .slice(0, 5);

  /*
   * ---------------------------------------------------------
   * INVENTORY HEALTH
   *
   * Availability = current stock condition
   * Accuracy = sales activity in selected period
   * Turnover = selected-period demand/current stock
   * Reliability = stock availability
   * Velocity = selected-period sales velocity
   * ---------------------------------------------------------
   */

  const lowStockCount =
    productData.filter(
      (product) =>
        product.current_stock <=
        product.reorder_level,
    ).length;

  const healthyPercentage =
    productData.length > 0
      ? Math.round(
          ((productData.length -
            lowStockCount) /
            productData.length) *
            100,
        )
      : 0;

  const selectedSalesUnits =
    salesTransactions.reduce(
      (sum, transaction) =>
        sum +
        Math.abs(transaction.quantity),
      0,
    );

  const currentInventoryUnits =
    productData.reduce(
      (sum, product) =>
        sum + product.current_stock,
      0,
    );

  const salesTransactionRatio =
    transactionData.length > 0
      ? salesTransactions.length /
        transactionData.filter(
          (transaction) =>
            transaction.type
              .toLowerCase() === "sale",
        ).length
      : 0;

  const turnoverScore =
    currentInventoryUnits > 0
      ? Math.min(
          100,
          Math.round(
            (selectedSalesUnits /
              currentInventoryUnits) *
              10,
          ),
        )
      : 0;

  const velocityScore =
    productData.length > 0
      ? Math.min(
          100,
          Math.round(
            (selectedSalesUnits /
              Math.max(
                1,
                salesTransactions.length,
              )) *
              10,
          ),
        )
      : 0;

  const radarData = [
    {
      subject: "Availability",
      A: healthyPercentage,
    },
    {
      subject: "Accuracy",
      A: Math.min(
        100,
        Math.round(
          salesTransactionRatio * 100,
        ),
      ),
    },
    {
      subject: "Turnover",
      A: turnoverScore,
    },
    {
      subject: "Reliability",
      A: healthyPercentage,
    },
    {
      subject: "Velocity",
      A: velocityScore,
    },
  ];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Intelligence / Analytics"
        title="Inventory intelligence"
        subtitle="See the signals behind your stock performance."
        action={
          <select
            className="filter-button analytics-range-select"
            value={analyticsRange}
            onChange={(event) =>
              setAnalyticsRange(
                event.target.value as AnalyticsRange,
              )
            }
          >
            <option value="Full dataset">
              Full dataset
            </option>

            <option value="Last 90 days">
              Last 90 days
            </option>

            <option value="Last 30 days">
              Last 30 days
            </option>
          </select>
        }
      />

      {loading ? (
        <Card title="Loading analytics">
          <p>
            Loading data from the public
            inventory dataset...
          </p>
        </Card>
      ) : (
        <div className="analytics-grid">
          {/* SALES ACTIVITY */}

          <Card
            title="Sales activity"
            className="analytics-wide"
          >
            <div className="chart-legend">
              <span>
                <i className="dot blue-dot" />
                Sales
              </span>

              <span>
                <i className="dot purple-dot" />
                Purchases
              </span>
            </div>

            <div className="large-chart analytics-bar-chart">
              <ResponsiveContainer
                width="100%"
                height={300}
                minWidth={0}
              >
                <BarChart
                  data={trendData}
                  width={0}
                  height={300}
                >
                  <CartesianGrid
                    stroke="#263141"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    tick={{
                      fill: "#8390a5",
                      fontSize: 10,
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tick={{
                      fill: "#8390a5",
                      fontSize: 10,
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      background:
                        "#111a27",
                      border:
                        "1px solid #2a394e",
                      borderRadius: 10,
                    }}
                  />

                  <Bar
                    dataKey="sales"
                    fill="#5487fa"
                    radius={[
                      4,
                      4,
                      0,
                      0,
                    ]}
                    maxBarSize={22}
                  />

                  <Bar
                    dataKey="purchases"
                    fill="#a878f6"
                    radius={[
                      4,
                      4,
                      0,
                      0,
                    ]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* CATEGORY DISTRIBUTION */}

          <Card title="Category distribution">
            <div
              className="analytics-donut"
              style={{
                position: "relative",
                width: "100%",
                height: "240px",
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={
                        categoryDistribution
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={82}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {categoryDistribution.map(
                        (entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                          />
                        ),
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        `$${Number(
                          value ?? 0,
                        ).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 0,
                          },
                        )}`
                      }
                      contentStyle={{
                        background:
                          "#111a27",
                        border:
                          "1px solid #2a394e",
                        borderRadius: 10,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <strong>
                  $
                  {totalInventoryValue >=
                  1000000
                    ? `${(
                        totalInventoryValue /
                        1000000
                      ).toFixed(1)}M`
                    : `${(
                        totalInventoryValue /
                        1000
                      ).toFixed(1)}K`}
                </strong>

                <span>
                  Current inventory
                </span>
              </div>
            </div>

            <div className="mini-legend">
              {categoryDistribution.map(
                (item) => (
                  <span key={item.name}>
                    <i
                      style={{
                        background:
                          item.color,
                      }}
                    />

                    {item.name}
                  </span>
                ),
              )}
            </div>
          </Card>

          {/* INVENTORY HEALTH */}

          <Card title="Inventory health">
            <div className="radar-chart">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <RadarChart
                  data={radarData}
                >
                  <PolarGrid
                    stroke="#2a384a"
                  />

                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: "#98a4b7",
                      fontSize: 10,
                    }}
                  />

                  <Radar
                    dataKey="A"
                    stroke="#48d597"
                    fill="#48d597"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* TOP MOVERS */}

          <Card title="Top movers">
            <div className="movers-list">
              {topMovers.map(
                (item, index) => {
                  const category =
                    categoryMap.get(
                      item.product
                        .category_id ?? -1,
                    ) ||
                    "Uncategorized";

                  return (
                    <div
                      key={
                        item.product.id
                      }
                    >
                      <span className="rank">
                        {String(
                          index + 1,
                        ).padStart(2, "0")}
                      </span>

                      <div>
                        <strong>
                          {
                            item.product
                              .name
                          }
                        </strong>

                        <small>
                          {category}
                        </small>
                      </div>

                      <b className="positive">
                        {item.units.toLocaleString()}{" "}
                        sold
                      </b>
                    </div>
                  );
                },
              )}

              {topMovers.length === 0 && (
                <span
                  style={{
                    color: "#8390a5",
                    fontSize: 13,
                  }}
                >
                  No sales found for this
                  period.
                </span>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ForecastingPage() {
  type BackendTransaction = {
    id: number;
    product_id: number;
    user_id: number | null;
    type: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    notes: string | null;
    transaction_date: string;
  };

  type BackendProduct = {
    id: number;
    name: string;
    sku: string;
    category_id: number | null;
    supplier_id: number | null;
    unit_price: number;
    current_stock: number;
    reorder_level: number;
  };

  type ForecastRange = 7 | 30 | 90;

  const [transactionData, setTransactionData] = useState<
    BackendTransaction[]
  >([]);

  const [productData, setProductData] = useState<BackendProduct[]>([]);

  const [loading, setLoading] = useState(true);

  const [forecastRange, setForecastRange] =
    useState<ForecastRange>(7);

  useEffect(() => {
    async function loadForecastData() {
      try {
        setLoading(true);

        const [transactions, products] = await Promise.all([
          apiGet<BackendTransaction[]>("/transactions"),
          apiGet<BackendProduct[]>("/products"),
        ]);

        setTransactionData(transactions);
        setProductData(products);
      } catch (error) {
        console.error(
          "Failed to load forecasting data:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadForecastData();
  }, []);

  const salesTransactions = transactionData.filter(
    (transaction) =>
      transaction.type.toLowerCase() === "sale",
  );

  const dailySalesMap = new Map<string, number>();

  salesTransactions.forEach((transaction) => {
    const date =
      transaction.transaction_date?.split(" ")[0];

    if (!date) return;

    dailySalesMap.set(
      date,
      (dailySalesMap.get(date) || 0) +
        Math.abs(transaction.quantity),
    );
  });

  const sortedDates = Array.from(
    dailySalesMap.keys(),
  ).sort();

  const recentDates = sortedDates.slice(-7);

  const recentDailySales = recentDates.map((date) => ({
    day: new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    sales: dailySalesMap.get(date) || 0,
  }));

  const averageDailyDemand =
    recentDailySales.length > 0
      ? recentDailySales.reduce(
          (sum, item) => sum + item.sales,
          0,
        ) / recentDailySales.length
      : 0;

  const previousAverage =
    sortedDates.length >= 14
      ? sortedDates
          .slice(-14, -7)
          .reduce(
            (sum, date) =>
              sum + (dailySalesMap.get(date) || 0),
            0,
          ) / 7
      : averageDailyDemand;

  const demandChange =
    previousAverage > 0
      ? ((averageDailyDemand - previousAverage) /
          previousAverage) *
        100
      : 0;

  /*
   * ---------------------------------------------------------
   * FORECAST DATA
   * ---------------------------------------------------------
   */

  const forecastData = [
    ...recentDailySales.map((item) => ({
      day: item.day,
      historical: item.sales,
      predicted: undefined as number | undefined,
      upper: undefined as number | undefined,
      lower: undefined as number | undefined,
    })),

    ...Array.from(
      { length: forecastRange },
      (_, index) => {
        const predicted = Math.max(
          0,
          Math.round(
            averageDailyDemand *
              (1 +
                (demandChange / 100) *
                  ((index + 1) / forecastRange)),
          ),
        );

        return {
          day: `Day ${index + 1}`,
          historical: undefined as number | undefined,
          predicted,
          upper: Math.round(predicted * 1.2),
          lower: Math.max(
            0,
            Math.round(predicted * 0.8),
          ),
        };
      },
    ),
  ];

  /*
   * ---------------------------------------------------------
   * PRODUCT SALES
   * ---------------------------------------------------------
   */

  const productSalesMap = new Map<number, number>();

  salesTransactions.forEach((transaction) => {
    productSalesMap.set(
      transaction.product_id,
      (productSalesMap.get(transaction.product_id) || 0) +
        Math.abs(transaction.quantity),
    );
  });

  const totalDays =
    sortedDates.length > 0
      ? Math.max(
          1,
          Math.ceil(
            (new Date(
              sortedDates[sortedDates.length - 1],
            ).getTime() -
              new Date(sortedDates[0]).getTime()) /
              (1000 * 60 * 60 * 24),
          ) + 1,
        )
      : 1;

  /*
   * ---------------------------------------------------------
   * REORDER INTELLIGENCE
   * ---------------------------------------------------------
   */

  const reorderProducts = productData
    .map((product) => {
      const totalProductSales =
        productSalesMap.get(product.id) || 0;

      const dailyDemand =
        totalProductSales / totalDays;

      const predictedDemand = Math.max(
        1,
        Math.round(
          dailyDemand * forecastRange,
        ),
      );

      const daysOfCoverage =
        dailyDemand > 0
          ? product.current_stock / dailyDemand
          : Infinity;

      const stockoutRisk =
        product.current_stock <= 0
          ? "At risk now"
          : daysOfCoverage <= 7
            ? `${Math.max(
                1,
                Math.round(daysOfCoverage),
              )} days`
            : "Low risk";

      const suggestedOrder = Math.max(
        0,
        Math.ceil(
          dailyDemand * 14 -
            product.current_stock,
        ),
      );

      return {
        product,
        predictedDemand,
        stockoutRisk,
        suggestedOrder,
        daysOfCoverage,
      };
    })
    .filter(
      (item) =>
        item.product.current_stock <=
          item.product.reorder_level ||
        item.daysOfCoverage <= 14,
    )
    .sort(
      (a, b) =>
        a.daysOfCoverage -
        b.daysOfCoverage,
    )
    .slice(0, 4);

  /*
   * ---------------------------------------------------------
   * SUMMARY VALUES
   * ---------------------------------------------------------
   */

  const predictedDemand = Math.round(
    averageDailyDemand * forecastRange,
  );

  const previousPeriodDemand = Math.round(
    previousAverage * forecastRange,
  );

  const forecastChange =
    previousPeriodDemand > 0
      ? ((predictedDemand -
          previousPeriodDemand) /
          previousPeriodDemand) *
        100
      : 0;

  const totalCurrentStock =
    productData.reduce(
      (sum, product) =>
        sum + product.current_stock,
      0,
    );

  const expectedStockCoverage =
    averageDailyDemand > 0
      ? Math.round(
          totalCurrentStock /
            averageDailyDemand,
        )
      : 0;

  const atRiskProducts =
    productData.filter((product) => {
      const totalProductSales =
        productSalesMap.get(product.id) || 0;

      const dailyDemand =
        totalProductSales / totalDays;

      return (
        product.current_stock <= 0 ||
        (dailyDemand > 0 &&
          product.current_stock /
            dailyDemand <= 7)
      );
    }).length;

  /*
   * ---------------------------------------------------------
   * CREATE PURCHASE ORDER
   * ---------------------------------------------------------
   */

  const createPurchaseOrder = () => {
    if (reorderProducts.length === 0) {
      alert(
        "No products currently require reordering.",
      );
      return;
    }

    const header = [
      "Product",
      "SKU",
      "Current Stock",
      "Predicted Demand",
      "Suggested Order",
      "Supplier",
    ];

    const rows = reorderProducts.map(
      (item) => [
        item.product.name,
        item.product.sku,
        item.product.current_stock,
        item.predictedDemand,
        item.suggestedOrder,
        "N/A",
      ],
    );

    const csvContent = [
      header,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
              /"/g,
              '""',
            )}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `InventoryIQ_Purchase_Order_${forecastRange}Days.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="page">
      <PageHeader
        eyebrow="Intelligence / Forecasting"
        title="Demand forecasting"
        subtitle="A forward view of demand, stock coverage, and risk."
        action={
          <div className="chart-tabs page-tabs">
            <button
              className={
                forecastRange === 7
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setForecastRange(7)
              }
            >
              7 days
            </button>

            <button
              className={
                forecastRange === 30
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setForecastRange(30)
              }
            >
              30 days
            </button>

            <button
              className={
                forecastRange === 90
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setForecastRange(90)
              }
            >
              90 days
            </button>
          </div>
        }
      />

      <div className="forecast-banner">
        <div className="forecast-icon">
          <Sparkles size={21} />
        </div>

        <div>
          <strong>
            Demand forecast calculated
          </strong>

          <p>
            Forecast is calculated from
            historical sales in the public
            inventory dataset.
          </p>
        </div>

        <span className="preview-pill">
          Dataset-based
        </span>
      </div>

      {loading ? (
        <Card title="Loading forecast">
          <p>
            Loading historical sales and
            inventory data...
          </p>
        </Card>
      ) : (
        <>
          <div className="forecast-grid">
            <Card
              title="Historical & predicted demand"
              className="forecast-chart"
            >
              <div className="chart-legend">
                <span>
                  <i className="dot blue-dot" />
                  Historical demand
                </span>

                <span>
                  <i className="dot purple-dot" />
                  Predicted demand
                </span>

                <span>
                  <i className="confidence-line" />
                  Confidence range
                </span>
              </div>

              <div className="large-chart">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={forecastData}
                  >
                    <defs>
                      <linearGradient
                        id="confidence"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#a878f6"
                          stopOpacity={0.16}
                        />

                        <stop
                          offset="100%"
                          stopColor="#a878f6"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#263141"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="day"
                      tick={{
                        fill: "#8390a5",
                        fontSize: 10,
                      }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      tick={{
                        fill: "#8390a5",
                        fontSize: 10,
                      }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        background:
                          "#111a27",
                        border:
                          "1px solid #2a394e",
                        borderRadius: 10,
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="none"
                      fill="url(#confidence)"
                    />

                    <Area
                      type="monotone"
                      dataKey="lower"
                      stroke="none"
                      fill="#0d1520"
                    />

                    <Line
                      type="monotone"
                      dataKey="historical"
                      stroke="#5487fa"
                      strokeWidth={2.5}
                      dot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#a878f6"
                      strokeWidth={2.5}
                      strokeDasharray="5 4"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="forecast-side">
              <div className="forecast-stat">
                <span>
                  Predicted demand
                </span>

                <strong>
                  {predictedDemand.toLocaleString()}{" "}
                  units
                </strong>

                <small className="positive">
                  <ArrowUpRight size={13} />

                  {forecastChange >= 0
                    ? "+"
                    : ""}
                  {forecastChange.toFixed(1)}%
                  {" "}vs previous period
                </small>
              </div>

              <div className="forecast-stat">
                <span>
                  Expected stock coverage
                </span>

                <strong>
                  {expectedStockCoverage.toLocaleString()}{" "}
                  days
                </strong>

                <small>
                  Across all tracked products
                </small>
              </div>

              <div className="forecast-stat danger">
                <span>
                  Stockout risk
                </span>

                <strong>
                  {atRiskProducts} products
                </strong>

                <small>
                  Based on current stock and
                  historical demand
                </small>
              </div>
            </div>
          </div>

          <Card
            title="Reorder intelligence"
            action={
              <button
                className="primary-button"
                onClick={
                  createPurchaseOrder
                }
              >
                <Plus size={15} />
                Create purchase order
              </button>
            }
          >
            <div className="reorder-table">
              <div className="reorder-head">
                <span>Product</span>
                <span>Current stock</span>
                <span>Predicted demand</span>
                <span>Stockout risk</span>
                <span>Suggested order</span>
                <span>Supplier</span>
              </div>

              {reorderProducts.map(
                (item) => (
                  <div
                    className="reorder-row"
                    key={item.product.id}
                  >
                    <div className="product-cell">
                      <div className="product-thumb">
                        <Package size={15} />
                      </div>

                      <div>
                        <strong>
                          {item.product.name}
                        </strong>

                        <span>
                          {item.product.sku}
                        </span>
                      </div>
                    </div>

                    <strong>
                      {item.product.current_stock}
                    </strong>

                    <span>
                      {item.predictedDemand.toLocaleString()}
                    </span>

                    <span
                      className={
                        item.stockoutRisk ===
                        "Low risk"
                          ? "positive"
                          : "negative"
                      }
                    >
                      {item.stockoutRisk}
                    </span>

                    <strong>
                      {item.suggestedOrder.toLocaleString()}
                    </strong>

                    <span>
                      N/A
                    </span>
                  </div>
                ),
              )}

              {reorderProducts.length ===
                0 && (
                <div className="reorder-row">
                  <span>
                    No products currently
                    require reordering.
                  </span>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}


function AlertsPage({
  showToast,
}: {
  showToast: (message: string) => void;
}) {
  type BackendTransaction = {
    id: number;
    product_id: number;
    type: string;
    quantity: number;
    transaction_date: string;
  };

  type BackendProduct = {
    id: number;
    name: string;
    sku: string;
    current_stock: number;
    reorder_level: number;
  };

  type AlertType =
    | "Critical Stock"
    | "Low Stock"
    | "Stockout Risk"
    | "Unusual Demand";

  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [transactions, setTransactions] = useState<BackendTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [allAlertsRead, setAllAlertsRead] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [alertFilter, setAlertFilter] = useState<
    "All alerts" | AlertType
  >("All alerts");

  useEffect(() => {
    async function loadAlertData() {
      try {
        const [productData, transactionData] = await Promise.all([
          apiGet<BackendProduct[]>("/products"),
          apiGet<BackendTransaction[]>("/transactions"),
        ]);

        setProducts(productData);
        setTransactions(transactionData);
      } catch (error) {
        console.error("Failed to load alerts:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAlertData();
  }, []);

  const salesTransactions = transactions.filter(
    (transaction) => transaction.type.toLowerCase() === "sale",
  );

  const totalDays =
    transactions.length > 0
      ? Math.max(
          1,
          new Set(
            transactions.map((transaction) =>
              transaction.transaction_date?.split(" ")[0],
            ),
          ).size,
        )
      : 1;

  const salesByProduct = new Map<number, number>();

  salesTransactions.forEach((transaction) => {
    salesByProduct.set(
      transaction.product_id,
      (salesByProduct.get(transaction.product_id) || 0) +
        Math.abs(transaction.quantity),
    );
  });

  const criticalProducts = products.filter(
    (product) => product.current_stock <= 0,
  );

  const lowStockProducts = products.filter(
    (product) =>
      product.current_stock > 0 &&
      product.current_stock <= product.reorder_level,
  );

  const stockoutRiskProducts = products.filter((product) => {
    const totalSales = salesByProduct.get(product.id) || 0;
    const dailyDemand = totalSales / totalDays;

    return (
      product.current_stock > 0 &&
      dailyDemand > 0 &&
      product.current_stock / dailyDemand <= 7
    );
  });

  const unusualDemandProduct = products
    .map((product) => ({
      product,
      sales: salesByProduct.get(product.id) || 0,
    }))
    .sort((a, b) => b.sales - a.sales)[0];

  const alerts: {
    title: string;
    detail: string;
    type: AlertType;
    time: string;
    tone: string;
  }[] = [
    ...criticalProducts.slice(0, 3).map((product) => ({
      title: `${product.name} is out of stock`,
      detail: "Immediate attention required",
      type: "Critical Stock" as AlertType,
      time: "Current",
      tone: "critical",
    })),

    ...lowStockProducts.slice(0, 3).map((product) => ({
      title: `${product.name} is running low`,
      detail: `Current stock: ${product.current_stock} units. Reorder level: ${product.reorder_level} units.`,
      type: "Low Stock" as AlertType,
      time: "Current",
      tone: "warning",
    })),

    ...stockoutRiskProducts.slice(0, 2).map((product) => {
      const totalSales = salesByProduct.get(product.id) || 0;
      const dailyDemand = totalSales / totalDays;

      const daysLeft =
        dailyDemand > 0
          ? Math.max(
              1,
              Math.round(product.current_stock / dailyDemand),
            )
          : 0;

      return {
        title: `${product.name} may stockout soon`,
        detail: `Estimated ${daysLeft} days of stock remaining based on historical sales.`,
        type: "Stockout Risk" as AlertType,
        time: "Current",
        tone: "warning",
      };
    }),

    ...(unusualDemandProduct
      ? [
          {
            title: `High sales activity for ${unusualDemandProduct.product.name}`,
            detail: `${unusualDemandProduct.sales.toLocaleString()} units sold in the available dataset.`,
            type: "Unusual Demand" as AlertType,
            time: "Dataset",
            tone: "info",
          },
        ]
      : []),
  ];

  const filteredAlerts =
    alertFilter === "All alerts"
      ? alerts
      : alerts.filter(
          (alert) => alert.type === alertFilter,
        );

  const handleMarkAllAsRead = () => {
    if (alerts.length === 0) return;

    setAllAlertsRead(true);
    showToast("All alerts marked as read.");
  };

  const handleFilterChange = (
    filter: "All alerts" | AlertType,
  ) => {
    setAlertFilter(filter);
    setFilterOpen(false);
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Workspace / Monitoring"
        title="Alert center"
        subtitle="Prioritized signals that need your attention."
        action={
          <div
            className="alert-filter-wrapper"
            style={{
              position: "relative",
            }}
          >
            <button
              className="filter-button"
              onClick={() =>
                setFilterOpen((open) => !open)
              }
            >
              <Filter size={15} />
              Filter alerts
              <ChevronDown
                size={14}
                style={{
                  transform: filterOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>

            {filterOpen && (
              <div
                className="alert-filter-menu"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "210px",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "8px",
                  boxShadow:
                    "0 18px 40px rgba(0,0,0,.35)",
                  zIndex: 50,
                }}
              >
                <div
                  style={{
                    padding: "7px 9px 8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Filter alerts
                </div>

                {(
                  [
                    "All alerts",
                    "Critical Stock",
                    "Low Stock",
                    "Stockout Risk",
                    "Unusual Demand",
                  ] as const
                ).map((filter) => (
                  <button
                    key={filter}
                    onClick={() =>
                      handleFilterChange(filter)
                    }
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 10px",
                      border: "none",
                      borderRadius: "8px",
                      background:
                        alertFilter === filter
                          ? "rgba(72,213,151,.08)"
                          : "transparent",
                      color: "var(--text)",
                      fontSize: "13px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <span>{filter}</span>

                    {alertFilter === filter && (
                      <Check
                        size={14}
                        style={{
                          color: "var(--green)",
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      <div className="alert-overview">
        <div className="alert-overview-critical">
          <AlertTriangle size={19} />

          <div>
            <strong>
              {criticalProducts.length} critical alerts
            </strong>
            <span>  Require immediate attention  </span>
          </div>
        </div>

        <div>
          <strong>{lowStockProducts.length}</strong>
          <span>Low stock</span>
        </div>

        <div>
          <strong>{stockoutRiskProducts.length}</strong>
          <span>Stockout risk</span>
        </div>

        <div>
          <strong>N/A</strong>
          <span>Supplier delays</span>
        </div>
      </div>

      <Card
        title="Active alerts"
        action={
          <button
            className="plain-link"
            onClick={handleMarkAllAsRead}
            disabled={
              allAlertsRead || alerts.length === 0
            }
            style={{
              opacity:
                allAlertsRead || alerts.length === 0
                  ? 0.5
                  : 1,
              cursor:
                allAlertsRead || alerts.length === 0
                  ? "default"
                  : "pointer",
            }}
          >
            {allAlertsRead
              ? "All alerts read"
              : "Mark all as read"}
          </button>
        }
      >
        <div className="full-alert-list">
          {loading ? (
            <div className="full-alert info">
              <div className="full-alert-copy">
                <strong>Loading alerts...</strong>
                <p>
                  Checking current inventory and
                  historical sales.
                </p>
              </div>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="full-alert info">
              <div className="full-alert-copy">
                <strong>No alerts found</strong>
                <p>
                  There are no alerts matching the
                  selected filter.
                </p>
              </div>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <div
                className={`full-alert ${alert.tone}`}
                key={`${alert.type}-${alert.title}-${index}`}
                style={{
                  opacity: allAlertsRead ? 0.55 : 1,
                  transition:
                    "opacity 0.2s ease",
                }}
              >
                <div className="full-alert-icon">
                  <AlertTriangle size={17} />
                </div>

                <div className="full-alert-copy">
                  <div>
                    <span className="alert-type">
                      {alert.type}
                    </span>

                    <time>{alert.time}</time>
                  </div>

                  <strong>{alert.title}</strong>

                  <p>{alert.detail}</p>
                </div>

                <div className="alert-actions">
                  <button
                    onClick={() =>
                      showToast(
                        "Alert marked as resolved.",
                      )
                    }
                  >
                    Resolve
                  </button>

                  <button
                    onClick={() =>
                      showToast(
                        "Product details available in Inventory.",
                      )
                    }
                  >
                    View product
                  </button>

                  <button className="more-button">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function SuppliersPage() {
  type BackendProduct = {
    id: number;
    name: string;
    sku: string;
    category_id: number | null;
    supplier_id: number | null;
    unit_price: number;
    current_stock: number;
    reorder_level: number;
  };

  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupplierData() {
      try {
        const productData = await apiGet<BackendProduct[]>("/products");
        setProducts(productData);
      } catch (error) {
        console.error("Failed to load supplier data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSupplierData();
  }, []);

  const productsWithSuppliers = products.filter(
    (product) => product.supplier_id !== null,
  );

  return (
    <div className="page">
      <PageHeader
        eyebrow="Partners / Suppliers"
        title="Supplier performance"
        subtitle="Understand reliability, lead times, and partnership health."
        action={
          <button className="primary-button">
            <Plus size={15} />
            Add supplier
          </button>
        }
      />

      <div className="supplier-kpis">
        <div>
          <Truck size={17} />
          <span>Supplier reliability</span>
          <strong>N/A</strong>
        </div>

        <div>
          <Clock3 size={17} />
          <span>Average delivery</span>
          <strong>N/A</strong>
        </div>

        <div>
          <ClipboardList size={17} />
          <span>Active purchase orders</span>
          <strong>N/A</strong>
        </div>
      </div>

      <Card title="Supplier data availability">
        {loading ? (
          <div className="supplier-table">
            <div className="reorder-row">
              <span>Loading supplier information...</span>
            </div>
          </div>
        ) : productsWithSuppliers.length === 0 ? (
          <div className="supplier-table">
            <div className="reorder-row">
              <div className="supplier-name">
                <div className="supplier-avatar">N/A</div>
                <div>
                  <strong>Supplier information unavailable</strong>
                  <span>
                    The public inventory dataset does not provide supplier
                    names, delivery times, reliability scores, or purchase
                    order information.
                  </span>
                </div>
              </div>

              <span>—</span>
              <span>—</span>
              <span>—</span>
              <strong>N/A</strong>
              <span className="supplier-status">
                Dataset limitation
              </span>
            </div>
          </div>
        ) : (
          <div className="supplier-table">
            <div className="reorder-head">
              <span>Supplier</span>
              <span>Products</span>
              <span>Orders</span>
              <span>Avg. delivery</span>
              <span>Reliability</span>
              <span>Status</span>
            </div>

            <div className="reorder-row">
              <div className="supplier-name">
                <div className="supplier-avatar">
                  DATA
                </div>

                <div>
                  <strong>Dataset suppliers</strong>
                  <span>
                    {productsWithSuppliers.length} products linked
                  </span>
                </div>
              </div>

              <span>{productsWithSuppliers.length}</span>
              <span>N/A</span>
              <span>N/A</span>
              <strong>N/A</strong>
              <span className="supplier-status">
                Dataset based
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function ReportsPage({
  showToast,
}: {
  showToast: (message: string) => void;
}) {
  type BackendProduct = {
    id: number;
    name: string;
    sku: string;
    current_stock: number;
    reorder_level: number;
    unit_price: number;
  };

  type BackendTransaction = {
    id: number;
    product_id: number;
    type: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    transaction_date: string;
  };

  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [transactions, setTransactions] = useState<BackendTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReportData() {
      try {
        const [productData, transactionData] = await Promise.all([
          apiGet<BackendProduct[]>("/products"),
          apiGet<BackendTransaction[]>("/transactions"),
        ]);

        setProducts(productData);
        setTransactions(transactionData);
      } catch (error) {
        console.error("Failed to load report data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadReportData();
  }, []);

  const exportCSV = (
    filename: string,
    headers: string[],
    rows: (string | number)[][],
  ) => {
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);

    showToast(`${filename} exported successfully.`);
  };

  const generateReport = (title: string) => {
    if (loading) {
      showToast("Report data is still loading.");
      return;
    }

    if (title === "Inventory Summary") {
      exportCSV(
        "inventory-summary.csv",
        ["Product", "SKU", "Current Stock", "Reorder Level", "Unit Price", "Inventory Value"],
        products.map((product) => [
          product.name,
          product.sku,
          product.current_stock,
          product.reorder_level,
          product.unit_price.toFixed(2),
          (product.current_stock * product.unit_price).toFixed(2),
        ]),
      );
      return;
    }

    if (title === "Stock Movement") {
      exportCSV(
        "stock-movement.csv",
        ["Transaction ID", "Product ID", "Type", "Quantity", "Unit Price", "Total", "Date"],
        transactions.map((transaction) => [
          transaction.id,
          transaction.product_id,
          transaction.type,
          transaction.quantity,
          transaction.unit_price.toFixed(2),
          transaction.total_amount.toFixed(2),
          transaction.transaction_date,
        ]),
      );
      return;
    }

    if (title === "Sales Report") {
      const sales = transactions.filter(
        (transaction) => transaction.type.toLowerCase() === "sale",
      );

      exportCSV(
        "sales-report.csv",
        ["Transaction ID", "Product ID", "Quantity Sold", "Unit Price", "Total", "Date"],
        sales.map((transaction) => [
          transaction.id,
          transaction.product_id,
          Math.abs(transaction.quantity),
          transaction.unit_price.toFixed(2),
          transaction.total_amount.toFixed(2),
          transaction.transaction_date,
        ]),
      );
      return;
    }

    if (title === "Purchase Report") {
      showToast(
        "Purchase report unavailable: the public dataset does not contain purchase-order or supplier data.",
      );
      return;
    }

    if (title === "Low Stock Report") {
      const lowStock = products.filter(
        (product) =>
          product.current_stock <= product.reorder_level,
      );

      exportCSV(
        "low-stock-report.csv",
        ["Product", "SKU", "Current Stock", "Reorder Level", "Unit Price"],
        lowStock.map((product) => [
          product.name,
          product.sku,
          product.current_stock,
          product.reorder_level,
          product.unit_price.toFixed(2),
        ]),
      );
      return;
    }

    if (title === "Dead Stock Report") {
      if (transactions.length === 0) {
        showToast("No transaction history is available.");
        return;
      }

      const latestDate = new Date(
        Math.max(
          ...transactions.map(
            (transaction) =>
              new Date(transaction.transaction_date).getTime(),
          ),
        ),
      );

      const latestSaleByProduct = new Map<number, number>();

      transactions
        .filter(
          (transaction) =>
            transaction.type.toLowerCase() === "sale",
        )
        .forEach((transaction) => {
          const current = latestSaleByProduct.get(transaction.product_id);

          const transactionTime = new Date(
            transaction.transaction_date,
          ).getTime();

          if (!current || transactionTime > current) {
            latestSaleByProduct.set(
              transaction.product_id,
              transactionTime,
            );
          }
        });

      const deadStock = products.filter((product) => {
        const lastSale = latestSaleByProduct.get(product.id);

        if (!lastSale) {
          return true;
        }

        const daysSinceSale =
          (latestDate.getTime() - lastSale) /
          (1000 * 60 * 60 * 24);

        return daysSinceSale >= 90;
      });

      exportCSV(
        "dead-stock-report.csv",
        ["Product", "SKU", "Current Stock", "Unit Price"],
        deadStock.map((product) => [
          product.name,
          product.sku,
          product.current_stock,
          product.unit_price.toFixed(2),
        ]),
      );
    }
  };

  const reports = [
    {
      title: "Inventory Summary",
      desc: "Current stock, value, and health overview",
      icon: FileBarChart,
    },
    {
      title: "Stock Movement",
      desc: "All recorded inventory movements",
      icon: Activity,
    },
    {
      title: "Sales Report",
      desc: "Sales activity from the public dataset",
      icon: BarChart3,
    },
    {
      title: "Purchase Report",
      desc: "Purchase volume and supplier performance",
      icon: ClipboardList,
    },
    {
      title: "Low Stock Report",
      desc: "Products approaching their reorder levels",
      icon: AlertTriangle,
    },
    {
      title: "Dead Stock Report",
      desc: "Products with no recorded sales for 90+ days",
      icon: Clock3,
    },
  ];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Workspace / Reporting"
        title="Reports"
        subtitle="Create clear, shareable views of your inventory data."
      />

      <div className="reports-grid">
        {reports.map((report) => (
          <div className="report-card" key={report.title}>
            <div className="report-icon">
              <report.icon size={18} />
            </div>

            <h3>{report.title}</h3>
            <p>{report.desc}</p>

            <div>
              <button
                className="filter-button"
                onClick={() => generateReport(report.title)}
              >
                <Download size={14} />
                Export CSV
              </button>

              <button
                className="card-link"
                onClick={() => generateReport(report.title)}
              >
                Generate <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="report-note">
        <Sparkles size={19} />

        <div>
          <strong>Dataset-based reporting</strong>
          <p>
            Reports are generated from the imported public inventory
            dataset. Supplier and purchase-order reports require fields
            that are not available in the source data.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() => showToast("Reports are ready to generate.")}
        >
          Generate report
        </button>
      </div>
    </div>
  );
}

function QuickActionMenu({ onAction }: { onAction: (action: string) => void }) {
  return (
    <motion.div
      className="quick-menu"
      initial={{ opacity: 0, scale: 0.96, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -6 }}
    >
      <div className="quick-menu-title">
        Quick actions <kbd>ESC</kbd>
      </div>
      {[
        ["Add Product", Package],
        ["Record Sale", ArrowUpRight],
        ["Record Purchase", Truck],
        ["Adjust Stock", Boxes],
        ["Export CSV", Download],
      ].map(([label, Icon]) => (
        <button key={label as string} onClick={() => onAction(label as string)}>
          <span>
            <Icon size={16} />
          </span>
          {label as string}
          <ArrowRight size={14} />
        </button>
      ))}
    </motion.div>
  );
}

function Modal({
  type,
  onClose,
  onSave,
}: {
  type: ModalType;
  onClose: () => void;
  onSave: () => void;
}) {
  const isProduct = type === "product";

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [currentStock, setCurrentStock] = useState("0");
  const [reorderLevel, setReorderLevel] = useState("10");
  const [description, setDescription] = useState("");

  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [suppliers, setSuppliers] = useState<BackendSupplier[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isProduct) return;

    Promise.all([
      apiGet<BackendCategory[]>("/categories"),
      apiGet<BackendSupplier[]>("/suppliers"),
    ])
      .then(([categoryData, supplierData]) => {
        setCategories(categoryData);
        setSuppliers(supplierData);
      })
      .catch((err) => {
        console.error("Failed to load product form data:", err);
        setError("Unable to load categories and suppliers.");
      });
  }, [isProduct]);

  const handleProductSave = async () => {
    setError("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!unitPrice || Number(unitPrice) < 0) {
      setError("Please enter a valid unit price.");
      return;
    }

    if (!currentStock || Number(currentStock) < 0) {
      setError("Please enter a valid current stock.");
      return;
    }

    if (!reorderLevel || Number(reorderLevel) < 0) {
      setError("Please enter a valid reorder level.");
      return;
    }

    try {
      setSaving(true);

      await apiPost("/products", {
        name: name.trim(),
        sku: sku.trim(),
        category_id: Number(categoryId),
        supplier_id: supplierId ? Number(supplierId) : null,
        unit_price: Number(unitPrice),
        current_stock: Number(currentStock),
        reorder_level: Number(reorderLevel),
        description: description.trim() || null,
      });

      onSave();
      onClose();
    } catch (err) {
      console.error("Failed to create product:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to add product. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <motion.div
        className="modal"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="eyebrow">New record</div>
            <h2>{isProduct ? "Add product" : "Record transaction"}</h2>
          </div>

          <button className="more-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isProduct ? (
          <>
            <div className="form-grid">
              <label className="full-field">
                <span>Product name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter product name"
                />
              </label>

              <label>
                <span>SKU</span>
                <input
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  placeholder="Enter SKU"
                />
              </label>

              <label>
                <span>Category</span>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Supplier</span>
                <select
                  value={supplierId}
                  onChange={(event) => setSupplierId(event.target.value)}
                >
                  <option value="">No supplier</option>

                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Unit price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitPrice}
                  onChange={(event) => setUnitPrice(event.target.value)}
                  placeholder="0.00"
                />
              </label>

              <label>
                <span>Current stock</span>
                <input
                  type="number"
                  min="0"
                  value={currentStock}
                  onChange={(event) => setCurrentStock(event.target.value)}
                  placeholder="0"
                />
              </label>

              <label>
                <span>Reorder level</span>
                <input
                  type="number"
                  min="0"
                  value={reorderLevel}
                  onChange={(event) => setReorderLevel(event.target.value)}
                  placeholder="10"
                />
              </label>

              <label className="full-field">
                <span>Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add a short description..."
                  rows={3}
                />
              </label>
            </div>

            {error && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(238, 91, 98, 0.1)",
                  border: "1px solid rgba(238, 91, 98, 0.25)",
                  color: "var(--red)",
                  fontSize: 12,
                }}
              >
                {error}
              </div>
            )}

            <div className="modal-footer">
              <button
                className="filter-button"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={handleProductSave}
                disabled={saving}
              >
                {saving ? "Adding..." : "Add product"}
                {!saving && <ArrowRight size={14} />}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="form-grid">
              <label>
                <span>Product</span>
                <select defaultValue="">
                  <option value="" disabled>
                    Select product
                  </option>
                  <option>Product</option>
                </select>
              </label>

              <label>
                <span>Transaction type</span>
                <select defaultValue="Sale">
                  <option>Sale</option>
                  <option>Purchase</option>
                  <option>Adjustment</option>
                </select>
              </label>

              <label>
                <span>Quantity</span>
                <input type="number" placeholder="Quantity" />
              </label>

              <label>
                <span>Unit price</span>
                <input type="number" placeholder="0.00" />
              </label>

              <label>
                <span>Date</span>
                <input type="date" />
              </label>
            </div>

            <div className="modal-footer">
              <button className="filter-button" onClick={onClose}>
                Cancel
              </button>

              <button className="primary-button" onClick={onSave}>
                Record transaction
                <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default App;
