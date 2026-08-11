import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../app/models/task';
import { CreateTask } from '../app/models/createTask';
import updateTaskStatusAndUser from '../app/models/uptateTaskStatusAndUser';
import { Page } from '../app/models/page';

@Injectable({
  providedIn: 'root',
})
export class ServiceTasks {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/tasks';

  getTasksByUser(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/by-user`, {
      params: {
        userId: userId.toString()
      }
    });
  }

  getPaginatedTasks(userId: number, page: number, size: number, sort: string): Observable<Page<Task>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<Page<Task>>(`${this.apiUrl}/paginated/${userId}`, { params });
  }

  getFilteredTasks(taskName: string, statusTypes: string[], userId: number,
    dueDate: string, page: number, size: number, sort: string): Observable<Page<Task>> {
  let params = new HttpParams()
    .set('taskName', taskName)
    .set('userId', userId.toString())
    .set('page', page.toString())
    .set('size', size.toString())
    .set('sort', sort);

  statusTypes.forEach(s => {
    params = params.append('statusTypes', s);
  });

  if (dueDate) {
    params = params.set('dueDate', dueDate);
  }

  return this.http.get<Page<Task>>(`${this.apiUrl}/search`, { params });
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

  updateTaskStatusAndUser(taskId: number, updateData: updateTaskStatusAndUser): void {
    this.http.patch<void>(`${this.apiUrl}/${taskId}`, updateData).subscribe({
      next: () => {
        console.log('Task status and user updated successfully');
      },
      error: (error) => {
        console.error('Error updating task status and user:', error);
      }
    });
  }
}

