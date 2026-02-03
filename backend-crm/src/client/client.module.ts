import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importante
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Client } from './entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client])], // <--- ESTO REGISTRA LA TABLA
  controllers: [ClientController],
  providers: [ClientService],
  exports: [TypeOrmModule] // Exportamos por si Tareas necesita consultar Clientes
})
export class ClientModule {}