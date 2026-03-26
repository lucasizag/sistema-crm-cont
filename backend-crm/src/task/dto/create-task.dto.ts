export class CreateTaskDto {
  title: string;
  description?: string;
  status?: string;
  
  dueDate?: Date | string;
  assistantDeadline?: string | Date; 
  comment?: string;

  clientId?: string;
  assignedToId?: string;
  condition?: string;
}