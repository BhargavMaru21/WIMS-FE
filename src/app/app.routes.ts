import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth-guard';
import { Success } from './features/auth/success/success';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  {
    path: 'success',
    component: Success
  },

  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.js').then((m) => m.LoginComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.js').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.js').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },


  //Admin
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('Administrator')],
    loadComponent: () =>
      import('./core/layouts/admin-layout/admin-layout.js').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/user-management/user-management.js').then(
            (m) => m.UserManagement,
          ),
      },
      {
        path: 'warehouses',
        loadComponent: () =>
          import('./features/admin/warehouse-management/warehouse-management.js').then(
            (m) => m.WarehouseManagement,
          ),
      },
      {
        path: 'zones',
        loadComponent: () =>
          import('./features/admin/zone-management/zone-management.js').then(
            (m) => m.ZoneManagement,
          ),
      },
      {
        path: 'bins',
        loadComponent: () =>
          import('./features/admin/bin-management/bin-management.js').then(
            (m) => m.BinManagement,
          ),
      },
      {
        path: 'product-category',
        loadComponent: () =>
          import('./features/admin/product-category/product-category.js').then(
            (m) => m.ProductCategory,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/product-management/product-management.js').then(
            (m) => m.ProductManagement,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.js').then((m) => m.ProfileComponent),
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full',
      },
    ],
  },



  //  Manager
  {
    path: 'manager',
    canActivate: [authGuard, roleGuard('WarehouseManager')],
    loadComponent: () =>
      import('./core/layouts/manager-layout/manager-layout.js').then(
        (m) => m.ManagerLayoutComponent,
      ),
    children: [
      {
        path: 'purchase-order',
        loadComponent: () =>
          import('./features/manager/purchase-order/purchase-order.js').then(
            (m) => m.PurchaseOrder
          )
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.js').then((m) => m.ProfileComponent),
      },
      {
        path: '',
        redirectTo: 'purchase-order',
        pathMatch: 'full',
      },
    ],
  },


  // Stock Keeper 
  {
    path: 'stock-keeper',
    canActivate: [authGuard, roleGuard('StockKeeper')],
    loadComponent: () =>
      import('./core/layouts/stock-keeper-layout/stock-keeper-layout.js').then(
        (m) => m.StockKeeperLayoutComponent,
      ),
    children: [

    ],
  },

  {
    path: '**',
    redirectTo: 'auth/login',
  },
];