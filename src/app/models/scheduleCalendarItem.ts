export interface AiScheduleResponse {
  tasks: AiScheduledTask[];
}

export interface AiScheduledTask {
  taskId: number;
  startDate: string;
  endDate: string;
  durationMinutes: number;
  overdue: boolean;
}

export interface ScheduleCalendarItem extends AiScheduledTask {
  taskName: string;
}
  
  