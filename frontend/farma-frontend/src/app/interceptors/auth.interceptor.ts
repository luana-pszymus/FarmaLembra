import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    const requisicaoComToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(requisicaoComToken);
  }

  return next(req);
};
