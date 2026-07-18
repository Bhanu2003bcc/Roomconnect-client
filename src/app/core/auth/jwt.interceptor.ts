import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      // Node 16+ and browsers all support global atob
      const payloadDecoded = atob(payloadBase64);
      console.log('JWT Token Claims (Decoded):', JSON.parse(payloadDecoded));
    } catch (e) {
      console.warn('Failed to parse JWT token claims:', e);
    }

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
};
