import { inject, Injectable } from '@angular/core';
import { AiScheduleResponse } from '../app/models/scheduleCalendarItem';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/ai';

  generateSchedule(): Observable<AiScheduleResponse> {
    return this.http.get<AiScheduleResponse>(
      `${this.apiUrl}/schedule`
    );
  }
}
