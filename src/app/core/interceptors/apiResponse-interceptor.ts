import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { switchMap, of, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response';

export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
        switchMap(event => {
            if (event instanceof HttpResponse) {
                const body = event.body as ApiResponse<unknown>;

                if (body && typeof body === 'object' && !body.isSuccess) {
                    return throwError(() => ({
                        status: body.statusCode,
                        error: body,
                        message: body.message,
                    }));
                }
            }
            return of(event);
        })
    );
};