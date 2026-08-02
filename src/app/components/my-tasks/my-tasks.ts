import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceTasks } from '../../../services/service-tasks';
import { TaskCard } from '../task-card/task-card';
import { Task } from '../../models/task';
import { User } from '../../models/User';
import LocalStorageUtils from '../../utils/localStorageUtils';
import { LocalStorageUser } from '../../models/localStorageUser';
import { finalize } from 'rxjs';
import { AiService } from '../../../services/ai-service';
import {
  AiScheduleResponse,
  ScheduleCalendarItem,
} from '../../models/scheduleCalendarItem';
import { AiSchedulePopup } from '../../components/ai-schedule-popup/ai-schedule-popup';

/**
 * MyTasks --> afiseaza task-urile utilizatorului curent, ordonate crescator dupa data de scadenta.
 * Ofera posibilitate de stergere/editare task
 */

@Component({
  selector: 'app-my-tasks',
  imports: [CommonModule, TaskCard, AiSchedulePopup],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.css',
})
export class MyTasks implements OnInit {
  tasks = signal<Task[]>([]);
  private taskService = inject(ServiceTasks);
  protected user = signal<LocalStorageUser | null>(null);

  // AI Schedule
  private readonly aiService = inject(AiService);

protected scheduleItems = signal<ScheduleCalendarItem[]>([]);
protected scheduleOpen = signal(false);
protected scheduleLoading = signal(false);
protected scheduleError = signal<string | null>(null);

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

  // AI Schedule
  protected generateSchedule(): void {
  if (this.scheduleLoading()) {
    return;
  }

  this.scheduleLoading.set(true);
  this.scheduleError.set(null);

  this.aiService
    .generateSchedule()
    .pipe(
      finalize(() => {
        this.scheduleLoading.set(false);
      })
    )
    .subscribe({
      next: (response: AiScheduleResponse) => {
        const taskNamesById = new Map<number, string>(
          this.tasks().map((task) => [
            task.id,
            task.taskName,
          ])
        );

        const enrichedSchedule: ScheduleCalendarItem[] =
          response.tasks.map((scheduledTask) => ({
            ...scheduledTask,
            taskName:
              taskNamesById.get(scheduledTask.taskId) ??
              `Task #${scheduledTask.taskId}`,
          }));

        this.scheduleItems.set(enrichedSchedule);
        this.scheduleOpen.set(true);
      },

      error: (error) => {
        console.error('Schedule generation failed:', error);

        this.scheduleError.set(
          'Programul nu a putut fi generat. Verifică dacă serviciul AI este pornit.'
        );
      },
    });
}

protected closeSchedule(): void {
  this.scheduleOpen.set(false);
}
}

