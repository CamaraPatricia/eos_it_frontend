export interface Task{
    id: number;
    taskName: string;
    statusTypeId: string;
    description: string;
    statusType: string;
    userId: number;
    dueDate: Date;
    creationDate: Date;
    createdBy: string;
    lastUpdateDate: Date;
    lastUpdatedBy: string;
    createdByFullname: string;
}
