import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SidebarComponent } from '../../components/sidebar/sidebar';
import { HeaderComponent } from '../../components/header/header';

const STOCK_KEEPER_NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/stock-keeper/dashboard' },
  { label: 'Goods Receipt', icon: 'move_to_inbox', route: '/stock-keeper/goods-receipt' },
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
  readonly mobileOpen = signal(false);

  toggleSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 992) {
      this.mobileOpen.update((v) => !v);
    } else {
      this.sidebarCollapsed.update((v) => !v);
    }
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
