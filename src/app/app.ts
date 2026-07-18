import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { User } from './models/User';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('front_end');
  readonly user: User | null = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
}
