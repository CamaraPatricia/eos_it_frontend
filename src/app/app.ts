import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { User } from './models/User';
import LocalStorageUtils from './utils/localStorageUtils';
import { UserService } from '../services/user-service';
import { LocalStorageUser } from './models/localStorageUser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('front_end');

  protected localStorageUser = signal<LocalStorageUser | null>(LocalStorageUtils.getItem(LocalStorageUtils.userKey) ? 
    JSON.parse(LocalStorageUtils.getItem(LocalStorageUtils.userKey)!) : null);
    
  private router = inject(Router);
  private userService = inject(UserService);

  setUser(user: User | null): void {
    this.localStorageUser.set({
      userId: user?.userId || 0,
      username: user?.username || '',
      roleName: this.getRoleFromToken(LocalStorageUtils.getItem(LocalStorageUtils.tokenKey) || '') || '',
    });
    LocalStorageUtils.setItem(LocalStorageUtils.userKey, JSON.stringify(this.localStorageUser()));
  }

  logout(): void {
    LocalStorageUtils.deleteItem(LocalStorageUtils.tokenKey);
    LocalStorageUtils.deleteItem(LocalStorageUtils.userKey);
    this.localStorageUser.set(null);
    this.router.navigate(['/login']);
  }

  getUserByEmail(email:string): void {
    this.userService.getUserByEmail(email).subscribe({
      next: (user: User) => {
       this.localStorageUser.set({
          userId: user?.userId || 0,
          username: user?.username || '',
          roleName: this.getRoleFromToken(LocalStorageUtils.getItem(LocalStorageUtils.tokenKey) || '') || ''
        });
      }
    });
  }

  getEmailFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));

    return decoded.sub ?? null;
  } catch {
    return null;
  }
}
  getRoleFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role_name ?? null;
  } catch {
    return null;
  }
}
}
