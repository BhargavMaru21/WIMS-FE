export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface ForgotPasswordRequest {
    email: string;
  }
  
  export interface ResetPasswordRequest {
    email: string;
    token: string;
    newPassword: string;
  }
  
  export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
  }
  
  export interface AuthResponse {
    accessToken: string;
  }
  
  export interface JwtPayload {
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
    warehouseId?: number;
    exp: number;
    iss: string;
    aud: string;
  }
  
  export type UserRole = 'Administrator' | 'WarehouseManager' | 'StockKeeper';
  
  export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    warehouseId?: number;
  }

  export interface UserProfileResponse {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    role: string;
    status: string;
    warehouseId: number | null;
    warehouseName: string | null;
    lastLoginAt: string | null;
    createdAt: string;
  }
  
  export interface UpdateProfileRequest {
    fullName: string;
    phoneNumber: string | null;
  }