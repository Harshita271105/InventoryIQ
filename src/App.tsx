import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
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
import { apiGet } from "./api";

import {
  activities,
  categoryData,
  heatmap,
  navItems,
  products as mockProducts,
  trendData,
  transactions,
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
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All statuses" | InventoryStatus
  >("All statuses");
  const [toast, setToast] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setProductsLoading(true);

        const [backendProducts, categories, suppliers] = await Promise.all([
          apiGet<BackendProduct[]>("/products"),
          apiGet<BackendCategory[]>("/categories"),
          apiGet<BackendSupplier[]>("/suppliers"),
        ]);

        const categoryMap = new Map(
          categories.map((category) => [category.id, category.name]),
        );

        const supplierMap = new Map(
          suppliers.map((supplier) => [supplier.id, supplier.name]),
        );

        const mappedProducts: Product[] = backendProducts.map((product) => ({
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
          updated: "Just now",
        }));

        setProducts(mappedProducts);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
        setToast("Could not load products from the Python backend.");
      } finally {
        setProductsLoading(false);
      }
    }

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
    if (action === "Add Product") setModal("product");
    else if (action === "Record Transaction") setModal("transaction");
    else showToast(`${action} is ready to connect to your Python backend.`);
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Sidebar
        activePage={activePage}
        open={sidebarOpen}
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
          onQuickAction={() => setQuickActionOpen((open) => !open)}
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
}: {
  activePage: string;
  open: boolean;
  onNavigate: (page: string) => void;
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
              className={`nav-item ${activePage === item.label ? "active" : ""}`}
              onClick={() => onNavigate(item.label)}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
              {item.badge && <b>{item.badge}</b>}
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
          <button className="theme-active">
            <Zap size={14} /> Dark
          </button>
          <button>Light</button>
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
        May 24 - Jun 24, 2024
      </button>
      <div className="topbar-actions">
        <button className="icon-button notification">
          <Bell size={18} />
          <i>7</i>
        </button>
        <div className="top-user">
          <div className="avatar avatar-photo">AU</div>
          <div>
            <strong>Admin User</strong>
            <small>Administrator</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <button className="quick-action-button" onClick={onQuickAction}>
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
        subtitle="Here’s what’s happening with your inventory today."
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
              onClick={() => onAction("Import CSV")}
            >
              <Download size={16} />
              Import CSV
            </button>
          </div>
        }
      />

      <KpiGrid totalProducts={totalProducts} />

      <div className="dashboard-grid top-grid">
        <HealthCard />
        <TrendCard />
        <ActivityCard />
      </div>

      <div className="dashboard-grid bottom-grid">
        <StatusCard />
        <CategoriesCard />
        <SmartAlerts />
        <InsightCard />
      </div>

      <SummaryCard />
    </div>
  );
}

const kpis = [
  {
    label: "Total Products",
    value: "12,458",
    change: "+12.5%",
    icon: Package,
    tone: "green",
    points: [12, 18, 11, 23, 18, 28, 20, 34],
  },
  {
    label: "Inventory Value",
    value: "$486,750",
    change: "+8.4%",
    icon: Target,
    tone: "purple",
    points: [12, 20, 15, 28, 19, 30, 24, 36],
  },
  {
    label: "Low Stock Items",
    value: "37",
    change: "+5.2%",
    icon: AlertTriangle,
    tone: "amber",
    points: [9, 20, 14, 23, 17, 31, 25, 37],
  },
  {
    label: "Out of Stock",
    value: "8",
    change: "+33.3%",
    icon: Boxes,
    tone: "red",
    points: [10, 15, 13, 18, 17, 26, 23, 36],
  },
  {
    label: "Inventory Turnover",
    value: "4.8x",
    change: "+14.6%",
    icon: BarChart3,
    tone: "blue",
    points: [8, 19, 14, 24, 18, 27, 24, 35],
  },
];

