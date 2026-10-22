import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/api-response';
import { BinCreateRequest, BinResponse, BinUpdateRequest, PagedResult, QueryParams, StatusUpdateRequest, WarehouseCreateRequest, WarehouseResponse, WarehouseUpdateRequest, ZoneCreateRequest, ZoneDropdown, ZoneResponse, ZoneUpdateRequest } from '../models/warehouse-models';
import { BuildParams } from '../../../../core/services/build-params';


@Injectable({ providedIn: 'root' })
export class WarehouseManagementService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.baseUrl;
  private readonly buildParamService = inject(BuildParams);

  getWarehouses(qp: QueryParams, filters?: Record<string, string>): Observable<ApiResponse<PagedResult<WarehouseResponse>>> {
    return this.http.get<ApiResponse<PagedResult<WarehouseResponse>>>(`${this.base}/admin/warehouses`, { params: this.buildParamService.build(qp, filters) });
  }

  createWarehouse(payload: WarehouseCreateRequest): Observable<ApiResponse<WarehouseResponse>> {
    return this.http.post<ApiResponse<WarehouseResponse>>(`${this.base}/admin/warehouses`, payload);
  }

  updateWarehouse(id: number, payload: WarehouseUpdateRequest): Observable<ApiResponse<WarehouseResponse>> {
    return this.http.patch<ApiResponse<WarehouseResponse>>(`${this.base}/admin/warehouses/${id}`, payload);
  }

  updateWarehouseStatus(id: number, payload: StatusUpdateRequest): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(`${this.base}/admin/warehouses/${id}/status`, payload);
  }

  deleteWarehouse(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.base}/admin/warehouses/${id}`)
  }


  //zone
  getZones(qp: QueryParams, filters?: Record<string, string>): Observable<ApiResponse<PagedResult<ZoneResponse>>> {
    return this.http.get<ApiResponse<PagedResult<ZoneResponse>>>(`${this.base}/admin/zones`, { params: this.buildParamService.build(qp, filters) });
  }

  getZonesDropdown(warehouseId?: number): Observable<ApiResponse<ZoneDropdown[]>> {
    let params = new HttpParams();
    if (warehouseId) params = params.set('warehouseId', warehouseId);
    return this.http.get<ApiResponse<ZoneDropdown[]>>(`${this.base}/admin/zones/all`, { params });
  }

  createZone(payload: ZoneCreateRequest): Observable<ApiResponse<ZoneResponse>> {
    return this.http.post<ApiResponse<ZoneResponse>>(`${this.base}/admin/zones`, payload);
  }

  updateZone(id: number, payload: ZoneUpdateRequest): Observable<ApiResponse<ZoneResponse>> {
    return this.http.patch<ApiResponse<ZoneResponse>>(`${this.base}/admin/zones/${id}`, payload);
  }

  updateZoneStatus(id: number, payload: StatusUpdateRequest): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(`${this.base}/admin/zones/${id}/status`, payload);
  }

  deleteZone(id: number): Observable<ApiResponse<String>> {
    return this.http.delete<ApiResponse<string>>(`${this.base}/admin/zones/${id}`)
  }


  //bin
  getBins(qp: QueryParams, filters?: Record<string, string>): Observable<ApiResponse<PagedResult<BinResponse>>> {
    return this.http.get<ApiResponse<PagedResult<BinResponse>>>(
      `${this.base}/admin/bins`,
      { params: this.buildParamService.build(qp, filters) }
    );
  }

  createBin(payload: BinCreateRequest): Observable<ApiResponse<BinResponse>> {
    return this.http.post<ApiResponse<BinResponse>>(`${this.base}/admin/bins`, payload);
  }

  updateBin(id: number, payload: BinUpdateRequest): Observable<ApiResponse<BinResponse>> {
    return this.http.patch<ApiResponse<BinResponse>>(`${this.base}/admin/bins/${id}`, payload);
  }

  updateBinStatus(id: number, payload: StatusUpdateRequest): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(`${this.base}/admin/bins/${id}/status`, payload);
  }

  deleteBin(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.base}/admin/bins/${id}`);
  }
}