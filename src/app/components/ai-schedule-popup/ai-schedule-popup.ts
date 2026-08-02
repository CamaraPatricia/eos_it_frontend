import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleCalendarItem } from '../../models/scheduleCalendarItem';

interface CalendarTask extends ScheduleCalendarItem {
  order: number;
}

interface CalendarDay {
  key: string;
  date: Date;
  weekDay: string;
  dateLabel: string;
  tasks: CalendarTask[];
}

@Component({
  selector: 'app-ai-schedule-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-schedule-popup.html',
  styleUrl: './ai-schedule-popup.css',
})
export class AiSchedulePopup implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true })
  schedule: ScheduleCalendarItem[] = [];

  @Output()
  closed = new EventEmitter<void>();

  protected calendarDays: CalendarDay[] = [];
  protected rangeLabel = '';

  private previousBodyOverflow = '';

  ngOnInit(): void {
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['schedule']) {
      this.buildCalendar();
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.previousBodyOverflow;
  }

  protected close(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  protected closeWithEscape(): void {
    this.close();
  }

  protected formatTime(dateString: string): string {
    return new Intl.DateTimeFormat('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  }

  protected durationLabel(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes} min`;
    }

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}min`;
  }

  private buildCalendar(): void {
    if (!this.schedule?.length) {
      this.calendarDays = [];
      this.rangeLabel = '';
      return;
    }

    const orderedTasks: CalendarTask[] = [...this.schedule]
      .sort(
        (firstTask, secondTask) =>
          new Date(firstTask.startDate).getTime() -
          new Date(secondTask.startDate).getTime()
      )
      .map((task, index) => ({
        ...task,
        order: index + 1,
      }));

    const firstDate = this.startOfDay(
      new Date(orderedTasks[0].startDate)
    );

    const lastDate = this.startOfDay(
      new Date(orderedTasks[orderedTasks.length - 1].endDate)
    );

    const rangeFormatter = new Intl.DateTimeFormat('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    this.rangeLabel =
      `${rangeFormatter.format(firstDate)} - ` +
      `${rangeFormatter.format(lastDate)}`;

    const days: CalendarDay[] = [];

    let currentDate = new Date(firstDate);

    while (currentDate <= lastDate) {
      const dayDate = new Date(currentDate);

      const tasksForDay = orderedTasks.filter((task) =>
        this.isSameDay(new Date(task.startDate), dayDate)
      );

      days.push({
        key: this.toDateKey(dayDate),
        date: dayDate,
        weekDay: new Intl.DateTimeFormat('ro-RO', {
          weekday: 'long',
        }).format(dayDate),
        dateLabel: new Intl.DateTimeFormat('ro-RO', {
          day: '2-digit',
          month: 'short',
        }).format(dayDate),
        tasks: tasksForDay,
      });

      currentDate = this.addDays(currentDate, 1);
    }

    this.calendarDays = days;
  }

  private startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);

    return result;
  }

  private addDays(date: Date, numberOfDays: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + numberOfDays);

    return result;
  }

  private isSameDay(firstDate: Date, secondDate: Date): boolean {
    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
    );
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  protected get totalDuration(): number {
  return this.schedule.reduce(
    (total, task) => total + task.durationMinutes,
    0
  );
}
}