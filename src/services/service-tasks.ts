import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../app/models/task';
import { CreateTask } from '../app/models/createTask';

@Injectable({
  providedIn: 'root',
})
export class ServiceTasks {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/tasks';

  getTasks() {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTasksByUser(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/by-user/${userId}`);
  }

  getTaskById(taskId: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${taskId}`);
  }

  createTask(request: CreateTask): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, request);
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}`);
  }

  updateTask(taskId: number, request: CreateTask): Observable<Task> {
  return this.http.put<Task>(`${this.apiUrl}/${taskId}`, request);
}
}


