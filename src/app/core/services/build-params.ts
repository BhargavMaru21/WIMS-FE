import { Injectable } from '@angular/core';
import { QueryParams } from '../models/common-models';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BuildParams {

  build(qp: QueryParams, filters?: Record<string, string>): HttpParams {
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

}
