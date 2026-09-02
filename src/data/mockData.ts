export type InventoryStatus = 'Healthy' | 'Low Stock' | 'Critical' | 'Out of Stock';
export type TransactionType = 'Purchase' | 'Sale' | 'Return' | 'Adjustment';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  reserved: number;
  price: number;
  status: InventoryStatus;
  supplier: string;
  reorderLevel: number;
  updated: string;
}

export interface Activity {
  id: string;
  title: string;
  product: string;
  time: string;
  tone: 'green' | 'blue' | 'amber' | 'purple';
}

export interface Transaction {
  id: string;
  product: string;
  sku: string;
  type: TransactionType;
  quantity: number;
  price: number;
  date: string;
  user: string;
}

export const products: Product[] = [
  { id: '1', name: 'Wireless Mouse', sku: 'SKU-1042', category: 'Electronics', stock: 42, reserved: 8, price: 24.99, status: 'Low Stock', supplier: 'TechSource Inc.', reorderLevel: 50, updated: '2 min ago' },
  { id: '2', name: 'Mechanical Keyboard', sku: 'SKU-1043', category: 'Computer Accessories', stock: 186, reserved: 24, price: 89.5, status: 'Healthy', supplier: 'KeyWorks Ltd.', reorderLevel: 40, updated: '8 min ago' },
  { id: '3', name: 'USB-C Hub', sku: 'SKU-1044', category: 'Electronics', stock: 18, reserved: 5, price: 35.0, status: 'Critical', supplier: 'ConnectPro', reorderLevel: 30, updated: '15 min ago' },
  { id: '4', name: 'Gaming Headset', sku: 'SKU-1045', category: 'Audio', stock: 0, reserved: 0, price: 129.99, status: 'Out of Stock', supplier: 'SoundLab Co.', reorderLevel: 25, updated: '22 min ago' },
  { id: '5', name: 'Monitor 24”', sku: 'SKU-1046', category: 'Displays', stock: 73, reserved: 12, price: 219.0, status: 'Healthy', supplier: 'VisionWorks', reorderLevel: 20, updated: '35 min ago' },
  { id: '6', name: 'Laptop Stand', sku: 'SKU-1047', category: 'Office Equipment', stock: 64, reserved: 4, price: 54.75, status: 'Healthy', supplier: 'DeskCraft', reorderLevel: 18, updated: '41 min ago' },
  { id: '7', name: 'Webcam Pro', sku: 'SKU-1048', category: 'Video', stock: 27, reserved: 3, price: 74.0, status: 'Low Stock', supplier: 'VisionWorks', reorderLevel: 35, updated: '1 hr ago' },
  { id: '8', name: 'Ergonomic Chair', sku: 'SKU-1049', category: 'Office Equipment', stock: 12, reserved: 2, price: 349.0, status: 'Critical', supplier: 'OfficeForm', reorderLevel: 15, updated: '2 hrs ago' },
];

export const activities: Activity[] = [
  { id: '1', title: 'Product received', product: 'Wireless Mouse', time: '2 min ago', tone: 'green' },
  { id: '2', title: 'Product sold', product: 'Mechanical Keyboard', time: '8 min ago', tone: 'blue' },
  { id: '3', title: 'Low stock warning', product: 'USB-C Hub', time: '15 min ago', tone: 'amber' },
  { id: '4', title: 'Stock adjusted', product: 'Gaming Headset', time: '22 min ago', tone: 'purple' },
  { id: '5', title: 'Purchase order created', product: 'Monitor 24”', time: '35 min ago', tone: 'blue' },
];

export const transactions: Transaction[] = [
  { id: 'TRX-8821', product: 'Wireless Mouse', sku: 'SKU-1042', type: 'Sale', quantity: 12, price: 24.99, date: 'Jun 24, 2024 · 10:42 AM', user: 'Admin User' },
  { id: 'TRX-8820', product: 'Mechanical Keyboard', sku: 'SKU-1043', type: 'Purchase', quantity: 80, price: 89.5, date: 'Jun 24, 2024 · 10:18 AM', user: 'Admin User' },
  { id: 'TRX-8819', product: 'USB-C Hub', sku: 'SKU-1044', type: 'Adjustment', quantity: -4, price: 35, date: 'Jun 24, 2024 · 09:56 AM', user: 'Maya Chen' },
  { id: 'TRX-8818', product: 'Monitor 24”', sku: 'SKU-1046', type: 'Return', quantity: 2, price: 219, date: 'Jun 24, 2024 · 09:24 AM', user: 'Admin User' },
  { id: 'TRX-8817', product: 'Webcam Pro', sku: 'SKU-1048', type: 'Sale', quantity: 6, price: 74, date: 'Jun 23, 2024 · 04:12 PM', user: 'Jordan Lee' },
];

export const trendData = [
  { day: 'May 24', value: 320, sales: 156, purchases: 82 }, { day: 'May 27', value: 402, sales: 190, purchases: 112 }, { day: 'May 30', value: 455, sales: 222, purchases: 126 }, { day: 'Jun 2', value: 418, sales: 198, purchases: 102 }, { day: 'Jun 5', value: 508, sales: 248, purchases: 144 }, { day: 'Jun 8', value: 492, sales: 235, purchases: 132 }, { day: 'Jun 11', value: 570, sales: 302, purchases: 158 }, { day: 'Jun 14', value: 512, sales: 264, purchases: 145 }, { day: 'Jun 17', value: 538, sales: 290, purchases: 170 }, { day: 'Jun 20', value: 598, sales: 322, purchases: 184 }, { day: 'Jun 24', value: 642, sales: 355, purchases: 202 },
];

export const categoryData = [
  { name: 'Electronics', value: 186750, color: '#48d597' },
  { name: 'Computer Accessories', value: 98420, color: '#5a83f2' },
  { name: 'Office Equipment', value: 67890, color: '#b56cf5' },
  { name: 'Networking', value: 45230, color: '#f5a84b' },
  { name: 'Storage Devices', value: 34460, color: '#ef667e' },
];

export const heatmap = [
  { name: 'Electronics', values: [4, 7, 3, 8, 6, 10, 5, 8, 7, 9, 6, 11, 8, 10] },
  { name: 'Accessories', values: [8, 6, 9, 5, 7, 4, 8, 10, 9, 6, 11, 7, 9, 12] },
  { name: 'Office', values: [2, 4, 3, 5, 3, 2, 6, 4, 7, 5, 4, 3, 5, 4] },
  { name: 'Displays', values: [6, 5, 7, 8, 4, 6, 9, 7, 5, 8, 6, 7, 10, 8] },
  { name: 'Networking', values: [3, 2, 5, 4, 6, 3, 5, 6, 4, 7, 5, 8, 6, 7] },
];

export const navItems = [
  { label: 'Overview', icon: 'layout' }, { label: 'Inventory', icon: 'boxes' }, { label: 'Products', icon: 'package' }, { label: 'Transactions', icon: 'receipt' }, { label: 'Analytics', icon: 'chart' }, { label: 'Forecasting', icon: 'sparkles' }, { label: 'Alerts', icon: 'bell', badge: '7' }, { label: 'Suppliers', icon: 'truck' }, { label: 'Reports', icon: 'file' },
];
