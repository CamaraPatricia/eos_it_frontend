import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceTasks } from '../../../services/service-tasks';
import { TaskCard } from '../task-card/task-card';
import { Task } from '../../models/task';
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
  imports: [CommonModule, FormsModule, TaskCard, AiSchedulePopup],
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
  protected items = input<ScheduleCalendarItem[]>(this.scheduleItems());
  protected scheduleOpen = signal(false);
  protected scheduleLoading = signal(false);
  protected scheduleError = signal<string | null>(null);

  protected visibleTasksCount = 6;
  protected visibleTasks = signal<Task[]>([]);
  protected seeMore : boolean = true;

  protected sortedTasks = signal<Task[]>([]);
  protected readonly taskSortingOptions = [
  { label: 'All', value: '' },
  { label: 'Statuses', value: 'Statuses' },
  { label: 'Task id', value: 'TaskId' },
  { label: 'Due Date', value: 'DueDate' },
  {label: 'Task Name', value: 'TaskName' }
];
  protected selectedFilter: string = '';

  
  protected finalTasks = signal<Task[]>([]);
  
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
      this.visibleTasks.set(this.tasks().slice(0, this.visibleTasksCount));
      this.setFinalTasks();
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

  protected seeMoreTasks(): void {
    if (this.seeMore) {
    this.visibleTasksCount += 6;
    this.visibleTasks.set(this.tasks().slice(0, this.visibleTasksCount));
    } else {
      this.visibleTasksCount - 6 < 6 ? this.visibleTasksCount = 6 : this.visibleTasksCount -= 6;
      this.visibleTasks.set(this.tasks().slice(0, this.visibleTasksCount));
    }

    this.seeMore = true;
    if( this.tasks().length == this.visibleTasks().length) {
      this.seeMore = false;
    }
    this.sortTasks();
    this.setFinalTasks();
  }

  protected sortTasks(): void {
    switch (this.selectedFilter) {
      case 'Statuses':
        this.sortedTasks.set([...this.visibleTasks()].sort((task1, task2) => {
          return task1.statusType.localeCompare(task2.statusType);
        }));
        break;
      case 'TaskId':
        this.sortedTasks.set([...this.visibleTasks()].sort((task1, task2) => {
          return task1.id - task2.id;
        }));
        break;
      case 'DueDate':
        this.sortedTasks.set([...this.visibleTasks()].sort((task1, task2) => {
          return new Date(task1.dueDate).getTime() - new Date(task2.dueDate).getTime();
        }));
        break;
      case 'TaskName':
        this.sortedTasks.set([...this.visibleTasks()].sort((task1, task2) => {
          return task1.taskName.localeCompare(task2.taskName);
        }));
        break;
      default:
        this.sortedTasks.set([...this.visibleTasks()]);
    }
    this.setFinalTasks();
  }

  protected setFinalTasks(): void {
    if (this.sortedTasks().length > 0) {
      this.finalTasks.set([...this.sortedTasks()]);
    } else {
      this.finalTasks.set([...this.visibleTasks()]);
    }
  }
}

