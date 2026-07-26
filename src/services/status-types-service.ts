import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import StatusType from '../app/models/status-type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatusTypesService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/statuses';

  getStatusTypes(): Observable<StatusType[]> {
    return this.http.get<StatusType[]>(this.apiUrl);
  }
}
