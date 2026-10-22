export interface ApiResponse<T> {
    isSuccess: boolean;
    message: string;
    data: T | null;
    errors : string[] | null;
    statusCode : number;
}
