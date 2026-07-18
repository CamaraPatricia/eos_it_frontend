import { Component, inject, signal } from '@angular/core';
import { Task } from '../../models/task';
import { ServiceTasks } from '../../../services/service-tasks';
import { User } from '../../models/User';
import { UserService } from '../../../services/user-service';
import {TaskCard} from '../task-card/task-card';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";


@Component({
  selector: 'app-search',
  imports: [TaskCard, CommonModule, FormsModule],
  standalone: true,
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search {
  tasks = signal<Task[]>([]);
  filteredTasks = signal<Task[]>([]);
  users = signal<User[]>([]);

  private taskService = inject(ServiceTasks);
  private userService = inject(UserService);

  taskName: string = '';
  selectedStatusOptions = {
    cancelled: false,
    inProgress: false,
    notStarted: false,
    completed: false
  };
  selectedStatuses: string[] = [];

  selectedUserId: number = 0;
  selectedDueDate: string = '';

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(res => {
      this.tasks.set(res);
      this.filteredTasks.set(res);
    });
    this.userService.getUsers().subscribe(res => {
      this.users.set(res);
    });
  }

  searchTasks(): void {

     const selectedStatuses = this.getSelectedStatuses();

    if (this.selectedUserId !== 0) {
      this.taskService
        .getTasksByUser(this.selectedUserId)
        .subscribe(res => {
          this.filteredTasks.set(this.filterTasks(res, selectedStatuses));
        });
      
      return;
    }

      this.filteredTasks.set(
      this.filterTasks(this.tasks(), selectedStatuses)
    );
  }
    
  private getSelectedStatuses(): string[] {
    const statuses: string[] = [];

    if (this.selectedStatusOptions.cancelled) {
      statuses.push('Cancelled');
    }

    if (this.selectedStatusOptions.inProgress) {
      statuses.push('In Progress');
    }

    if (this.selectedStatusOptions.notStarted) {
      statuses.push('Not Started');
    }

    if (this.selectedStatusOptions.completed) {
      statuses.push('Completed');
    }

    return statuses;
  }

  private filterTasks(tasks: Task[], selectedStatuses: string[]): Task[] {
    const searchedName = this.taskName.trim().toLowerCase();

    return tasks.filter(task => {
      const matchesTaskName =
        searchedName.length === 0 ||
        task.taskName.toLowerCase().includes(searchedName);

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.some(status =>
          task.statusType.toLowerCase() === status.toLowerCase()
        );

      const taskDueDate = new Date(task.dueDate)
  .toISOString()
  .split('T')[0];
  console.log('Task Due Date:', taskDueDate);
  console.log('Selected Due Date:', this.selectedDueDate);

const matchesDueDate =
  !this.selectedDueDate ||
  taskDueDate <= this.selectedDueDate;
      return (
        matchesTaskName &&
        matchesStatus &&
        matchesDueDate
      );
    });
  }

    clearFilters(): void {
    this.selectedUserId = 0;
    this.taskName = '';
    this.selectedDueDate = '';

    this.selectedStatusOptions = {
      cancelled: false,
      inProgress: false,
      notStarted: false,
      completed: false
    };

    this.filteredTasks.set(this.tasks());
  }

  
  
}

