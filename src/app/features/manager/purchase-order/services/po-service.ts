import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/api-response';
import {
  PoCreateRequest,
  PoItemCreateRequest,
  PoItemResponse,
  PoItemUpdateRequest,
  PoResponse,
  PoStatusUpdateRequest,
  PoUpdateRequest,
} from '../models/po-models';
import { PagedResult, QueryParams } from '../../../../core/models/common-models';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.baseUrl}/purchase-orders`;

  private buildParams(qp: QueryParams, filters?: Record<string, string>): HttpParams {
    let params = new HttpParams();
    if (qp.pageNumber) params = params.set('pageNumber', qp.pageNumber);
    if (qp.pageSize) params = params.set('pageSize', qp.pageSize);
    if (qp.search) params = params.set('search', qp.search);
    if (qp.sortBy) params = params.set('sortBy', qp.sortBy);
    if (qp.sortDirection) params = params.set('sortDirection', qp.sortDirection);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params = params.set(`filters[${key}]`, value);
      });
    }
    return params;
  }


  getPos(qp: QueryParams, filter?: Record<string, string>): Observable<ApiResponse<PagedResult<PoResponse>>> {
    return this.http.get<ApiResponse<PagedResult<PoResponse>>>(`${this.base}`, { params: this.buildParams(qp, filter) })
  }

  getPoById(id: number): Observable<ApiResponse<PoResponse>> {
    return this.http.get<ApiResponse<PoResponse>>(`${this.base}/${id}`)
  }

  createPo(request: PoCreateRequest): Observable<ApiResponse<PoResponse>> {
    return this.http.post<ApiResponse<PoResponse>>(`${this.base}`, request)
  }

  updatePo(id: number, payload: PoUpdateRequest): Observable<ApiResponse<PoResponse>> {
    return this.http.patch<ApiResponse<PoResponse>>(`${this.base}/${id}`, payload)
  }

  updatePoStatus(id: number, payload: PoStatusUpdateRequest): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(`${this.base}/${id}/status`, payload)
  }

  addItem(poId: number, payload: PoItemCreateRequest): Observable<ApiResponse<PoItemResponse>> {
    return this.http.post<ApiResponse<PoItemResponse>>(`${this.base}/${poId}/items`, payload)
  }

  updateItem(poId: number, itemId: number, payload: PoItemUpdateRequest): Observable<ApiResponse<PoItemResponse>> {
    return this.http.patch<ApiResponse<PoItemResponse>>(`${this.base}/${poId}/items/${itemId}`, payload)
  }

  removeItem(poId: number, itemId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.base}/${poId}/items/${itemId}`)
  }
}