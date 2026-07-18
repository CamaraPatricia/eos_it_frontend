import { inject, Injectable } from '@angular/core';
import {  Router } from '@angular/router';
import { User } from '../app/models/User';

@Injectable({
  providedIn: 'root',
})
export class LoggedInGuard {
  private readonly router: Router = inject(Router);
  private readonly user: User | null = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  canActivate(route: any, state: any): boolean {
    
    if(this.user && this.user.userId) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
