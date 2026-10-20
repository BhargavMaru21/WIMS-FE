import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { switchMap, of, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { SILENT_REQUEST_HEADER } from './auth-interceptor';

export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const isSilent = req.headers.has(SILENT_REQUEST_HEADER);

  return next(req).pipe(
    switchMap((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body as ApiResponse<unknown>;

        if (body && typeof body === 'object' && !body.isSuccess) {
          if (isSilent) return of(event);

          return throwError(() => ({
            status: body.statusCode,
            error: body,
            message: body.message,
          }));
        }
      }
      return of(event);
    }),
  );
};