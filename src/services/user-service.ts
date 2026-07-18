import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../app/models/User';
import { AuthResponse } from '../app/models/authResponse';
import { Observable } from 'rxjs/internal/Observable';
import { CreateUser } from '../app/models/createUser';
import { AuthUserReq } from '../app/models/authUserReq';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(request: CreateUser): Observable<User> {
    return this.http.post<User>(this.apiUrl, request);
  }

  getAuthenticatedUser(request: AuthUserReq): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth`, request);
  }

  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }
}
