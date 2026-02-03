import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- Importante
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity'; // <--- Importamos la entidad

@Module({
  // AQUI ESTA LA MAGIA: Registramos la entidad para que el servicio pueda usarla
  imports: [TypeOrmModule.forFeature([User])], 
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService] // Exportamos por si otros módulos lo necesitan
})
export class UserModule {}