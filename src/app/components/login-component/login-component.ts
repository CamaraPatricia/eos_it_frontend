import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../../services/user-service';
import { AuthResponse } from '../../models/authResponse';
import { User } from '../../models/User';
import { AuthUserReq } from '../../models/authUserReq';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import { Router } from '@angular/router';
import { App } from '../../app';
import { LoginService } from '../../../services/login-service';
import LocalStorageUtils from '../../utils/localStorageUtils';
import { Observable } from 'rxjs';
import { CreateUser } from '../../models/createUser';


@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent {
  loggingIn = signal<boolean>(true);
  user: User = {} as User;
  userToLogin: AuthUserReq = {} as AuthUserReq;

  message=  '';
  email = '';
  password = '';
  birthDate ='';
  username = '';
  
  authResponse: AuthResponse = {} as AuthResponse;

  private userService = inject(UserService);  
  private router = inject(Router);
  private appComponent = inject(App);
  private loginService = inject(LoginService); 


  login(): void {
    const encodedUserDTO: AuthUserReq = {
      email: btoa(this.email),
      password: btoa(this.password)
    };

    this.loginService.postLogin(encodedUserDTO).subscribe({
      next: (response : AuthResponse) => {
        console.log('Login successful:', response);

        if (response.token.startsWith('401')) {
          console.error('Login failed: Invalid credentials');
          return;
        }

        LocalStorageUtils.setItem(LocalStorageUtils.tokenKey, response.token);
        this.appComponent.setUser(response.user);

        this.router.navigate(['/homepage']);
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }

  showLogin(): void {
    this.loggingIn.set(true);
    this.message = '';
  }

  showRegister(): void {
    this.loggingIn.set(false);
    this.message = '';
  }
  
  register(): void {
    const encodedUserDTO: CreateUser = {
      email: btoa(this.email),
      password: btoa(this.password),
      birthDate: this.birthDate,
      username: this.username
    };

    this.loginService.register(encodedUserDTO).subscribe({
      next: (response : AuthResponse) => {
        console.log('Registration successful:', response);

        if (response.token.startsWith('400')) {
          console.error('Registration failed: Invalid credentials');
          return;
        }

      LocalStorageUtils.setItem(LocalStorageUtils.tokenKey, response.token);
      this.appComponent.setUser(response.user);

        this.router.navigate(['/homepage']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
      }
  }
)};

  saveUser() : void {
    if(this.loggingIn()){
      this.login();
    } else {
      this.register();
    }
  }
}
