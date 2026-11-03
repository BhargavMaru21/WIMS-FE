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
import { StockKeeperDashboardData } from '../models/dashboard.models';

Chart.register(...registerables);

@Component({
  selector: 'app-stock-keeper-dashboard',
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
  templateUrl: './stock-keeper-dashboard.html',
  styleUrl: './stock-keeper-dashboard.scss',
})
export class StockKeeperDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);

  readonly data = signal<StockKeeperDashboardData | null>(null);
  readonly loading = signal<boolean>(true);

  @ViewChild('receivingActivityCanvas') receivingActivityCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('zoneCapacityCanvas') zoneCapacityCanvas?: ElementRef<HTMLCanvasElement>;

  private receivingChart?: Chart;
  private zoneChart?: Chart;

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (this.data()) {
      this.initCharts();
    }
  }

  loadData(): void {
    this.loading.set(true);
    this.dashboardService.getStockKeeperDashboardData().subscribe({
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

  private initCharts(): void {
    const currentData = this.data();
    if (!currentData) return;

    this.destroyCharts();

    // 1. Receiving Activity Bar Chart
    if (this.receivingActivityCanvas?.nativeElement) {
      const ctx = this.receivingActivityCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.receivingChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: currentData.receivingActivity.map((r) => r.day),
            datasets: [
              {
                label: 'Units Received',
                data: currentData.receivingActivity.map((r) => r.receivedCount),
                backgroundColor: 'rgba(37, 99, 235, 0.85)',
                borderRadius: 4,
              },
              {
                label: 'Units Put-Away',
                data: currentData.receivingActivity.map((r) => r.putAwayCount),
                backgroundColor: 'rgba(16, 185, 129, 0.85)',
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
              },
              x: { grid: { display: false } },
            },
          },
        });
      }
    }

    // 2. Zone Space Capacity Doughnut Chart
    if (this.zoneCapacityCanvas?.nativeElement) {
      const ctx = this.zoneCapacityCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.zoneChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: currentData.zoneCapacities.map((z) => z.zoneName),
            datasets: [
              {
                data: currentData.zoneCapacities.map((z) => z.occupiedBins),
                backgroundColor: ['#2563eb', '#0891b2', '#10b981', '#f59e0b'],
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
                  label: (ctx) => {
                    const item = currentData.zoneCapacities[ctx.dataIndex];
                    return `${item.zoneCode}: ${item.occupiedBins}/${item.totalBins} bins (${item.utilizationPercentage}%)`;
                  },
                },
              },
            },
            cutout: '60%',
          },
        });
      }
    }
  }

  private destroyCharts(): void {
    this.receivingChart?.destroy();
    this.zoneChart?.destroy();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }
}
