import { HttpInterceptorFn } from "@angular/common/http";
import LocalStorageUtils from "../utils/localStorageUtils";
import { Router } from "@angular/router";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    // if(req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    //     return next(req);
    // } 

    const token: string | null = LocalStorageUtils.getItem(LocalStorageUtils.tokenKey);
    let processedRequest;
    if(token) {
        processedRequest = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
    } else {
        processedRequest = req;
    }

    return next(processedRequest).pipe(
    catchError(error => {

      switch (error.status) {
        case 401: {
          if (error.status === 401) {
            if(req.url.includes('/auth')) {
              alert('Invalid credentials. Please check your email and password.');
            } else {
              LocalStorageUtils.deleteItem(LocalStorageUtils.tokenKey);
              LocalStorageUtils.deleteItem(LocalStorageUtils.userKey);

              alert('Your session has expired. Please log in again.');
              void router.navigateByUrl('/login', {
      replaceUrl: true,
    });
            
            }
          }
          break;
        }
        case 404: {
          alert('Haven\'t found any associated account for this email');
          break;
        }
        case 409: {
          alert('This email is already registered. Please use a different email or go to login.');
          break;
        }
        case 403: {
          alert('You do not have permission to access this resource.');
          break;
        }
    }

      return throwError(() => error);
    })
  );
}
