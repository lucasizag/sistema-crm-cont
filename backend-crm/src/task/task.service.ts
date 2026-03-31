import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  constructor(@InjectRepository(Task) private taskRepo: Repository<Task>) {}

  async create(createTaskDto: CreateTaskDto) {
    const newTask = this.taskRepo.create({
      title: createTaskDto.title,
      description: createTaskDto.description, 
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      assistantDeadline: createTaskDto.assistantDeadline ? new Date(createTaskDto.assistantDeadline) : null,
      createdAt: createTaskDto.createdAt ? new Date(createTaskDto.createdAt) : new Date(), // <--- ESTA LÍNEA NUEVA
      status: createTaskDto.status || 'PENDIENTE',
      comment: createTaskDto.comment,
      subTasks: createTaskDto.subTasks || [],
    });

    // 2. Atrapamos el ID directamente (SIN intentar buscar el objeto)
    const clientId = createTaskDto.clientId;
    const assignedToId = createTaskDto.assignedToId;

    // 3. Inyectamos las relaciones
    if (clientId) newTask.client = { id: clientId } as any;
    if (assignedToId) newTask.assignedTo = { id: assignedToId } as any;

    return this.taskRepo.save(newTask);
  }

  findAll() {
    return this.taskRepo.find({
      relations: ['client', 'assignedTo'], 
      order: { dueDate: 'ASC' }
    });
  }

  findOne(id: string) {
    return this.taskRepo.findOne({
      where: { id },
      relations: ['client', 'assignedTo', 'attachments'] 
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Tarea no encontrada');

    if (updateTaskDto.title) task.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined) task.description = updateTaskDto.description;
    if (updateTaskDto.status) task.status = updateTaskDto.status;
    
    // Guardado seguro de fechas (acepta null si el usuario decide borrarla)
    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
    }
    if (updateTaskDto.assistantDeadline !== undefined) {
      task.assistantDeadline = updateTaskDto.assistantDeadline ? new Date(updateTaskDto.assistantDeadline) : null;
    }

    if (updateTaskDto.comment !== undefined) task.comment = updateTaskDto.comment;
    if (updateTaskDto.condition) task.condition = updateTaskDto.condition;
    
    // Actualizamos responsable y cliente
    if (updateTaskDto.assignedToId !== undefined) {
      task.assignedTo = updateTaskDto.assignedToId ? { id: updateTaskDto.assignedToId } as any : null;
    }
    if (updateTaskDto.clientId !== undefined) {
      task.client = updateTaskDto.clientId ? { id: updateTaskDto.clientId } as any : null;
    }

    return this.taskRepo.save(task);
  }

  async remove(id: string) {
    const result = await this.taskRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Tarea no encontrada');
    return result;
  }
}