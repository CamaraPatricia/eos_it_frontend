import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StatisticsForUsers } from '../app/models/statisticsForUsers';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/statistics';

  getStatistics(): Observable<StatisticsForUsers[]> {
    return this.http.get<StatisticsForUsers[]>(this.url);
  }
}
