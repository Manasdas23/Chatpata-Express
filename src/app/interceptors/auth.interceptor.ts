import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Get the auth token from the service
  const token = authService.getToken();
  
  // Clone the request and add the authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Handle the request
  return next(authReq).pipe(
    catchError(error => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        // Token might be expired, logout user
        authService.logout();
        return throwError(() => new Error('Authentication failed'));
      }
      
      // Handle other HTTP errors
      return throwError(() => error);
    })
  );
};