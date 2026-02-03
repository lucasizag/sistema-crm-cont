import { Injectable } from '@nestjs/common';
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

  // CORREGIDO: id es string
  update(id: string, updateClientDto: UpdateClientDto) {
    return `Update logic here for #${id}`;
  }

  // CORREGIDO: id es string
  remove(id: string) {
    return `Delete logic here for #${id}`;
  }
}