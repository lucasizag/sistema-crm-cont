import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static'; // <--- IMPORTANTE
import { join } from 'path'; // <--- IMPORTANTE
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './client/client.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';
import { NoteModule } from './note/note.module';
import { AttachmentModule } from './attachment/attachment.module';

@Module({
  imports: [
    // --- ESTO PERMITE QUE LA CARPETA 'UPLOADS' SEA PÚBLICA ---
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Busca la carpeta uploads en la raiz
      serveRoot: '/uploads', // La URL será http://tusitio.com/uploads/archivo.pdf
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://neondb_owner:npg_Xj8xkWyT5gfh@ep-polished-dew-acp8cmqk-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
    }),
    ClientModule,
    TaskModule,
    UserModule,
    NoteModule,
    AttachmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}