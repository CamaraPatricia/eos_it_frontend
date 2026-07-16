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
  selectedUserId: number = 0;

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(res => {
      this.tasks.set(res);
    });
    this.userService.getUsers().subscribe(res => {
      this.users.set(res);
    });
  }

  searchTasks(): void {
    this.filteredTasks.set(this.tasks().filter(task => {
      const matchesTaskName = this.taskName ? task.taskName.toLowerCase().includes(this.taskName.toLowerCase()) : true;
      const matchesUserId = this.selectedUserId ? task.userId === this.selectedUserId : true;
      return matchesTaskName && matchesUserId;
    }));
  }
}
