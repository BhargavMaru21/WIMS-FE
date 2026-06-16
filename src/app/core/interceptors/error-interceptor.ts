import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast-service';
import { ApiResponse } from '../models/api-response';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toast = inject(ToastService);

    return next(req).pipe(
        catchError((err) => {
            if (err instanceof HttpErrorResponse && err.status === 401) {
                console.log(err);
                
                return throwError(() => err);
            }

            const body: ApiResponse<unknown> = err?.error;

            if (body) {
                const errors = body.errors;
                if (errors && errors.length > 0) {
                    toast.error(errors.join('\n'));
                } else {
                    toast.error(body.message ?? 'Something went wrong.');
                }
                return throwError(() => err);
            }

            if (err instanceof HttpErrorResponse && err.status === 0) {
                toast.error('Network error. Please check your connection.');
                return throwError(() => err);
            }

            toast.error('An unexpected error occurred. Please try again.');
            return throwError(() => err);
        })
    );
};