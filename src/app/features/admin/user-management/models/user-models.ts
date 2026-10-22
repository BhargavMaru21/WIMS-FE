export interface UserSummaryResponse {
    id: number;
    fullName: string;
    email: string;
    role: string;
    status: string;
    warehouseName: string | null;
}

export interface UserResponse {
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
    modifiedAt: string | null;
}

export interface CreateUserRequest {
    fullName: string;
    email: string;
    password: string;
    role: string;
    warehouseId: number | null;
}

export interface UpdateUserStatusRequest {
    status: string;
}

export interface UpdateUserRoleRequest {
    role: string;
    warehouseId: number | null;
}

export interface UpdateUserWarehouseRequest {
    warehouseId: number;
}

export interface UserQueryParams {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: string;
}

export const USER_ROLES = ['WarehouseManager', 'StockKeeper', 'Viewer'];
export const ALL_USER_ROLES = ['Administrator', 'WarehouseManager', 'StockKeeper', 'Viewer'];
export const USER_STATUSES = ['Active', 'Inactive', 'Locked'];
export const ROLES_REQUIRING_WAREHOUSE = ['WarehouseManager', 'StockKeeper'];
export const ROLES_WITHOUT_WAREHOUSE = ['Administrator', 'Viewer'];

