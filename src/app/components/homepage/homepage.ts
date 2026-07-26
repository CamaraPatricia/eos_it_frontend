import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/User';
import { UserService } from '../../../services/user-service';
import { ServiceTasks } from '../../../services/service-tasks';
import { Task } from '../../models/task';
import {DatePipe, CommonModule} from '@angular/common';
import { StatisticsService } from '../../../services/statistics-service';
import { StatisticsForUsers } from '../../models/statisticsForUsers';

@Component({
  selector: 'app-homepage',
  imports: [DatePipe, CommonModule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit {
  private taskService = inject(ServiceTasks);
  private statisticsService = inject(StatisticsService);

  user: User | null = null;
  tasks = signal<Task[]>([]);
  isInternalUser: boolean = false;

  protected usersStatistics = signal<StatisticsForUsers[]>([]);

  statistics = signal( {
  totalTasks: 0,

  completedTasks: 0,
  inProgressTasks: 0,
  notStartedTasks: 0,
  cancelledTasks: 0,

  completedPercentage: 0,
  inProgressPercentage: 0,
  notStartedPercentage: 0,
  cancelledPercentage: 0,
});

  showUsersStatistics= signal<boolean>(false);

  ngOnInit(): void {
    this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
    this.isInternalUser = this.user?.isInternal ?? false;

      let userId = 0;
      if(this.user){
        userId = this.user?.userId;
      }

      this.taskService.getTasksByUser(userId).subscribe(res => {
        this.tasks.set(res);
        this.updateStatistics();
        console.log('Tasks fetched:', res);
      });
  }

  private updateStatistics(): void {
  const tasks = this.tasks();

  const totalTasks = tasks.length;

  const completedTasks =
    tasks.filter(task => task.statusType === 'Completed').length;

  const inProgressTasks =
    tasks.filter(task => task.statusType === 'In Progress').length;

  const notStartedTasks =
    tasks.filter(task => task.statusType === 'Not Started').length;

  const cancelledTasks =
    tasks.filter(task => task.statusType === 'Cancelled').length;

  this.statistics.set({
    totalTasks,

    completedTasks,
    inProgressTasks,
    notStartedTasks,
    cancelledTasks,

    completedPercentage:
      this.calculatePercentage(completedTasks, totalTasks),

    inProgressPercentage:
      this.calculatePercentage(inProgressTasks, totalTasks),

    notStartedPercentage:
      this.calculatePercentage(notStartedTasks, totalTasks),

    cancelledPercentage:
      this.calculatePercentage(cancelledTasks, totalTasks),
  });

  console.log('Statistics updated:', this.statistics());
}

private calculatePercentage(value: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

protected toggleUsersStatistics(): void {
    this.showUsersStatistics.set(!this.showUsersStatistics());

    if (
       this.showUsersStatistics() &&
      this.isInternalUser &&
      this.usersStatistics().length === 0
    ) {
      this.loadUsersStatistics();
    }
  }

loadUsersStatistics(): void {
  if (this.isInternalUser && this.showUsersStatistics()) {
    this.statisticsService.getStatistics().subscribe(res => {
      this.usersStatistics.set(res);
    });
  }}
}
