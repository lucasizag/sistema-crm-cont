export class CreateTaskDto {
  title: string;
  description?: string;
  status?: string;
  
  // --- LOS CAMPOS NUEVOS QUE AGREGAMOS ---
  dueDate?: Date | string;
  estimatedHours?: number;
  actualHours?: number;
  comment?: string;

  // --- LAS RELACIONES ---
  client?: any;
  assignedTo?: any;
  clientId?: string;
  assignedToId?: string;
  condition?: string;

  assistantDeadline?: string | Date;
}