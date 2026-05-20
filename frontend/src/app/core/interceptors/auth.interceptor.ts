import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const token = tokenStorage.token ?? sessionStorage.getItem('aivacol_token');

  const authorizedRequest = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authorizedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap((newToken) => {
          return next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            }),
          );
        }),
      );
    }),
  );
};
