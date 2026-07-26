import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUserReq } from '../app/models/authUserReq';
import { Observable } from 'rxjs';
import { CreateUser } from '../app/models/createUser';
import { AuthResponse } from '../app/models/authResponse';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/auth';

  postLogin(user: AuthUserReq): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`, user);
  }

  register(user: CreateUser): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/register`, user);
  }
}
