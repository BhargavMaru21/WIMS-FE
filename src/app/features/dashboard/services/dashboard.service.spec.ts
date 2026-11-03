import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return admin dashboard data with correct KPI structure', (done) => {
    service.getAdminDashboardData().subscribe((data) => {
      expect(data).toBeDefined();
      expect(data.kpis.totalWarehouses).toBeGreaterThan(0);
      expect(data.warehouseCapacities.length).toBeGreaterThan(0);
      expect(data.categoryDistributions.length).toBeGreaterThan(0);
      expect(data.monthlyTrends.length).toBe(6);
      expect(data.shortcuts.length).toBe(7);
      done();
    });
  });

  it('should return manager dashboard data', (done) => {
    service.getManagerDashboardData().subscribe((data) => {
      expect(data).toBeDefined();
      expect(data.kpis.activePurchaseOrders).toBeGreaterThan(0);
      expect(data.recentPurchaseOrders.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should return stock keeper dashboard data', (done) => {
    service.getStockKeeperDashboardData().subscribe((data) => {
      expect(data).toBeDefined();
      expect(data.kpis.pendingGoodsReceipts).toBeGreaterThan(0);
      expect(data.inboundShipmentsQueue.length).toBeGreaterThan(0);
      done();
    });
  });
});
