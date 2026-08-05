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
  filteredTasks = signal<Task[]>([]);
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
  selectedStatuses: string[] = [];

  selectedUserId: number = 0;
  selectedDueDate: string = '';

  protected visibleTasksCount = 4;
  protected visibleTasks = signal<Task[]>([]);
  protected seeMore: boolean = true;

  protected sortedTasks = signal<Task[]>([]);
  protected readonly taskSortingOptions = [
    { label: 'All', value: '' },
    { label: 'Statuses', value: 'Statuses' },
    { label: 'Task id', value: 'TaskId' },
    { label: 'Due Date', value: 'DueDate' },
    { label: 'Task Name', value: 'TaskName' },
    { label: 'User Name', value: 'UserName' }
  ];
  protected selectedFilter: string = '';

  protected hidratedTasks = signal<HydratedTask[]>([]);

  ngOnInit(): void {
    this.user.set(JSON.parse(LocalStorageUtils.getItem(LocalStorageUtils.userKey) || 'null'));
    this.getTasks();
  }

  getTasks(): void {
    if (this.user()?.roleName === 'ADMIN') {
      this.taskService.getTasks().subscribe(res => {
        this.tasks.set(res);
        this.filteredTasks.set(res);
        this.setVisibleTasks(res);
      });
      this.userService.getUsers().subscribe(res => {
        this.users.set(res);
      });
    } else {
      const userId = this.user()?.userId;
      if (userId !== undefined) {
        this.taskService.getTasksByUser(userId).subscribe(res => {
          this.tasks.set(res);
          this.filteredTasks.set(res);
          this.setVisibleTasks(res);
        });
      }
      this.users.set([]);
    }
  }

  searchTasks(): void {
    const selectedStatuses = this.getSelectedStatuses();

    if (this.user()?.roleName === 'ADMIN' && this.selectedUserId !== 0) {
      this.taskService
        .getTasksByUser(this.selectedUserId)
        .subscribe(res => {
          this.filteredTasks.set(this.filterTasks(res, selectedStatuses));
          this.setVisibleTasks(this.filteredTasks());
        });

      return;
    }

    this.filteredTasks.set(
      this.filterTasks(this.tasks(), selectedStatuses)
    );
    this.setVisibleTasks(this.filteredTasks());
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
    this.setVisibleTasks(this.filteredTasks());
  }

  protected seeMoreTasks(): void {
    if (this.seeMore) {
      this.visibleTasksCount += 4;
      this.setVisibleTasks((this.sortedTasks().length != 0) ? this.sortedTasks() : this.filteredTasks());
    } else {
      this.visibleTasksCount = 4;
      this.setVisibleTasks((this.sortedTasks().length != 0) ? this.sortedTasks() : this.filteredTasks());
    }

    this.seeMore = true;
    if (this.filteredTasks().length == this.visibleTasks().length) {
      this.seeMore = false;
    }
    this.sortTasks();
  }

  protected sortTasks(): void {
    switch (this.selectedFilter) {
      case 'Statuses':
        this.sortedTasks.set([...this.filteredTasks()].sort((task1, task2) => {
          return task1.statusType.localeCompare(task2.statusType);
        }));
        break;
      case 'TaskId':
        this.sortedTasks.set([...this.filteredTasks()].sort((task1, task2) => {
          return task1.id - task2.id;
        }));
        break;
      case 'DueDate':
        this.sortedTasks.set([...this.filteredTasks()].sort((task1, task2) => {
          return new Date(task1.dueDate).getTime() - new Date(task2.dueDate).getTime();
        }));
        break;
      case 'TaskName':
        this.sortedTasks.set([...this.filteredTasks()].sort((task1, task2) => {
          return task1.taskName.localeCompare(task2.taskName);
        }));
        break;
      case 'UserName':
        this.sortedTasks.set([...this.filteredTasks()].sort((task1, task2) => {
          return task1.userId - task2.userId;
        }));
        break;
      default:
        this.sortedTasks.set([...this.filteredTasks()]);
    }
    this.setVisibleTasks(this.sortedTasks());
  }

  protected setVisibleTasks(tasksForVisible: Task[]): void {
    this.visibleTasks.set(tasksForVisible.slice(0, this.visibleTasksCount));
    this.hydrateTasks();
  }

  protected hydrateTasks(): void{
    this.hidratedTasks.set(this.visibleTasks().map(task => {
      const user = this.users().find(u => u.userId === task.userId);
      return {
        ...task,
        username: user ? user.username : 'Not specified'
      };
    }));
  }
}