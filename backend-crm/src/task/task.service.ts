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
    // 1. Creamos la tarea solo con los textos y números
    const newTask = this.taskRepo.create({
      title: createTaskDto.title,
      description: createTaskDto.description, 
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
      status: createTaskDto.status || 'PENDIENTE',
      comment: createTaskDto.comment,
      estimatedHours: createTaskDto.estimatedHours || 0,
      actualHours: createTaskDto.actualHours || 0,
    });

    // 2. Atrapamos el ID sin importar cómo lo haya mandado el Frontend
    const clientId = createTaskDto.clientId || (createTaskDto.client?.id);
    const assignedToId = createTaskDto.assignedToId || (createTaskDto.assignedTo?.id);

    // 3. Inyectamos las relaciones de forma directa (esto nunca falla)
    if (clientId) {
      newTask.client = { id: clientId } as any;
    }
    
    if (assignedToId) {
      newTask.assignedTo = { id: assignedToId } as any;
    }

    // 4. Guardamos en la base de datos
    return this.taskRepo.save(newTask);
  }

  findAll() {
    return this.taskRepo.find({
      relations: ['client', 'assignedTo'], // Cargamos quien es el dueño y el responsable
      order: { dueDate: 'ASC' }
    });
  }

  findOne(id: string) {
    return this.taskRepo.findOne({
      where: { id },
      relations: ['client', 'assignedTo', 'attachments'] // Cargamos adjuntos también
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Tarea no encontrada');

    // Actualizamos campos simples
    if (updateTaskDto.title) task.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined) task.description = updateTaskDto.description;
    if (updateTaskDto.status) task.status = updateTaskDto.status;
    if (updateTaskDto.dueDate) task.dueDate = new Date(updateTaskDto.dueDate);
    if (updateTaskDto.comment !== undefined) task.comment = updateTaskDto.comment;
    
    // Actualizamos horas
    if (updateTaskDto.estimatedHours !== undefined) task.estimatedHours = updateTaskDto.estimatedHours;
    if (updateTaskDto.actualHours !== undefined) task.actualHours = updateTaskDto.actualHours;

    // Actualizamos responsable y cliente
    if (updateTaskDto.assignedToId) {
      task.assignedTo = { id: updateTaskDto.assignedToId } as any;
    }
    if (updateTaskDto.clientId) {
      task.client = { id: updateTaskDto.clientId } as any;
    }

    return this.taskRepo.save(task);
  }

  async remove(id: string) {
    const result = await this.taskRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Tarea no encontrada');
    return result;
  }
}