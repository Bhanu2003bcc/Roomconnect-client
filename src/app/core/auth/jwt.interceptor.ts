import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Do NOT attach Authorization header to external presigned upload URLs (e.g. S3 / Cloudflare R2)
  const isExternalUpload = req.url.startsWith('http://') || req.url.startsWith('https://');
  const isPresignedUrl = req.url.includes('X-Amz-') || req.url.includes('Amz-Signature');

  if (isExternalUpload || isPresignedUrl) {
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
