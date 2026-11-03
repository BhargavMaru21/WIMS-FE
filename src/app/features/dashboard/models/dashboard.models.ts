export interface DashboardKpiCard {
  title: string;
  value: string | number;
  subtitle?: string;
  changePercentage?: number;
  isPositiveChange?: boolean;
  icon: string;
  iconBgColor?: string;
  iconColor?: string;
  route?: string;
}

export interface WarehouseCapacityMetric {
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  totalZones: number;
  totalBins: number;
  maxCapacity: number;
  currentOccupancy: number;
  utilizationPercentage: number;
  status: 'Normal' | 'Warning' | 'Critical';
}

export interface CategoryStockDistribution {
  categoryId: number;
  categoryName: string;
  productCount: number;
  totalQuantity: number;
  totalValue: number;
  color: string;
}

export interface MonthlySpendTrend {
  month: string;
  spendAmount: number;
  orderCount: number;
}

export interface PoStatusBreakdown {
  status: string;
  count: number;
  totalAmount: number;
  color: string;
}

export interface PendingPoReviewItem {
  id: number;
  poNumber: string;
  supplierName: string;
  warehouseName: string;
  totalAmount: number;
  expectedDelivery: string;
  submittedAt: string;
  submittedByName: string;
  itemsCount: number;
}

export interface LowStockAlertItem {
  productId: number;
  sku: string;
  productName: string;
  categoryName: string;
  warehouseName: string;
  currentStock: number;
  reorderLevel: number;
  uom: string;
  unitPrice: number;
  urgency: 'Low' | 'Medium' | 'Critical';
}

export interface SystemAuditItem {
  id: number;
  action: string;
  module: 'Users' | 'Warehouses' | 'Zones' | 'Bins' | 'Products' | 'PurchaseOrders' | 'GoodsReceipt';
  description: string;
  performedBy: string;
  timestamp: string;
  status: 'Success' | 'Warning' | 'Info' | 'Danger';
}

export interface FeatureShortcut {
  title: string;
  description: string;
  icon: string;
  route: string;
  count?: number | string;
  badge?: string;
  color: string;
}

export interface AdminDashboardData {
  kpis: {
    totalWarehouses: number;
    activeWarehouses: number;
    totalZones: number;
    totalBins: number;
    totalCapacity: number;
    utilizedCapacity: number;
    utilizationRate: number;
    totalProducts: number;
    activeProducts: number;
    lowStockCount: number;
    totalUsers: number;
    activeUsers: number;
    totalPurchaseOrders: number;
    pendingPoReviews: number;
    totalSpendYearToDate: number;
  };
  warehouseCapacities: WarehouseCapacityMetric[];
  categoryDistributions: CategoryStockDistribution[];
  monthlyTrends: MonthlySpendTrend[];
  poStatuses: PoStatusBreakdown[];
  pendingPoReviews: PendingPoReviewItem[];
  lowStockAlerts: LowStockAlertItem[];
  recentActivities: SystemAuditItem[];
  shortcuts: FeatureShortcut[];
}

export interface ManagerDashboardData {
  warehouseName: string;
  warehouseCode: string;
  kpis: {
    activePurchaseOrders: number;
    pendingApprovalCount: number;
    approvedAwaitingDelivery: number;
    monthlySpend: number;
    lowStockItemCount: number;
    expectedDeliveriesThisWeek: number;
  };
  poStatuses: PoStatusBreakdown[];
  monthlySpendTrend: MonthlySpendTrend[];
  categoryStock: CategoryStockDistribution[];
  recentPurchaseOrders: PendingPoReviewItem[];
  lowStockItems: LowStockAlertItem[];
  upcomingDeliveries: {
    poNumber: string;
    supplierName: string;
    expectedDelivery: string;
    itemsCount: number;
    totalAmount: number;
    status: string;
  }[];
}

export interface StockKeeperDashboardData {
  warehouseName: string;
  kpis: {
    pendingGoodsReceipts: number;
    receiptsProcessedToday: number;
    totalAssignedBins: number;
    binUtilizationPercentage: number;
    lowStockAlerts: number;
  };
  receivingActivity: {
    day: string;
    receivedCount: number;
    putAwayCount: number;
  }[];
  zoneCapacities: {
    zoneCode: string;
    zoneName: string;
    totalBins: number;
    occupiedBins: number;
    utilizationPercentage: number;
  }[];
  inboundShipmentsQueue: {
    poId: number;
    poNumber: string;
    supplierName: string;
    expectedDelivery: string;
    itemsCount: number;
    status: string;
  }[];
  binOccupancyList: {
    binCode: string;
    binName: string;
    zoneName: string;
    currentItems: number;
    maxCapacity: number;
    utilizationPercent: number;
    status: 'Available' | 'Near Full' | 'Full';
  }[];
}
