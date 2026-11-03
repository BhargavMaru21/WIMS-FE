import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../services/dashboard.service';
import { AdminDashboardData } from '../models/dashboard.models';

// Register all Chart.js controllers and plugins
Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);

  readonly data = signal<AdminDashboardData | null>(null);
  readonly loading = signal<boolean>(true);
  readonly selectedTimeframe = signal<'30d' | '90d' | '1y'>('30d');

  @ViewChild('warehouseChartCanvas') warehouseChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChartCanvas') categoryChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('spendChartCanvas') spendChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('poStatusChartCanvas') poStatusChartCanvas?: ElementRef<HTMLCanvasElement>;

  private warehouseChart?: Chart;
  private categoryChart?: Chart;
  private spendChart?: Chart;
  private poStatusChart?: Chart;

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // If data loaded before view init, render charts
    if (this.data()) {
      this.initCharts();
    }
  }

  loadData(): void {
    this.loading.set(true);
    this.dashboardService.getAdminDashboardData().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
        setTimeout(() => this.initCharts(), 50);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  setTimeframe(tf: '30d' | '90d' | '1y'): void {
    this.selectedTimeframe.set(tf);
  }

  private initCharts(): void {
    const currentData = this.data();
    if (!currentData) return;

    this.destroyCharts();

    // 1. Warehouse Capacity Bar Chart
    if (this.warehouseChartCanvas?.nativeElement) {
      const ctx = this.warehouseChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.warehouseChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: currentData.warehouseCapacities.map((w) => w.warehouseCode),
            datasets: [
              {
                label: 'Current Occupancy (Units)',
                data: currentData.warehouseCapacities.map((w) => w.currentOccupancy),
                backgroundColor: 'rgba(37, 99, 235, 0.85)',
                borderRadius: 6,
              },
              {
                label: 'Max Capacity (Units)',
                data: currentData.warehouseCapacities.map((w) => w.maxCapacity),
                backgroundColor: 'rgba(203, 213, 225, 0.65)',
                borderRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
              tooltip: {
                callbacks: {
                  afterLabel: (context) => {
                    const item = currentData.warehouseCapacities[context.dataIndex];
                    return `Warehouse: ${item.warehouseName}\nUtilization: ${item.utilizationPercentage}%`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
              },
              x: {
                grid: { display: false },
              },
            },
          },
        });
      }
    }

    // 2. Category Distribution Doughnut Chart
    if (this.categoryChartCanvas?.nativeElement) {
      const ctx = this.categoryChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.categoryChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: currentData.categoryDistributions.map((c) => c.categoryName),
            datasets: [
              {
                data: currentData.categoryDistributions.map((c) => c.totalQuantity),
                backgroundColor: currentData.categoryDistributions.map((c) => c.color),
                borderWidth: 2,
                borderColor: '#ffffff',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const item = currentData.categoryDistributions[context.dataIndex];
                    return `${context.label}: ${context.parsed.toLocaleString()} items ($${item.totalValue.toLocaleString()})`;
                  },
                },
              },
            },
            cutout: '65%',
          },
        });
      }
    }

    // 3. Monthly Spend Trend Line Chart
    if (this.spendChartCanvas?.nativeElement) {
      const ctx = this.spendChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.spendChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: currentData.monthlyTrends.map((t) => t.month),
            datasets: [
              {
                label: 'Procurement Spend ($)',
                data: currentData.monthlyTrends.map((t) => t.spendAmount),
                borderColor: '#0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                tension: 0.35,
                fill: true,
                pointBackgroundColor: '#0284c7',
                pointRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => `Spend: $${(ctx.parsed.y ?? 0).toLocaleString()}`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => `$${Number(value) / 1000}k`,
                },
                grid: { color: 'rgba(0,0,0,0.05)' },
              },
              x: { grid: { display: false } },
            },
          },
        });
      }
    }

    // 4. PO Status Breakdown Doughnut Chart
    if (this.poStatusChartCanvas?.nativeElement) {
      const ctx = this.poStatusChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.poStatusChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: currentData.poStatuses.map((s) => s.status),
            datasets: [
              {
                data: currentData.poStatuses.map((s) => s.count),
                backgroundColor: currentData.poStatuses.map((s) => s.color),
                borderWidth: 2,
                borderColor: '#ffffff',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
            },
          },
        });
      }
    }
  }

  private destroyCharts(): void {
    this.warehouseChart?.destroy();
    this.categoryChart?.destroy();
    this.spendChart?.destroy();
    this.poStatusChart?.destroy();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }
}
