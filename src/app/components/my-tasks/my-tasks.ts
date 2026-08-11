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
  {label: 'Task Name', value: 'name' }
];
  protected selectedFilter: string = '';
  
  ngOnInit(): void {
    console.log('MyTasks component initialized');
    this.user.set(JSON.parse(LocalStorageUtils.getItem(LocalStorageUtils.userKey) || 'null'));
    this.loadTasks();
  }

  loadTasks(): void {
    const userId = this.user()?.userId;

    if (!userId) {
      return;
    }

    console.log(
      `Loading page ${this.currentPage()} with sort ${this.selectedFilter}`
    );

    this.taskService
      .getPaginatedTasks(
        userId,
        this.currentPage(),
        this.pageSize,
        this.selectedFilter
      )
      .subscribe({
        next: (response) => {
          this.tasks.set(response.content);
          this.totalPages.set(response.totalPages);
          this.totalTasks = response.totalElements;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
        }
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

  protected sortTasks(): void {
    this.currentPage.set(0);
    this.loadTasks();
  }


  protected nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(page => page + 1);
      this.loadTasks();
    }
  }


  protected previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(page => page - 1);
      this.loadTasks();
    }
  }
}

