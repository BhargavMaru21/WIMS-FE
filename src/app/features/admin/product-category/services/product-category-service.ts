import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { PagedResult, ProductCategoryCreateRequest, ProductCategoryDropdownResponse, ProductCategoryResponse, ProductCategoryStatusUpdateRequest, ProductCategoryUpdateRequest, QueryParams } from "../models/product-category-models";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../../core/models/api-response";

@Injectable({ providedIn: 'root' })
export class ProductCategoryService {
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

    //product category 
    getProductCategories(qp: QueryParams, filters?: Record<string, string>): Observable<ApiResponse<PagedResult<ProductCategoryResponse>>> {
        return this.http.get<ApiResponse<PagedResult<ProductCategoryResponse>>>(`${this.base}/productCategory`, { params: this.buildParams(qp, filters) });
    }

    getProductCategoryDropdown(): Observable<ApiResponse<ProductCategoryDropdownResponse[]>>{
        return this.http.get<ApiResponse<ProductCategoryDropdownResponse[]>>(`${this.base}/productCategory/active`)
    }

    createProductCategory(payload : ProductCategoryCreateRequest): Observable<ApiResponse<ProductCategoryResponse>>{
        return this.http.post<ApiResponse<ProductCategoryResponse>>(`${this.base}/productCategory`,payload)
    }

    updateProductCategory(id: number , payload : ProductCategoryUpdateRequest) : Observable<ApiResponse<ProductCategoryResponse>>{
        return this.http.patch<ApiResponse<ProductCategoryResponse>>(`${this.base}/productCategory/${id}`,payload)
    }

    updateProductCategoryStatus(id: number, payload: ProductCategoryStatusUpdateRequest): Observable<ApiResponse<string>>{
        return this.http.patch<ApiResponse<string>>(`${this.base}/productCategory/${id}/status`,payload)
    }

    deleteProductCategory(id: number) : Observable<ApiResponse<string>>{
        return this.http.delete<ApiResponse<string>>(`${this.base}/productCategory/${id}`)
    }

}