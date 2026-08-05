import { Component, inject , signal, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceTasks } from '../../../services/service-tasks';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateTask } from '../../models/createTask';
import { UserService } from '../../../services/user-service';
import { User } from '../../models/User';
import {CommonModule} from "@angular/common";
import { RouterLink } from '@angular/router';
import LocalStorageUtils from '../../utils/localStorageUtils';
import { LocalStorageUser } from '../../models/localStorageUser';

@Component({
  selector: 'app-new-task',
  imports: [CommonModule, FormsModule, RouterLink],
  standalone: true,
  templateUrl: './new-task.html',
  styleUrl: './new-task.css',
})
export class NewTask implements OnInit {
  private taskService = inject(ServiceTasks);
  private userService = inject(UserService);

  protected user = signal<LocalStorageUser | null>(null);
  
  private router = inject(Router);
  private route = inject(ActivatedRoute); 

  taskId = signal<number | null>(null);
  isEditMode = false;
  users = signal<User[]>([]);

  newTask = signal<CreateTask>({
    taskName: '',
    description: '',
    userId: 0,
    dueDate: new Date(),
  });

  ngOnInit(): void {
    this.user.set(JSON.parse(LocalStorageUtils.getItem(LocalStorageUtils.userKey) || 'null'));

    const idFromRoute = this.route.snapshot.paramMap.get('id');

    if (idFromRoute) {
      this.taskId.set(Number(idFromRoute));
      this.isEditMode = true;

      this.loadTask(this.taskId()!);
    } else {
      this.newTask.set({
        taskName: '',
        description: '',
        userId: this.user()?.userId || 0,
        dueDate: new Date(),
      });
    }

    // Fetch users only if the current user is internal
    if (this.user()?.roleName === 'ADMIN') {
      this.fetchUsers();
    }
  }

  loadTask(taskId: number): void {
    this.taskService.getTaskById(taskId).subscribe({
      next: task => {
        this.newTask.set({
          taskName: task.taskName,
          description: task.description,
          userId: task.userId,
          dueDate: task.dueDate,
        });
      },
      error: error => {
        console.error('Task could not be loaded:', error);
      },
    });
  }

  saveTask(): void {
    if (this.isEditMode && this.taskId() !== null) {
      this.taskService.updateTask(this.taskId()!, this.newTask()).subscribe({
        next: () => {
          this.router.navigate(['/my-tasks']);
        },
        error: error => {
          console.error('Task could not be updated:', error);
        },
      });
    } else {
      if(this.user()?.roleName !== 'ADMIN'){
        this.newTask().userId = this.user()?.userId || 0;
      }
      this.taskService.createTask(this.newTask()).subscribe({
        next: () => {
          this.router.navigate(['/my-tasks']);
        },
        error: error => {
          console.error('Task could not be created:', error);
        },
      });
    }
  }

  fetchUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users.set(users);
      },
      error: error => {
        console.error('Error fetching users:', error);
      }
    });
  }
}

