import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Only skip Authorization for genuine presigned S3/R2 upload URLs.
  // These contain signature query params or point to external storage endpoints.
  // We must NOT skip for our own backend API URLs — even though apiInterceptor
  // rewrites them to absolute https:// URLs before this interceptor runs.
  const isPresignedS3Url = req.url.includes('X-Amz-Signature') ||
                           req.url.includes('AWSAccessKeyId') ||
                           req.url.includes('Signature');

  const isExternalStorageUrl = (req.url.startsWith('http://') || req.url.startsWith('https://')) &&
                               !req.url.includes('/api/');

  if (isPresignedS3Url || isExternalStorageUrl) {
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
