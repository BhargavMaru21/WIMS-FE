import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SidebarComponent } from '../../components/sidebar/sidebar';
import { HeaderComponent } from '../../components/header/header';

const STOCK_KEEPER_NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/stock-keeper/dashboard' },
  { label: 'Goods Receipt', icon: 'move_to_inbox', route: '/stock-keeper/goods-receipt' },
  { label: 'Dispatch Goods', icon: 'local_shipping', route: '/stock-keeper/dispatch-goods' },
  { label: 'Stock Transfers', icon: 'swap_horiz', route: '/stock-keeper/stock-transfers' },
  { label: 'Adjustment Requests', icon: 'tune', route: '/stock-keeper/adjustments' },
  { label: 'Inventory Lookup', icon: 'search', route: '/stock-keeper/inventory' },
];

@Component({
  selector: 'app-stock-keeper-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './stock-keeper-layout.html',
  styleUrl: './stock-keeper-layout.scss',
})
export class StockKeeperLayoutComponent {
  readonly navItems = STOCK_KEEPER_NAV;
  readonly sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }
}