export interface Task{
    id: number;
    taskName: string;
    statusTypeId: string;
    statusType: string;
    userId: number;
    dueDate: Date;
    creationDate: Date;
    createdBy: string;
    lastUpdateDate: Date;
    lastUpdatedBy: string;
    createdByFullname: string;
}
