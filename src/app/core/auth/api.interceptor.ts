import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Prepend environment.apiUrl if the request is relative and starts with '/api'
  if (req.url.startsWith('/api') && environment.apiUrl) {
    req = req.clone({
      url: `${environment.apiUrl}${req.url}`
    });
  }
  return next(req);
};
