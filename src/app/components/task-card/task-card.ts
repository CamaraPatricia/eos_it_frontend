import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Task } from '../../models/task';
import {DatePipe} from '@angular/common';
import { ServiceTasks } from '../../../services/service-tasks';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard{ 
  @Input() task!: Task;
  @Output() deleted = new EventEmitter<void>();

  private serviceTasks = inject(ServiceTasks);
  private router = inject(Router);

  editTask() {
    this.router.navigate(['/new-task', this.task.id]);  
  }

  deleteTask(): void {
    this.serviceTasks.deleteTask(this.task.id).subscribe({
      next: () => {
        this.deleted.emit();
      }
    });
  }
}
