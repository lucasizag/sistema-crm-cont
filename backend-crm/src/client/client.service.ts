import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client) private clientRepo: Repository<Client>,
  ) {}

  create(createClientDto: CreateClientDto) {
    const newClient = this.clientRepo.create(createClientDto);
    return this.clientRepo.save(newClient);
  }

  findAll() {
    return this.clientRepo.find({ relations: ['tasks'] });
  }

  findOne(id: string) {
    return this.clientRepo.findOne({ 
      where: { id }, 
      // Solo cargamos tareas y sus responsables. NO cargamos attachments ni notes aquí para no hacerlo pesado.
      relations: ['tasks', 'tasks.assignedTo'], 
      order: {
        tasks: {
          dueDate: 'ASC'
        }
      }
    });
  }

  // --- LOGICA DE ACTUALIZAR ARREGLADA ---
  async update(id: string, updateClientDto: UpdateClientDto) {
    // 1. Actualizamos en la base de datos
    await this.clientRepo.update(id, updateClientDto);
    // 2. Devolvemos el cliente actualizado para que el Frontend lo vea
    return this.clientRepo.findOne({ where: { id } });
  }

  // --- LOGICA DE ELIMINAR ARREGLADA ---
  async remove(id: string) {
    const client = await this.clientRepo.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`El cliente con id ${id} no existe`);
    }
    await this.clientRepo.remove(client);
    return { message: 'Cliente eliminado exitosamente' };
  }
}