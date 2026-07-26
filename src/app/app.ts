import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { User } from './models/User';
import LocalStorageUtils from './utils/localStorageUtils';
import { UserService } from '../services/user-service';
import { consumerMarkDirty } from '@angular/core/primitives/signals';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('front_end');

  protected user = signal<User | null>(LocalStorageUtils.getItem(LocalStorageUtils.userKey) ? 
    JSON.parse(LocalStorageUtils.getItem(LocalStorageUtils.userKey)!) : null);
    
  private router = inject(Router);
  private userService = inject(UserService);

  setUser(user: User | null): void {
    this.user.set(user);
    LocalStorageUtils.setItem(LocalStorageUtils.userKey, JSON.stringify(this.user()));
  }

  logout(): void {
    //this.setUser(null);
    LocalStorageUtils.deleteItem(LocalStorageUtils.tokenKey);
    LocalStorageUtils.deleteItem(LocalStorageUtils.userKey);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  getUserByEmail(email:string): void {
    this.userService.getUserByEmail(email).subscribe({
      next: (user: User) => {
       this.user.set(user);
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
}
