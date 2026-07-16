import { Component, inject, OnInit } from '@angular/core';
import { ServiceTasks } from '../../../services/service-tasks';

@Component({
  selector: 'app-homepage',
  imports: [],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit {
  tasks: any[] = [];
  private taskService = inject(ServiceTasks);

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(res => {
      this.tasks = res;
    });
  }
}
