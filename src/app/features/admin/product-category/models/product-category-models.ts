export interface QueryParams {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortDirection: string;
}


export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageSize: number;
    pageNumber: number;
}

export interface ProductCategoryResponse {
    id: number,
    name: string,
    description?: string,
    status: string
}

export interface ProductCategoryCreateRequest{
    name: string,
    description?: string
}

export interface ProductCategoryDropdownResponse{
    id: number,
    name: string
}

export interface ProductCategoryStatusUpdateRequest{
    status: string
}

export interface ProductCategoryUpdateRequest{
    name: string,
    description?: string
}