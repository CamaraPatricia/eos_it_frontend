import { inject, Injectable } from '@angular/core';
import {  Router } from '@angular/router';
// import { User } from '../app/models/User';

@Injectable({
  providedIn: 'root',
})
export class LoggedInGuard {
  private readonly router: Router = inject(Router);

  canActivate(_route: any, _state: any): boolean {
    const token: string | null = localStorage.getItem('TASKS_TOKEN');
    if(token) {     
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
