import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SidebarComponent } from '../../components/sidebar/sidebar';
import { HeaderComponent } from '../../components/header/header';

const MANAGER_NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/manager/dashboard' },
  { label: 'Purchase Order', icon: 'receipt', route: '/manager/purchase-order' },
  { label: 'Goods Receipts', icon: 'move_to_inbox', route: '/manager/goods-receipts' },
  { label: 'Goods Dispatch', icon: 'local_shipping', route: '/manager/goods-dispatch' },
  { label: 'Stock Transfers', icon: 'swap_horiz', route: '/manager/stock-transfers' },
  { label: 'Adjustments', icon: 'tune', route: '/manager/adjustments' },
  { label: 'Reorder Alerts', icon: 'notification_important', route: '/manager/reorder-alerts' },
];

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './manager-layout.html',
  styleUrl: './manager-layout.scss',
})
export class ManagerLayoutComponent {
  readonly navItems = MANAGER_NAV;
  readonly sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }
}