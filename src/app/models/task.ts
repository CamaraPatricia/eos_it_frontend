export interface Task {
    id : number;
    taskName: string;
    dueDate: Date;
    statusTypeId: string;
    statusType: string;
    userId: number;
    lastUpdateDate: Date;
    lastUpdatedBy: string;
}