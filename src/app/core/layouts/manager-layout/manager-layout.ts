import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SidebarComponent } from '../../components/sidebar/sidebar';
import { HeaderComponent } from '../../components/header/header';

const MANAGER_NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/manager/dashboard' },
  { label: 'Purchase Orders', icon: 'receipt', route: '/manager/purchase-order' },
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
