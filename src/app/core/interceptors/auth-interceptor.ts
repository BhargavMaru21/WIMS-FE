import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';


const PUBLIC_URLS = [
  '/auth/login',
  '/auth/refresh-token',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/logout',
];

export const SILENT_REQUEST_HEADER = 'X-Silent-Request';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isPublic = PUBLIC_URLS.some((url) => req.url.toLowerCase().includes(url));

  const token = authService.getAccessToken();

  const authReq = req.clone({
    withCredentials: true,
    ...(token && !isPublic
      ? { setHeaders: { Authorization: `Bearer ${token}` } }
      : {})
  });

  return next(authReq).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && !isPublic) {
        return authService.refreshToken().pipe(
          switchMap((res) => {
            const newToken = res.data?.accessToken;
            if (!newToken) {
              authService.accessToken.set(null);
              router.navigate(['/auth/login']);
              return throwError(() => err);
            }

            authService.setAccessToken(newToken);

            // Retry the original request
            const retryReq = req.clone({
              withCredentials: true,
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            authService.accessToken.set(null);
            router.navigate(['/auth/login']);
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => err);
    }),
  );
};