function KpiGrid({ totalProducts }: { totalProducts: number }) {
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
  {kpi.label === "Total Products"
    ? totalProducts.toLocaleString()
    : kpi.value}
</strong>
          <div className="kpi-bottom">
            <span className="positive">
              <ArrowUpRight size={12} />
              {kpi.change}
            </span>
            <small>vs last 30 days</small>
          </div>
          <MiniSparkline points={kpi.points} tone={kpi.tone} />
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
  return (
    <Card title="Inventory Health Score" className="health-card">
      <div className="health-content">
        <div className="score-ring">
          <div>
            <strong>87</strong>
            <span>/100</span>
          </div>
        </div>
        <div className="health-bars">
          {[
            ["Stock Availability", "92%", "green"],
            ["Demand Accuracy", "84%", "amber"],
            ["Turnover Efficiency", "86%", "green"],
            ["Supply Reliability", "88%", "green"],
          ].map(([label, value, tone]) => (
            <div className="health-bar" key={label}>
              <div>
                <span>{label}</span>
                <b>{value}</b>
              </div>
              <div className="bar-track">
                <i className={tone} style={{ width: value }} />
              </div>
            </div>
          ))}
          <div className="healthy-label">
            <span>✓</span>Healthy
          </div>
        </div>
      </div>
    </Card>
  );
}
function TrendCard() {
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
        <span>
          <i className="dot purple-dot" />
          Purchases
        </span>
      </div>
      <div className="trend-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#48d597" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#48d597" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="purpleFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a878f6" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#a878f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#263141" vertical={false} />
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
              domain={[0, 700]}
            />
            <Tooltip
              contentStyle={{
                background: "#111a27",
                border: "1px solid #2a394e",
                borderRadius: 10,
                color: "#fff",
              }}
              formatter={(value) => `${value}K`}
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
            <Area
              type="monotone"
              dataKey="purchases"
              stroke="#a878f6"
              fill="url(#purpleFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
function ActivityCard() {
  return (
    <Card
      title="Real-time Activity"
      className="activity-card"
      action={
        <span className="live-label">
          <i />
          Live
        </span>
      }
    >
      <div className="activity-list">
        {activities.map((activity) => (
          <motion.div
            className="activity-row"
            key={activity.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Number(activity.id) * 0.08 }}
          >
            <div className={`activity-icon ${activity.tone}`}>
              <Activity size={14} />
            </div>
            <div>
              <strong>{activity.title}</strong>
              <span>{activity.product}</span>
            </div>
            <time>{activity.time}</time>
          </motion.div>
        ))}
      </div>
      <button className="view-link">
        View all activity <ArrowRight size={14} />
      </button>
    </Card>
  );
}
function StatusCard() {
  const status = [
    { label: "Healthy", value: "8,742", percent: "70.1%", color: "#48d597" },
    { label: "Low Stock", value: "2,103", percent: "16.9%", color: "#f5aa38" },
    { label: "Critical", value: "945", percent: "7.6%", color: "#ee5b62" },
    { label: "Out of Stock", value: "668", percent: "5.4%", color: "#a878f6" },
  ];
  return (
    <Card title="Stock Status Overview" className="status-card">
      <div className="status-content">
        <div className="donut-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={status}
                dataKey="value"
                innerRadius={48}
                outerRadius={74}
                startAngle={90}
                endAngle={-270}
                paddingAngle={1}
                stroke="#101824"
                strokeWidth={2}
              >
                {status.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <strong>12,458</strong>
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
                {item.value} <small>({item.percent})</small>
              </b>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
function CategoriesCard() {
  return (
    <Card title="Top Categories by Value" className="categories-card">
      <div className="category-list">
        {categoryData.map((item) => (
          <div className="category-row" key={item.name}>
            <div>
              <span>{item.name}</span>
              <b>${item.value.toLocaleString()}</b>
            </div>
            <div className="category-track">
              <i
                style={{
                  width: `${(item.value / categoryData[0].value) * 100}%`,
                  background: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <button className="view-link">
        View full analytics <ArrowRight size={14} />
      </button>
    </Card>
  );
}
function SmartAlerts() {
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
            <strong>8 products are out of stock</strong>
            <span>Immediate attention required</span>
          </div>
        </div>
        <div className="alert-row warning">
          <AlertTriangle size={14} />
          <div>
            <strong>37 products are running low</strong>
            <span>Reorder suggested</span>
          </div>
        </div>
        <div className="alert-row warning">
          <Clock3 size={14} />
          <div>
            <strong>5 products may stockout soon</strong>
            <span>Within next 7 days</span>
          </div>
        </div>
        <div className="alert-row info">
          <Truck size={14} />
          <div>
            <strong>2 suppliers with delayed deliveries</strong>
            <span>Check supplier performance</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
function InsightCard() {
  return (
    <Card title="AI Insight" className="insight-card">
      <Sparkles className="insight-spark" size={34} />
      <p>
        Based on current trends, you may face stockouts in{" "}
        <strong>6 products</strong> within the next 7 days.
      </p>
      <button className="purple-button">
        View Predictions <ArrowRight size={14} />
      </button>
    </Card>
  );
}
function SummaryCard() {
  return (
    <section className="summary-card">
      <div>
        <span>Today’s Summary</span>
        <h2>Operations are looking healthy</h2>
      </div>
      {[
        ["Sales", "$24,560", "+18.2%"],
        ["Purchases", "$18,340", "+12.6%"],
        ["New Products", "24", "+9.1%"],
        ["Transactions", "156", "+14.3%"],
        ["Avg. Order Value", "$157.44", "+6.8%"],
        ["Gross Profit", "$8,920", "+15.7%"],
      ].map(([label, value, change]) => (
        <div className="summary-stat" key={label}>
          <small>{label}</small>
          <strong>{value}</strong>
          <span>
            <ArrowUpRight size={12} />
            {change}
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
      <button className="filter-button">
        <Filter size={15} />
        More filters
      </button>
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
          <small className="positive">↑ 8.4% this month</small>
        </div>

        <div>
          <span>Inventory value</span>
          <strong>
  ${inventoryValue.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}
</strong>
          <small className="positive">↑ 12.8% this month</small>
        </div>

        <div>
          <span>Needs attention</span>
          <strong>{needsAttention}</strong>
          <small className="negative">↑ 5.2% this month</small>
        </div>

        <div>
          <span>Avg. stock age</span>
          <strong>N/A</strong>
          <small className="positive">↓ 4.1% this month</small>
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
          {rows.map((product) => (
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
                  {(product.stock * product.price).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
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
          Showing {rows.length > 0 ? `1–${rows.length}` : "0"} of {rows.length}
        </span>

        <div>
          <button disabled>Previous</button>
          <button className="page-active">1</button>
          <button disabled>2</button>
          <button disabled>3</button>
          <button disabled>Next</button>
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
  return (
    <div className="page">
      <PageHeader
        eyebrow="Workspace / Catalog"
        title="Products"
        subtitle="Your product catalog, enriched with inventory intelligence."
        action={
          <button
            className="primary-button"
            onClick={() => onAction("Add Product")}
          >
            <Plus size={15} />
            Add Product
          </button>
        }
      />
      <div className="product-grid">
        {rows.map((product) => (
          <motion.div
            className="product-card"
            key={product.id}
            whileHover={{ y: -3 }}
          >
            <div className="product-card-top">
              <div className="large-thumb">
                <Package size={29} />
              </div>
              <button className="more-button">
                <MoreHorizontal size={17} />
              </button>
            </div>
            <span className={`status-badge ${statusClasses[product.status]}`}>
              <i />
              {product.status}
            </span>
            <h3>{product.name}</h3>
            <p>
              {product.sku} · {product.category}
            </p>
            <div className="product-card-meta">
              <div>
                <small>Current stock</small>
                <strong>{product.stock}</strong>
              </div>
              <div>
                <small>Unit price</small>
                <strong>${product.price.toFixed(2)}</strong>
              </div>
              <div>
                <small>Supplier</small>
                <strong>{product.supplier}</strong>
              </div>
            </div>
            <button className="card-link">
              View product <ArrowRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TransactionsPage({
  onAction,
}: {
  onAction: (action: string) => void;
}) {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Workspace / Operations"
        title="Transactions"
        subtitle="Track every movement across your inventory."
        action={
          <button
            className="primary-button"
            onClick={() => onAction("Record Transaction")}
          >
            <Plus size={15} />
            Record transaction
          </button>
        }
      />
      <div className="transaction-kpis">
        <div>
          <span>Total transactions</span>
          <strong>24,891</strong>
          <small>↑ 14.3% vs last month</small>
        </div>
        <div>
          <span>Units sold</span>
          <strong>18,420</strong>
          <small>↑ 9.8% vs last month</small>
        </div>
        <div>
          <span>Units received</span>
          <strong>22,680</strong>
          <small>↑ 12.1% vs last month</small>
        </div>
      </div>
      <Card
        title="Recent transactions"
        action={
          <button className="filter-button">
            <Download size={15} />
            Export CSV
          </button>
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
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
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="mono">{transaction.id}</td>
                  <td>
                    <div className="product-cell">
                      <div className="product-thumb">
                        <Package size={15} />
                      </div>
                      <div>
                        <strong>{transaction.product}</strong>
                        <span>{transaction.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`transaction-badge ${transactionClasses[transaction.type]}`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className={transaction.quantity < 0 ? "negative" : ""}>
                    {transaction.quantity > 0 ? "+" : ""}
                    {transaction.quantity}
                  </td>
                  <td>${transaction.price.toFixed(2)}</td>
                  <td>
                    <strong>
                      $
                      {Math.abs(
                        transaction.quantity * transaction.price,
                      ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </strong>
                  </td>
                  <td className="table-muted">{transaction.date}</td>
                  <td>{transaction.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            <span>Showing 1–5 of 24,891</span>
            <div>
              <button disabled>Previous</button>
              <button className="page-active">1</button>
              <button>2</button>
              <button>3</button>
              <button>Next</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AnalyticsPage() {
  const radarData = [
    { subject: "Availability", A: 92 },
    { subject: "Accuracy", A: 84 },
    { subject: "Turnover", A: 86 },
    { subject: "Reliability", A: 88 },
    { subject: "Velocity", A: 78 },
  ];
  return (
    <div className="page">
      <PageHeader
        eyebrow="Intelligence / Analytics"
        title="Inventory intelligence"
        subtitle="See the signals behind your stock performance."
        action={
          <button className="filter-button">
            <CalendarDays size={15} />
            Last 30 days <ChevronDown size={14} />
          </button>
        }
      />
      <div className="analytics-grid">
        <Card title="Sales vs purchases" className="analytics-wide">
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
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <BarChart data={trendData} width={0} height={300}>
                <CartesianGrid stroke="#263141" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#8390a5", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#8390a5", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111a27",
                    border: "1px solid #2a394e",
                    borderRadius: 10,
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="#5487fa"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
                <Bar
                  dataKey="purchases"
                  fill="#a878f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
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
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categoryData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={2}
            stroke="none"
          >
            {categoryData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              background: "#111a27",
              border: "1px solid #2a394e",
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
      <strong>$486.7K</strong>
      <span>Total value</span>
    </div>
  </div>

  <div className="mini-legend">
    {categoryData.slice(0, 4).map((item) => (
      <span key={item.name}>
        <i style={{ background: item.color }} />
        {item.name}
      </span>
    ))}
  </div>
</Card>
        <Card title="Inventory health">
          <div className="radar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2a384a" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#98a4b7", fontSize: 10 }}
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
        <Card title="Top movers">
          <div className="movers-list">
            {mockProducts.slice(0, 5).map((product, index) => (
              <div key={product.id}>
                <span className="rank">0{index + 1}</span>
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.category}</small>
                </div>
                <b className={index === 3 ? "negative" : "positive"}>
                  {index === 3 ? "−12.4%" : `+${18 - index * 2}.4%`}
                </b>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ForecastingPage() {
  const forecastData = trendData.map((item, index) => ({
    ...item,
    historical: index < 7 ? item.sales : undefined,
    predicted:
      index >= 6
        ? Math.round(item.sales * (1 + (index - 5) * 0.04))
        : undefined,
    upper:
      index >= 6
        ? Math.round(item.sales * (1.12 + (index - 6) * 0.04))
        : undefined,
    lower:
      index >= 6
        ? Math.round(item.sales * (0.88 - (index - 6) * 0.01))
        : undefined,
  }));
  return (
    <div className="page">
      <PageHeader
        eyebrow="Intelligence / Forecasting"
        title="Demand forecasting"
        subtitle="A forward view of demand, stock coverage, and risk."
        action={
          <div className="chart-tabs page-tabs">
            <button className="selected">7 days</button>
            <button>30 days</button>
            <button>90 days</button>
          </div>
        }
      />
      <div className="forecast-banner">
        <div className="forecast-icon">
          <Sparkles size={21} />
        </div>
        <div>
          <strong>Forecasting preview</strong>
          <p>
            This is a UI preview using sample data. Your Python forecasting
            logic can plug into this view later.
          </p>
        </div>
        <span className="preview-pill">Mock data</span>
      </div>
      <div className="forecast-grid">
        <Card title="Historical & predicted demand" className="forecast-chart">
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="confidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a878f6" stopOpacity={0.16} />
                    <stop
                      offset="100%"
                      stopColor="#a878f6"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#263141" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#8390a5", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#8390a5", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111a27",
                    border: "1px solid #2a394e",
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
            <span>Predicted demand</span>
            <strong>1,284 units</strong>
            <small className="positive">
              <ArrowUpRight size={13} />
              +12.8% vs previous period
            </small>
          </div>
          <div className="forecast-stat">
            <span>Expected stock coverage</span>
            <strong>18 days</strong>
            <small>Across all tracked products</small>
          </div>
          <div className="forecast-stat danger">
            <span>Potential stockout date</span>
            <strong>Jun 30, 2024</strong>
            <small>6 products at elevated risk</small>
          </div>
        </div>
      </div>
      <Card
        title="Reorder intelligence"
        action={
          <button className="primary-button">
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
          {mockProducts
            .filter((p) => p.status !== "Healthy")
            .slice(0, 4)
            .map((product) => (
              <div className="reorder-row" key={product.id}>
                <div className="product-cell">
                  <div className="product-thumb">
                    <Package size={15} />
                  </div>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.sku}</span>
                  </div>
                </div>
                <strong>{product.stock}</strong>
                <span>{product.stock + 33}</span>
                <span className="negative">
                  {product.status === "Out of Stock" ? "At risk now" : "6 days"}
                </span>
                <strong>{Math.max(50, product.reorderLevel * 2)}</strong>
                <span>{product.supplier}</span>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}

function AlertsPage({ showToast }: { showToast: (message: string) => void }) {
  const alerts = [
    {
      title: "8 products are out of stock",
      detail: "Immediate attention required",
      type: "Critical Stock",
      time: "2 min ago",
      tone: "critical",
    },
    {
      title: "37 products are running low",
      detail: "Reorder suggested for high velocity items",
      type: "Low Stock",
      time: "15 min ago",
      tone: "warning",
    },
    {
      title: "5 products may stockout soon",
      detail: "Based on predicted demand over the next 7 days",
      type: "Stockout Risk",
      time: "28 min ago",
      tone: "warning",
    },
    {
      title: "Unusual demand for USB-C Hub",
      detail: "Sales are 42% higher than the previous period",
      type: "Unusual Demand",
      time: "1 hr ago",
      tone: "info",
    },
    {
      title: "Supplier delay detected",
      detail: "TechSource Inc. delivery is 3 days overdue",
      type: "Supplier Delay",
      time: "2 hrs ago",
      tone: "info",
    },
  ];
  return (
    <div className="page">
      <PageHeader
        eyebrow="Workspace / Monitoring"
        title="Alert center"
        subtitle="Prioritized signals that need your attention."
        action={
          <button className="filter-button">
            <Filter size={15} />
            Filter alerts
          </button>
        }
      />
      <div className="alert-overview">
        <div className="alert-overview-critical">
          <AlertTriangle size={19} />
          <div>
            <strong>8 critical alerts</strong>
            <span>Require immediate attention</span>
          </div>
        </div>
        <div>
          <strong>37</strong>
          <span>Low stock</span>
        </div>
        <div>
          <strong>5</strong>
          <span>Stockout risk</span>
        </div>
        <div>
          <strong>2</strong>
          <span>Supplier delays</span>
        </div>
      </div>
      <Card
        title="Active alerts"
        action={<button className="plain-link">Mark all as read</button>}
      >
        <div className="full-alert-list">
          {alerts.map((alert) => (
            <div className={`full-alert ${alert.tone}`} key={alert.title}>
              <div className="full-alert-icon">
                <AlertTriangle size={17} />
              </div>
              <div className="full-alert-copy">
                <div>
                  <span className="alert-type">{alert.type}</span>
                  <time>{alert.time}</time>
                </div>
                <strong>{alert.title}</strong>
                <p>{alert.detail}</p>
              </div>
              <div className="alert-actions">
                <button onClick={() => showToast("Alert marked as resolved.")}>
                  Resolve
                </button>
                <button>View product</button>
                <button className="more-button">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SuppliersPage() {
  const suppliers = [
    {
      name: "TechSource Inc.",
      products: 48,
      orders: 128,
      delivery: "4.2 days",
      reliability: "94%",
      status: "On track",
    },
    {
      name: "VisionWorks",
      products: 32,
      orders: 86,
      delivery: "5.1 days",
      reliability: "91%",
      status: "On track",
    },
    {
      name: "KeyWorks Ltd.",
      products: 26,
      orders: 74,
      delivery: "3.8 days",
      reliability: "98%",
      status: "Top performer",
    },
    {
      name: "OfficeForm",
      products: 18,
      orders: 42,
      delivery: "8.6 days",
      reliability: "78%",
      status: "Needs review",
    },
  ];
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
          <strong>94%</strong>
        </div>
        <div>
          <Clock3 size={17} />
          <span>Average delivery</span>
          <strong>4.2 days</strong>
        </div>
        <div>
          <ClipboardList size={17} />
          <span>Active purchase orders</span>
          <strong>28</strong>
        </div>
      </div>
      <Card title="All suppliers">
        <div className="supplier-table">
          <div className="reorder-head">
            <span>Supplier</span>
            <span>Products</span>
            <span>Orders</span>
            <span>Avg. delivery</span>
            <span>Reliability</span>
            <span>Status</span>
          </div>
          {suppliers.map((supplier) => (
            <div className="reorder-row" key={supplier.name}>
              <div className="supplier-name">
                <div className="supplier-avatar">
                  {supplier.name.slice(0, 2).toUpperCase()}
                </div>
                <strong>{supplier.name}</strong>
              </div>
              <span>{supplier.products}</span>
              <span>{supplier.orders}</span>
              <span>{supplier.delivery}</span>
              <strong
                className={
                  supplier.reliability === "78%" ? "negative" : "positive"
                }
              >
                {supplier.reliability}
              </strong>
              <span
                className={`supplier-status ${supplier.status === "Needs review" ? "review" : ""}`}
              >
                {supplier.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ReportsPage({ showToast }: { showToast: (message: string) => void }) {
  const reports = [
    {
      title: "Inventory Summary",
      desc: "Current stock, value, and health overview",
      icon: FileBarChart,
    },
    {
      title: "Stock Movement",
      desc: "All received, sold, returned, and adjusted units",
      icon: Activity,
    },
    {
      title: "Sales Report",
      desc: "Sales performance by product and category",
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
      desc: "Products with no movement in 90+ days",
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
                onClick={() => showToast(`${report.title} exported as CSV.`)}
              >
                <Download size={14} />
                Export CSV
              </button>
              <button
                className="card-link"
                onClick={() =>
                  showToast(`${report.title} generated successfully.`)
                }
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
          <strong>Make reporting a habit</strong>
          <p>
            Schedule recurring reports for your team once your Python backend is
            connected.
          </p>
        </div>
        <button className="secondary-button">Set up schedule</button>
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
        ["Import CSV", Download],
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
        <div className="form-grid">
          {(isProduct
            ? [
                ["Product name", "Wireless Mouse"],
                ["SKU", "SKU-1050"],
                ["Category", "Electronics"],
                ["Supplier", "TechSource Inc."],
                ["Unit price", "24.99"],
                ["Current stock", "50"],
                ["Reorder level", "25"],
              ]
            : [
                ["Product", "Wireless Mouse"],
                ["Transaction type", "Sale"],
                ["Quantity", "12"],
                ["Unit price", "24.99"],
                ["Date", "Jun 24, 2024"],
              ]
          ).map(([label, placeholder], index) => (
            <label
              key={label}
              className={isProduct && index === 0 ? "full-field" : ""}
            >
              <span>{label}</span>
              {label === "Category" ||
              label === "Supplier" ||
              label === "Transaction type" ||
              label === "Product" ? (
                <select defaultValue="">
                  <option value="" disabled>
                    {placeholder}
                  </option>
                  <option>{placeholder}</option>
                  <option>Other</option>
                </select>
              ) : (
                <input placeholder={placeholder} />
              )}
            </label>
          ))}
          {isProduct && (
            <label className="full-field">
              <span>Description</span>
              <textarea placeholder="Add a short description..." rows={3} />
            </label>
          )}
        </div>
        <div className="modal-footer">
          <button className="filter-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" onClick={onSave}>
            {isProduct ? "Add product" : "Record transaction"}{" "}
            <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
