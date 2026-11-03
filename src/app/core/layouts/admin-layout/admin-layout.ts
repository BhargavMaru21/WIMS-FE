import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SidebarComponent } from '../../components/sidebar/sidebar';
import { HeaderComponent } from '../../components/header/header';

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
  { label: 'Users', icon: 'people_outline', route: '/admin/users' },
  { label: 'Warehouses', icon: 'warehouse', route: '/admin/warehouses' },
  { label: 'Zones', icon: 'grid_view', route: '/admin/zones' },
  { label: 'Bins', icon: 'inbox', route: '/admin/bins' },
  { label: 'Product Category', icon: 'category', route: '/admin/product-category' },
  { label: 'Products', icon: 'inventory_2', route: '/admin/products' },
  { label: 'Purchase Orders', icon: 'receipt', route: '/admin/purchase-orders' },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayoutComponent {
  readonly navItems = ADMIN_NAV;
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
