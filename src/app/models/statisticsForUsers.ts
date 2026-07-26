import { User } from "./User";

export interface StatisticsForUsers {
    user: User,
    totalTasks: number,
    completedTasks: number,
    inProgressTasks: number,
    notStartedTasks: number,
    cancelledTasks: number
}