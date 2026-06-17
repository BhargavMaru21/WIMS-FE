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