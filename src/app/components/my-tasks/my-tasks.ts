import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceTasks } from '../../../services/service-tasks';
import { TaskCard } from '../task-card/task-card';
import { Task } from '../../models/task';

@Component({
  selector: 'app-my-tasks',
  imports: [CommonModule, TaskCard],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.css',
})
export class MyTasks implements OnInit {
  tasks = signal<Task[]>([]);
  private taskService = inject(ServiceTasks);

  ngOnInit(): void {
    console.log('MyTasks component initialized');
    this.loadTasks();
  }

  loadTasks(): void {
    console.log('Loading tasks...');

      this.taskService.getTasks().subscribe(res => {
      this.tasks.set([...res].sort(
          (task1, task2) =>
            new Date(task1.dueDate).getTime() -
            new Date(task2.dueDate).getTime()
        ));
    });
  }
}

