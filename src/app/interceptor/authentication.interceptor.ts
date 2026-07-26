import { HttpInterceptorFn } from "@angular/common/http";
import LocalStorageUtils from "../utils/localStorageUtils";
import { Router } from "@angular/router";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    
    if(req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
        return next(req);
    } 

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

      if (error.status === 401 || error.status === 403) {
        LocalStorageUtils.deleteItem(LocalStorageUtils.tokenKey);
        LocalStorageUtils.deleteItem(LocalStorageUtils.userKey);

        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
}