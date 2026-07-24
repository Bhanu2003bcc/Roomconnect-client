import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Only skip Authorization for genuine presigned S3/R2 upload URLs.
  // These contain 'X-Amz-Signature' as a query parameter in the URL.
  // We must NOT skip for our own backend API URLs — even though apiInterceptor
  // rewrites them to absolute https:// URLs before this interceptor runs.
  const isPresignedS3Url = req.url.includes('X-Amz-Signature');

  if (isPresignedS3Url) {
    return next(req);
  }

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
};
