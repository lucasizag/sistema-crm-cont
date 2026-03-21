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
      // ¡OJO! Reemplaza esto con tu link real y tu contraseña real
      url: 'postgresql://postgres.tevjgpnsortconzytfzu:ZDAAg7KyWVbXon9k@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
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