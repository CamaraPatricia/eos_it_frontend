import { Component, inject , signal, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceTasks } from '../../../services/service-tasks';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateTask } from '../../models/createTask';
import { UserService } from '../../../services/user-service';
import { User } from '../../models/User';
import {CommonModule} from "@angular/common";
import { RouterLink } from '@angular/router';

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
  
  private router = inject(Router);
  private route = inject(ActivatedRoute); 

  taskId: number | null = null;
  isEditMode = false;
  users = signal<User[]>([]);

  newTask: CreateTask = {
    taskName: '',
    userId: 0,
    dueDate: new Date(),
  };

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id');

    if (idFromRoute) {
      this.taskId = Number(idFromRoute);
      this.isEditMode = true;

      this.loadTask(this.taskId);
    }

    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users.set(users);
      },
      error: error => {
        console.error('Error fetching users:', error);
      }
    });
    
  }

  loadTask(taskId: number): void {
    this.taskService.getTaskById(taskId).subscribe({
      next: task => {
        this.newTask = {
          taskName: task.taskName,
          userId: task.userId,
          dueDate: task.dueDate,
        };
      },
      error: error => {
        console.error('Task could not be loaded:', error);
      },
    });
  }

  saveTask(): void {
    if (this.isEditMode && this.taskId !== null) {
      this.taskService.updateTask(this.taskId, this.newTask).subscribe({
        next: () => {
          this.router.navigate(['/my-tasks']);
        },
        error: error => {
          console.error('Task could not be updated:', error);
        },
      });
    } else {
      this.taskService.createTask(this.newTask).subscribe({
        next: () => {
          this.router.navigate(['/my-tasks']);
        },
        error: error => {
          console.error('Task could not be created:', error);
        },
      });
    }
  }
}

