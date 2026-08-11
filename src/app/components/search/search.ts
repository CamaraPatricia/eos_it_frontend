import { Component, inject, signal } from '@angular/core';
import { Task } from '../../models/task';
import { ServiceTasks } from '../../../services/service-tasks';
import { User } from '../../models/User';
import { UserService } from '../../../services/user-service';
import { TaskCard } from '../task-card/task-card';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import LocalStorageUtils from '../../utils/localStorageUtils';
import { LocalStorageUser } from '../../models/localStorageUser';

export default interface HydratedTask extends Task {
  username: string;
}

@Component({
  selector: 'app-search',
  imports: [TaskCard, CommonModule, FormsModule],
  standalone: true,
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search {
  tasks = signal<Task[]>([]);
  users = signal<User[]>([]);
  user = signal<LocalStorageUser | null>(null);

  private taskService = inject(ServiceTasks);
  private userService = inject(UserService);

  taskName: string = '';
  selectedStatusOptions = {
    cancelled: false,
    inProgress: false,
    notStarted: false,
    completed: false
  };
  selectedUserId: number = 0;
  selectedDueDate: string = '';

  //Pagination
  protected currentPage = signal<number>(0);
  protected readonly pageSize = 6;
  protected totalPages = signal<number>(0);
  protected totalTasks: number = 0;

  // sortare
  protected readonly taskSortingOptions = [
    { label: 'All', value: '' },
    { label: 'Statuses', value: 'statusType' },
    { label: 'Task id', value: 'taskId' },
    { label: 'Due Date', value: 'dueDate' },
    { label: 'Task Name', value: 'name' },
    { label: 'Users', value: 'user.userId' }
  ];
  protected selectedFilter: string = '';

  protected hidratedTasks = signal<HydratedTask[]>([]);

  ngOnInit(): void {
    this.user.set(JSON.parse(LocalStorageUtils.getItem(LocalStorageUtils.userKey) || 'null'));
    if (this.user()?.roleName === 'ADMIN') {
      this.loadUsers();
    }

    this.searchTasks();
  }

  private loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.hydrateTasks();
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  protected searchTasks(): void {
    this.currentPage.set(0);
    this.loadFilteredTasks();
  }

  private loadFilteredTasks(): void {

    const currentUserId = this.user()?.userId;

    if (currentUserId === undefined) {
      return;
    }

    const statusType = this.getSelectedStatuses();

    const userId = this.user()?.roleName === 'ADMIN' ? this.selectedUserId : currentUserId;

    this.taskService.getFilteredTasks(
      this.taskName.trim(),
      statusType,
      userId,
      this.selectedDueDate,
      this.currentPage(),
      this.pageSize,
      this.selectedFilter
    ).subscribe({
      next: (response) => {
        this.tasks.set(response.content);
        this.totalPages.set(response.totalPages);
        this.totalTasks = response.totalElements;

        if (this.user()?.roleName === 'ADMIN') {
          this.hydrateTasks();
        }
      },

      error: (error) => {
        console.error('Error loading filtered tasks:', error);
      }
    });
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

    this.selectedFilter = '';
    this.currentPage.set(0);

    this.loadFilteredTasks();
  }

  protected sortTasks(): void {
    this.currentPage.set(0);
    this.loadFilteredTasks();
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(page => page + 1);
      this.loadFilteredTasks();
    }
  }

  protected previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(page => page - 1);
      this.loadFilteredTasks();
    }
  }

  protected hydrateTasks(): void {
    this.hidratedTasks.set(this.tasks().map(task => {
      const user = this.users().find(u => u.userId === task.userId);
      return {
        ...task,
        username: user ? user.username : 'Not specified'
      };
    }));
  }
}