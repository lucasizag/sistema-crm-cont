import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  create(createUserDto: CreateUserDto) {
    const newUser = this.userRepo.create(createUserDto);
    return this.userRepo.save(newUser);
  }

  findAll() {
    return this.userRepo.find();
  }

  findOne(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  // Agregamos update para que el controlador no se queje
  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.userRepo.update(id, updateUserDto);
  }

  // Agregamos remove para que el controlador no se queje
  async remove(id: string) {
    return this.userRepo.delete(id);
  }
}