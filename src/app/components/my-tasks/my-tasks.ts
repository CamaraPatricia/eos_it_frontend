import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceTasks } from '../../../services/service-tasks';
import { TaskCard } from '../task-card/task-card';
import { Task } from '../../models/task';
import { User } from '../../models/User';
import LocalStorageUtils from '../../utils/localStorageUtils';
import { LocalStorageUser } from '../../models/localStorageUser';

/**
 * MyTasks --> afiseaza task-urile utilizatorului curent, ordonate crescator dupa data de scadenta.
 * Ofera posibilitate de stergere/editare task
 */

@Component({
  selector: 'app-my-tasks',
  imports: [CommonModule, TaskCard],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.css',
})
export class MyTasks implements OnInit {
  tasks = signal<Task[]>([]);
  private taskService = inject(ServiceTasks);
  protected user = signal<LocalStorageUser | null>(null);

  ngOnInit(): void {
    console.log('MyTasks component initialized');
    this.user.set(JSON.parse(LocalStorageUtils.getItem(LocalStorageUtils.userKey) || 'null'));
    this.loadTasks();
  }

  loadTasks(): void {
    console.log('Loading tasks for current user...');

      this.taskService.getTasksByUser(this.user()?.userId || 0).subscribe(res => {
      this.tasks.set([...res].sort(
          (task1, task2) =>
            new Date(task1.dueDate).getTime() -
            new Date(task2.dueDate).getTime()
        ));
    });
  }
}

