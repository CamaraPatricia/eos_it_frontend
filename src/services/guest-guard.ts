import { inject, Injectable } from '@angular/core';
import {  Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard {
  private readonly router: Router = inject(Router);

  canActivate(_route: any, _state: any): boolean {
    const token: string | null = localStorage.getItem('TASKS_TOKEN');
    if (token) {
        this.router.navigate(['/homepage']);
      return false;
    }
    return true;
  }
}
