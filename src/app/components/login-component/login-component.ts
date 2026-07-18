import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user-service';
import { AuthResponse } from '../../models/authResponse';
import { User } from '../../models/User';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent {
  loggingIn: boolean = true;
  user: User = {} as User;

  message=  '';
  email = '';
  password = '';
  birthDate: Date = new Date();
  username = '';
  
  authResponse: AuthResponse = {} as AuthResponse;

  private userService = inject(UserService);  
  private router = inject(Router);


showLogin(): void {
    this.loggingIn = true;
    this.message = '';
  }

  showRegister(): void {
    this.loggingIn = false;
    this.message = '';
  }

  login(): void {
    this.userService.getAuthenticatedUser(
      {email: this.email, 
        password: this.password}

    ).subscribe((response: AuthResponse) => {
      this.authResponse = response;
      this.user = response.user;
      this.message = response.message;

      localStorage.setItem('user', JSON.stringify(this.user));

      this.router.navigate(['/homepage']);
    });
  }
  
  register(): void {
    this.userService.createUser({
      birthDate: this.birthDate,
      email: this.email,
      username: this.username,
      password: this.password
    }).subscribe((response: User) => {
      this.user = response;

      this.loggingIn = true;
      this.password = '';
    });
  }

  saveUser() : void {
    if(this.loggingIn){
      this.login();
    } else {
      this.register();
    }
          
  }
}
