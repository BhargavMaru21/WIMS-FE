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
import { ManagerDashboardData } from '../models/dashboard.models';

Chart.register(...registerables);

@Component({
  selector: 'app-manager-dashboard',
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
  templateUrl: './manager-dashboard.html',
  styleUrl: './manager-dashboard.scss',
})
export class ManagerDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);

  readonly data = signal<ManagerDashboardData | null>(null);
  readonly loading = signal<boolean>(true);

  @ViewChild('spendChartCanvas') spendChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('poStatusChartCanvas') poStatusChartCanvas?: ElementRef<HTMLCanvasElement>;

  private spendChart?: Chart;
  private poStatusChart?: Chart;

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
    this.dashboardService.getManagerDashboardData().subscribe({
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

    // 1. Monthly Spend Trend Chart
    if (this.spendChartCanvas?.nativeElement) {
      const ctx = this.spendChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.spendChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: currentData.monthlySpendTrend.map((t) => t.month),
            datasets: [
              {
                label: 'Purchase Spend ($)',
                data: currentData.monthlySpendTrend.map((t) => t.spendAmount),
                backgroundColor: 'rgba(37, 99, 235, 0.85)',
                borderRadius: 6,
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

    // 2. PO Status Distribution
    if (this.poStatusChartCanvas?.nativeElement) {
      const ctx = this.poStatusChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.poStatusChart = new Chart(ctx, {
          type: 'doughnut',
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
            cutout: '60%',
          },
        });
      }
    }
  }

  private destroyCharts(): void {
    this.spendChart?.destroy();
    this.poStatusChart?.destroy();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }
}
