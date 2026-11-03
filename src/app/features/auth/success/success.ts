import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './success.html',
  styleUrl: './success.scss',
})
export class Success {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get user() {
    return this.authService.currentUser();
  }

  get dashboardRoute(): string {
    switch (this.user?.role) {
      case 'Administrator':
        return '/admin/dashboard';
      case 'WarehouseManager':
        return '/manager/dashboard';
      case 'StockKeeper':
        return '/stock-keeper/dashboard';
      default:
        return '/admin/dashboard';
    }
  }

  logout(): void {
    this.authService.logoutAndRedirect();
  }
}
