import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/auth-models';
import { AuthService } from '../services/auth-service';

// Auth guard
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  return router.createUrlTree(['/auth/login']);
};

// guest guard
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);


  if (!auth.isLoggedIn()) return true;

  return router.createUrlTree([auth.getDashboardRoute()]);
};

// role guard
export function roleGuard(...allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/auth/login']);
    }

    const role = auth.role();
    if (role && allowedRoles.includes(role)) return true;

    return router.createUrlTree([auth.getDashboardRoute()]);
  };
}