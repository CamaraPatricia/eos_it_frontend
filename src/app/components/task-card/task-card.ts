import { Component, EventEmitter, inject, Input, /* OnInit, */ Output, signal } from '@angular/core';
import { Task } from '../../models/task';
import { DatePipe } from '@angular/common';
import { ServiceTasks } from '../../../services/service-tasks';
import { Router } from '@angular/router';
import StatusType from '../../models/status-type';
import { StatusTypesService } from '../../../services/status-types-service';
import { CommonModule } from "@angular/common";
import HydratedTask from '../search/search';

const statusTypes = [
  "Cancelled",
  "In Progress",
  "Not Started",
  "Completed",
]
const colors = [
  "#fa4545",
  "#64edd4",
  "#edbe48",
  "#20bc5c",
]

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})

export class TaskCard {
  @Input() task!: Task | HydratedTask;
  @Input() canEditStatus: boolean | null = false;
  @Output() deleted = new EventEmitter<void>();

  private serviceTasks = inject(ServiceTasks);
  private router = inject(Router);
  private statusTypesService = inject(StatusTypesService);

  private statusUpdateTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentStatustype = signal<string | null>(null);
  private statusTypes = signal<StatusType[]>([]);
  overdue: boolean = false;

  protected isHydratedTask(task: Task | HydratedTask): task is HydratedTask {
    return 'username' in task;
  }

  ngOnInit(): void {
    this.currentStatustype.set(this.task?.statusType || null);

    this.statusTypesService.getStatusTypes().subscribe({
      next: (statusTypes) => {
        this.statusTypes.set(statusTypes);
      }
    });
  }

  editTask() {
    this.router.navigate(['/new-task', this.task?.id]);
  }

  deleteTask(): void {
    const taskId = this.task?.id;
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    this.serviceTasks.deleteTask(taskId).subscribe({
      next: () => {
        this.deleted.emit();
      }
    });
  }

  changeStatusType(): void {
    if (this.canEditStatus === false || !this.task) {
      return;
    }

    const task = this.task;

    const nextStatusTypeIndex =
      statusTypes.indexOf(task.statusType) + 1;

    task.statusType = statusTypes[nextStatusTypeIndex] || statusTypes[0];

    if (this.statusUpdateTimeout) {
      clearTimeout(this.statusUpdateTimeout);
    }

    this.statusUpdateTimeout = setTimeout(() => {
      if (this.task?.statusType !== this.currentStatustype()) {
        this.serviceTasks.updateTaskStatusAndUser(task.id, {
          statusId: (this.statusTypes().find(st => st.statusName === task.statusType)?.statusTypeId) || '',
          userId: task.userId
        });
      }
    }, 2000);
  }

  getStatusColor(status: string): string {
    const index = statusTypes.indexOf(status);
    return index !== -1 ? colors[index] : '#b76588';
  }

  getStatusBackground(status: string): string {
    const index = statusTypes.indexOf(status);
    return index !== -1 ? colors[index] + '33' : '#b76588' + '33'; // Adding '33' for 20% opacity
  }

  isOverdue(): boolean {
    return this.task ? new Date(this.task.dueDate) < new Date() : false;
  }
}
