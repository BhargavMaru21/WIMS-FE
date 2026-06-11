import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/api-response';
import { PagedResult, QueryParams } from '../../../admin/warehouse-management/models/warehouse-models';
import {
  ProductCreateRequest,
  ProductResponse,
  ProductStatusUpdateRequest,
  ProductUpdateRequest,
  UomResponse,
} from '../models/product-models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.baseUrl;

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

  getProducts(qp: QueryParams, filters?: Record<string, string>): Observable<ApiResponse<PagedResult<ProductResponse>>> {
    return this.http.get<ApiResponse<PagedResult<ProductResponse>>>(
      `${this.base}/product`,
      { params: this.buildParams(qp, filters) }
    );
  }

  getProductById(id: number): Observable<ApiResponse<ProductResponse>> {
    return this.http.get<ApiResponse<ProductResponse>>(`${this.base}/product/${id}`);
  }

  createProduct(payload: ProductCreateRequest): Observable<ApiResponse<ProductResponse>> {
    return this.http.post<ApiResponse<ProductResponse>>(`${this.base}/product`, payload);
  }

  updateProduct(id: number, payload: ProductUpdateRequest): Observable<ApiResponse<ProductResponse>> {
    return this.http.patch<ApiResponse<ProductResponse>>(`${this.base}/product/${id}`, payload);
  }

  updateProductStatus(id: number, payload: ProductStatusUpdateRequest): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(`${this.base}/product/${id}/status`, payload);
  }

  deleteProduct(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.base}/product/${id}`);
  }

  exportProducts(): Observable<Blob> {
    return this.http.get(`${this.base}/product/export`, { responseType: 'blob' });
  }

  importProducts(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(`${this.base}/product/import`, formData);
  }

  getAllUoms(): Observable<ApiResponse<UomResponse[]>> {
    return this.http.get<ApiResponse<UomResponse[]>>(`${this.base}/unitOfMeasure`);
  }

  createUom(payload: { name: string; abbreviation: string }): Observable<ApiResponse<UomResponse>> {
    return this.http.post<ApiResponse<UomResponse>>(`${this.base}/unitOfMeasure`, payload);
  }

  updateUom(id: number, payload: { name: string; abbreviation: string }): Observable<ApiResponse<UomResponse>> {
    return this.http.patch<ApiResponse<UomResponse>>(`${this.base}/unitOfMeasure/${id}`, payload);
  }
 
  deleteUom(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.base}/unitOfMeasure/${id}`);
  }
}