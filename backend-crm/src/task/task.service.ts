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
      description: createTaskDto.description, // Ahora sí existe en el DTO
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      status: 'PENDIENTE',
      
      // Mapeamos las horas
      estimatedHours: createTaskDto.estimatedHours || 0,
      actualHours: createTaskDto.actualHours || 0,

      // Relaciones
      client: { id: createTaskDto.clientId },
      // Si viene userId, lo convertimos a objeto User. Si no, null.
      assignedTo: createTaskDto.userId ? { id: createTaskDto.userId } : null,
    });
    
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
    
    // Actualizamos horas
    if (updateTaskDto.estimatedHours !== undefined) task.estimatedHours = updateTaskDto.estimatedHours;
    if (updateTaskDto.actualHours !== undefined) task.actualHours = updateTaskDto.actualHours;

    // Actualizamos responsable (userId -> assignedTo)
    if (updateTaskDto.userId) {
      task.assignedTo = { id: updateTaskDto.userId } as any;
    }

    return this.taskRepo.save(task);
  }

  async remove(id: string) {
    const result = await this.taskRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Tarea no encontrada');
    return result;
  }
}