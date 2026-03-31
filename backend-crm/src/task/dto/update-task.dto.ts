import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  // Al extender de CreateTaskDto (donde ya agregamos subTasks), 
  // ya debería funcionar, pero esto asegura que sea opcional.
  subTasks?: any[];
}