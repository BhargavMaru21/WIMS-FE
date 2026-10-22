import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/api-response.js'
import {
    CreateUserRequest,
    UpdateUserRoleRequest,
    UpdateUserStatusRequest,
    UpdateUserWarehouseRequest,
    UserQueryParams,
    UserResponse,
    UserSummaryResponse,
} from '../models/user-models.js'
import { environment } from '../../../../../environments/environment';
import { BuildParams } from '../../../../core/services/build-params.js';
import { PagedResult, QueryParams } from '../../../../core/models/common-models.js';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
    private readonly http = inject(HttpClient);
    private readonly base = environment.baseUrl;
    private readonly buildParamService = inject(BuildParams);

    getUsers(qp: QueryParams, filters?: Record<string, string>): Observable<ApiResponse<PagedResult<UserSummaryResponse>>> {
        return this.http.get<ApiResponse<PagedResult<UserSummaryResponse>>>(`${this.base}/admin/users`, { params: this.buildParamService.build(qp, filters) });
    }

    getUserById(id: number): Observable<ApiResponse<UserResponse>> {
        return this.http.get<ApiResponse<UserResponse>>(`${this.base}/admin/users/${id}`);
    }

    createUser(payload: CreateUserRequest): Observable<ApiResponse<UserResponse>> {
        return this.http.post<ApiResponse<UserResponse>>(`${this.base}/admin/create-user`, payload);
    }

    deleteUser(id: number): Observable<ApiResponse<string>> {
        return this.http.delete<ApiResponse<string>>(`${this.base}/admin/users/${id}`)
    }

    updateUserStatus(id: number, payload: UpdateUserStatusRequest): Observable<ApiResponse<UserResponse>> {
        return this.http.patch<ApiResponse<UserResponse>>(`${this.base}/admin/users/${id}/status`, payload);
    }

    updateUserRole(id: number, payload: UpdateUserRoleRequest): Observable<ApiResponse<UserResponse>> {
        return this.http.patch<ApiResponse<UserResponse>>(`${this.base}/admin/users/${id}/role`, payload);
    }

    updateUserWarehouse(id: number, payload: UpdateUserWarehouseRequest): Observable<ApiResponse<UserResponse>> {
        return this.http.patch<ApiResponse<UserResponse>>(`${this.base}/admin/users/${id}/warehouse`, payload);
    }
}






