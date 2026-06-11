import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response';
import {
  AuthResponse,
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  JwtPayload,
  LoginRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UserProfileResponse,
  UserRole,
} from '../models/auth-models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.baseUrl;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly accessToken = signal<string | null>(null);
  readonly isLoggedIn = computed(() => this.accessToken() !== null);

  readonly decodedJwt = computed<JwtPayload | null>(() => {
    const token = this.accessToken();
    if (!token) return null;
    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  });

  readonly role = computed<UserRole | null>(() => (this.decodedJwt()?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as UserRole) ?? null,
  );

  readonly userId = computed<string | null>(
    () =>
      this.decodedJwt()?.[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ] ?? null,
  );

  readonly userName = computed<string | null>(
    () =>
      this.decodedJwt()?.[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
      ] ?? null,
  );

  readonly userEmail = computed<string | null>(
    () =>
      this.decodedJwt()?.[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
      ] ?? null,
  );

  readonly warehouseId = computed<number | null>(
    () => this.decodedJwt()?.warehouseId ?? null,
  );

  readonly currentUser = computed<AuthUser | null>(() => {
    const id = this.userId();
    const name = this.userName();
    const email = this.userEmail();
    const role = this.role();
    if (!id || !name || !email || !role) return null;
    return {
      id,
      name,
      email,
      role,
      warehouseId: this.warehouseId() ?? undefined,
    };
  });

  getAccessToken(): string | null {
    return this.accessToken();
  }

  setAccessToken(token: string): void {
    this.accessToken.set(token);
  }


  login(data: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/login`, data)
      .pipe(
        tap((res) => {
          if (res.isSuccess && res.data?.accessToken) {
            this.setAccessToken(res.data.accessToken);
          }
        }),
      );
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/auth/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/auth/reset-password`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/auth/change-password`, data);
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/refresh-token`, {})
      .pipe(
        tap((res) => {
          if (res.isSuccess && res.data?.accessToken) {
            this.setAccessToken(res.data.accessToken);
          }
        }),
      );
  }

  logout(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/auth/logout`, {});
  }

  validateLink(request: { email: string; token: string }) {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/auth/validate-link`, request);
  }

  logoutAndRedirect(): void {
    this.logout().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.accessToken.set(null);
          this.router.navigate(['/auth/login']);
        }
      },
      error: () => {

      }
    });
  }

  getProfile(): Observable<ApiResponse<UserProfileResponse>> {
    return this.http.get<ApiResponse<UserProfileResponse>>(`${this.baseUrl}/profile`);
  }
 
  updateProfile(
    data: UpdateProfileRequest,
  ): Observable<ApiResponse<UserProfileResponse>> {
    return this.http.patch<ApiResponse<UserProfileResponse>>(`${this.baseUrl}/profile`, data);
  }

  getDashboardRoute(): string {
    switch (this.role()) {
      case 'Administrator':
        return '/admin/users';
      case 'WarehouseManager':
        return '/manager/purchase-order';
      case 'StockKeeper':
        return '/success';
      default:
        return '/auth/login';
    }
  }

  // App initializer
  initializeAuth(): Promise<void> {
    return new Promise((resolve) => {
      if (this.accessToken()) {
        resolve();
        return;
      }
      this.refreshToken().subscribe({
        next: () => resolve(),
        error: () => resolve(),
      });
    });
  }
}